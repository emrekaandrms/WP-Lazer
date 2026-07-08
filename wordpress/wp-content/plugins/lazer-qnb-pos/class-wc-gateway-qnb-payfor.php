<?php
/**
 * QNB Finansbank (PayFor) direct 3D Secure gateway for WooCommerce.
 *
 * Primary flow is HEADLESS (used by the branded Next.js checkout, never shows any
 * WordPress-themed page to the customer):
 *  1. POST /wp-json/wp-lzer/v1/qnb/checkout (see headless-cli.php) creates the WC_Order
 *     and calls generate_3d_form_for_order() to get the bank's 3D Secure form data.
 *  2. The Next.js frontend auto-submits that form via JS, sending the browser DIRECTLY
 *     to the bank's own 3D Secure page (this hop is required by the 3D Secure protocol
 *     itself and cannot be skipped — every merchant, including hosted-checkout SaaS
 *     providers, sends the customer to the issuing bank's own OTP page).
 *  3. Customer completes 3D Secure (OTP) on the bank's page.
 *  4. Bank POSTs back to /wp-json/wp-lzer/v1/qnb-return (registered below) — this path
 *     is guaranteed to boot WordPress under this host's .htaccess rules, unlike a bare
 *     `/?wc-api=...` URL which the static export would swallow before PHP ever runs.
 *  5. finalize_from_return() verifies the payment and marks the order paid/failed, then
 *     redirects the browser back to a branded Next.js page (order-received or checkout).
 *
 * The classic WC_Payment_Gateway methods (process_payment/render_redirect_form/
 * handle_bank_return) are kept only so this remains a fully valid WooCommerce gateway
 * (needed for admin refunds, is_available gating, etc.) — real customers never hit them.
 */

use Mews\Pos\Factory\AccountFactory;
use Mews\Pos\Factory\CreditCardFactory;
use Mews\Pos\Factory\PosFactory;
use Mews\Pos\PosInterface;

if (!defined('ABSPATH')) {
    exit;
}

class WC_Gateway_QNB_PayFor extends WC_Payment_Gateway
{
    /** @var bool */
    private $test_mode;

    public function __construct()
    {
        $this->id                 = 'qnb_payfor';
        $this->icon               = '';
        $this->has_fields         = true;
        $this->method_title       = 'QNB Finansbank Sanal POS (Dogrudan)';
        $this->method_description = 'QNB Finansbank PayFor altyapisi ile dogrudan 3D Secure odeme. Kimlik bilgileri wp-config.php sabitlerinden okunur.';
        $this->supports           = ['products', 'refunds'];

        $this->test_mode = !defined('QNB_PAYFOR_TEST_MODE') || QNB_PAYFOR_TEST_MODE;

        $this->init_form_fields();
        $this->init_settings();

        $this->title       = $this->get_option('title', 'Kredi / Banka Kartı');
        $this->description = $this->get_option(
            'description',
            'Visa, Mastercard ve taksit secenekleriyle 3D Secure guvenceli odeme.'
        );
        $this->enabled = $this->credentials_configured() ? $this->get_option('enabled', 'yes') : 'no';

        add_action('woocommerce_update_options_payment_gateways_' . $this->id, [$this, 'process_admin_options']);
        add_action('woocommerce_receipt_' . $this->id, [$this, 'render_redirect_form']);
        add_action('woocommerce_api_wc_gateway_qnb_payfor', [$this, 'handle_bank_return']);
    }

    public function init_form_fields()
    {
        // Only a UI on/off + display copy is exposed here on purpose — the bank secrets
        // live in wp-config.php constants, never in the WooCommerce settings DB row.
        $this->form_fields = [
            'enabled' => [
                'title'   => 'Etkinlestir',
                'type'    => 'checkbox',
                'label'   => 'QNB Finansbank Sanal POS ile odemeyi etkinlestir',
                'default' => 'yes',
            ],
            'title' => [
                'title'       => 'Baslik',
                'type'        => 'text',
                'description' => 'Odeme sayfasinda musteriye gosterilen baslik.',
                'default'     => 'Kredi / Banka Kartı',
            ],
            'description' => [
                'title'       => 'Aciklama',
                'type'        => 'textarea',
                'description' => 'Odeme sayfasinda musteriye gosterilen aciklama.',
                'default'     => 'Visa, Mastercard ve taksit secenekleriyle 3D Secure guvenceli odeme.',
            ],
        ];
    }

    public function credentials_configured(): bool
    {
        return defined('QNB_MERCHANT_ID') && QNB_MERCHANT_ID
            && defined('QNB_USER_CODE') && QNB_USER_CODE
            && defined('QNB_USER_PASSWORD') && QNB_USER_PASSWORD
            && defined('QNB_3D_MERCHANT_KEY') && QNB_3D_MERCHANT_KEY;
    }

    /**
     * Staged live rollout: while QNB_PAYFOR_ADMIN_ONLY is true and we're pointed at the
     * LIVE bank gateway (not test mode), only a logged-in administrator sees this payment
     * method — used only as a secondary safety gate for the classic WC checkout page,
     * which real customers never visit in the headless flow anyway.
     */
    public function is_available()
    {
        if (!parent::is_available() || !$this->credentials_configured()) {
            return false;
        }
        if (!$this->test_mode && defined('QNB_PAYFOR_ADMIN_ONLY') && QNB_PAYFOR_ADMIN_ONLY) {
            return current_user_can('manage_options');
        }
        return true;
    }

    private function gateway_endpoints(): array
    {
        return $this->test_mode
            ? [
                'payment_api'     => 'https://vpostest.qnbfinansbank.com/Gateway/XMLGate.aspx',
                'gateway_3d'      => 'https://vpostest.qnbfinansbank.com/Gateway/Default.aspx',
                'gateway_3d_host' => 'https://vpostest.qnbfinansbank.com/Gateway/3DHost.aspx',
            ]
            : [
                'payment_api'     => 'https://vpos.qnbfinansbank.com/Gateway/XMLGate.aspx',
                'gateway_3d'      => 'https://vpos.qnbfinansbank.com/Gateway/Default.aspx',
                'gateway_3d_host' => 'https://vpos.qnbfinansbank.com/Gateway/3DHost.aspx',
            ];
    }

    /**
     * @return array{0: \Mews\Pos\PosInterface, 1: \Mews\Pos\Entity\Account\PayForAccount}
     */
    public function build_pos()
    {
        $account = AccountFactory::createPayForAccount(
            'qnbfinansbank-payfor',
            QNB_MERCHANT_ID,
            QNB_USER_CODE,
            QNB_USER_PASSWORD,
            PosInterface::MODEL_3D_SECURE,
            QNB_3D_MERCHANT_KEY,
            PosInterface::LANG_TR
        );

        $config = [
            'banks' => [
                'qnbfinansbank-payfor' => [
                    'name'              => 'QNBFinansbank-PayFor',
                    'class'             => \Mews\Pos\Gateways\PayForPos::class,
                    'gateway_endpoints' => $this->gateway_endpoints(),
                ],
            ],
        ];

        $eventDispatcher = new \Symfony\Component\EventDispatcher\EventDispatcher();
        $pos = PosFactory::createPosGateway($account, $config, $eventDispatcher);
        $pos->setTestMode($this->test_mode);

        return [$pos, $account];
    }

    /** Bank return callback URL that is guaranteed to boot WordPress on this host. */
    private function bank_return_url(WC_Order $order): string
    {
        return add_query_arg(
            [
                'order_id' => $order->get_id(),
                'key'      => $order->get_order_key(),
            ],
            rest_url('wp-lzer/v1/qnb-return')
        );
    }

    // ============================================================================
    // HEADLESS FLOW — used by the Next.js checkout via /wp-json/wp-lzer/v1/qnb/checkout
    // ============================================================================

    /**
     * @param int   $order_id
     * @param array $card {number, month, year, cvv, name}
     * @return array{gateway: string, method: string, inputs: array<string,string>}
     * @throws \Exception
     */
    public function generate_3d_form_for_order(int $order_id, array $card): array
    {
        $order = wc_get_order($order_id);
        if (!$order) {
            throw new \InvalidArgumentException('Sipariş bulunamadı.');
        }

        [$pos] = $this->build_pos();

        $creditCard = CreditCardFactory::createForGateway(
            $pos,
            sanitize_text_field($card['number'] ?? ''),
            sanitize_text_field($card['year'] ?? ''),
            sanitize_text_field($card['month'] ?? ''),
            sanitize_text_field($card['cvv'] ?? ''),
            sanitize_text_field($card['name'] ?? '')
        );

        $return_url = $this->bank_return_url($order);

        $pos_order = [
            'id'          => (string) $order->get_id(),
            'amount'      => (float) $order->get_total(),
            'currency'    => PosInterface::CURRENCY_TRY,
            'installment' => 0,
            'success_url' => $return_url,
            'fail_url'    => $return_url,
            'lang'        => PosInterface::LANG_TR,
        ];

        $form_data = $pos->get3DFormData(
            $pos_order,
            PosInterface::MODEL_3D_SECURE,
            PosInterface::TX_TYPE_PAY_AUTH,
            $creditCard
        );

        $order->update_status('pending', 'QNB 3D Secure ödeme bekleniyor.');

        return $form_data;
    }

    /**
     * Called by the /wp-json/wp-lzer/v1/qnb-return REST route once the bank redirects back.
     *
     * @return array{success: bool, order_id: int, message: string}
     */
    public function finalize_from_return(int $order_id, string $key): array
    {
        $order = wc_get_order($order_id);
        if (!$order || !hash_equals($order->get_order_key(), $key)) {
            return ['success' => false, 'order_id' => $order_id, 'message' => 'Geçersiz sipariş.'];
        }

        // Already processed (e.g. bank double-posts the return) — treat as success without
        // re-charging or re-validating with the bank a second time.
        if ($order->is_paid()) {
            return ['success' => true, 'order_id' => $order_id, 'message' => 'Ödeme zaten onaylanmış.'];
        }

        try {
            [$pos] = $this->build_pos();

            $pos_order = [
                'id'       => (string) $order->get_id(),
                'amount'   => (float) $order->get_total(),
                'currency' => PosInterface::CURRENCY_TRY,
            ];

            $pos->payment(PosInterface::MODEL_3D_SECURE, $pos_order, PosInterface::TX_TYPE_PAY_AUTH, null);
            $response = $pos->getResponse();

            if ($pos->isSuccess()) {
                $order->update_meta_data('_qnb_ref_ret_num', $response['ref_ret_num'] ?? '');
                $order->update_meta_data('_qnb_paid_amount', $response['amount'] ?? $order->get_total());
                $order->update_meta_data('_qnb_currency', $response['currency'] ?? PosInterface::CURRENCY_TRY);
                $order->save_meta_data();

                $order->payment_complete($response['transaction_id'] ?? $response['trans_id'] ?? '');
                $order->add_order_note('QNB Finansbank 3D Secure ödemesi onaylandı.' . ($this->test_mode ? ' (TEST MODU)' : ''));

                return ['success' => true, 'order_id' => $order_id, 'message' => 'Ödeme onaylandı.'];
            }

            $error = $response['error_message'] ?? $response['md_error_message'] ?? 'Ödeme reddedildi.';
            $order->update_status('failed', 'QNB ödeme başarısız: ' . $error);

            return ['success' => false, 'order_id' => $order_id, 'message' => $error];
        } catch (\Throwable $e) {
            wc_get_logger()->error('QNB PayFor finalize_from_return error: ' . $e->getMessage(), ['source' => 'qnb-payfor']);
            $order->update_status('failed', 'QNB dönüş işlenirken hata: ' . $e->getMessage());

            return ['success' => false, 'order_id' => $order_id, 'message' => 'Ödeme doğrulanırken bir hata oluştu.'];
        }
    }

    // ============================================================================
    // CLASSIC WC CHECKOUT FLOW — kept for gateway validity / admin use only.
    // Real customers are never routed through this in the headless setup.
    // ============================================================================

    public function payment_fields()
    {
        if ($this->description) {
            echo wpautop(wp_kses_post($this->description));
        }
        if ($this->test_mode) {
            echo '<p style="color:#b45309;font-weight:bold;">TEST MODU — gercek kart bilgisi girmeyin, sadece banka test kartlariyla deneyin.</p>';
        } elseif (defined('QNB_PAYFOR_ADMIN_ONLY') && QNB_PAYFOR_ADMIN_ONLY) {
            echo '<p style="color:#b91c1c;font-weight:bold;">CANLI ORTAM — DOGRULAMA ASAMASI: Bu gercek bir islemdir, gercek kartinizdan gercek tutar cekilir.</p>';
        }
        ?>
        <fieldset id="qnb-payfor-cc-form" style="margin:0;">
            <p class="form-row form-row-wide">
                <label>Kart Uzerindeki Isim</label>
                <input type="text" name="qnb_card_name" autocomplete="cc-name" required />
            </p>
            <p class="form-row form-row-wide">
                <label>Kart Numarasi</label>
                <input type="text" name="qnb_card_number" inputmode="numeric" autocomplete="cc-number" maxlength="19" required />
            </p>
            <p class="form-row form-row-first">
                <label>Son Kullanma (Ay/Yil)</label>
                <input type="text" name="qnb_card_month" placeholder="AA" inputmode="numeric" maxlength="2" style="width:60px;display:inline-block;" required />
                /
                <input type="text" name="qnb_card_year" placeholder="YYYY" inputmode="numeric" maxlength="4" style="width:80px;display:inline-block;" required />
            </p>
            <p class="form-row form-row-last">
                <label>CVV</label>
                <input type="text" name="qnb_card_cvv" inputmode="numeric" maxlength="4" autocomplete="cc-csc" required />
            </p>
            <div class="clear"></div>
        </fieldset>
        <?php
    }

    public function validate_fields()
    {
        foreach (['qnb_card_name', 'qnb_card_number', 'qnb_card_month', 'qnb_card_year', 'qnb_card_cvv'] as $field) {
            if (empty($_POST[$field])) {
                wc_add_notice('Lütfen tüm kart bilgilerini eksiksiz girin.', 'error');
                return false;
            }
        }
        return true;
    }

    public function process_payment($order_id)
    {
        try {
            $card = [
                'number' => wp_unslash($_POST['qnb_card_number'] ?? ''),
                'year'   => wp_unslash($_POST['qnb_card_year'] ?? ''),
                'month'  => wp_unslash($_POST['qnb_card_month'] ?? ''),
                'cvv'    => wp_unslash($_POST['qnb_card_cvv'] ?? ''),
                'name'   => wp_unslash($_POST['qnb_card_name'] ?? ''),
            ];
            $form_data = $this->generate_3d_form_for_order($order_id, $card);
            set_transient('qnb_payfor_form_' . $order_id, $form_data, 15 * MINUTE_IN_SECONDS);

            $order = wc_get_order($order_id);
            return [
                'result'   => 'success',
                'redirect' => $order->get_checkout_payment_url(true),
            ];
        } catch (\Throwable $e) {
            wc_get_logger()->error('QNB PayFor process_payment error: ' . $e->getMessage(), ['source' => 'qnb-payfor']);
            wc_add_notice('Ödeme başlatılamadı, lütfen kart bilgilerinizi kontrol edip tekrar deneyin.', 'error');
            return ['result' => 'failure'];
        }
    }

    /** Renders the bank's auto-submitting 3D Secure form on the WC "pay for order" receipt page. */
    public function render_redirect_form($order_id)
    {
        $form_data = get_transient('qnb_payfor_form_' . $order_id);
        if (!$form_data) {
            echo '<p>Ödeme oturumu zaman aşımına uğradı. Lütfen tekrar deneyin.</p>';
            return;
        }
        ?>
        <p>Bankanın güvenli 3D Secure sayfasına yönlendiriliyorsunuz…</p>
        <form method="<?php echo esc_attr($form_data['method']); ?>" action="<?php echo esc_url($form_data['gateway']); ?>" id="qnb-3d-redirect-form">
            <?php foreach ($form_data['inputs'] as $key => $value) : ?>
                <input type="hidden" name="<?php echo esc_attr($key); ?>" value="<?php echo esc_attr($value); ?>" />
            <?php endforeach; ?>
        </form>
        <script>document.getElementById('qnb-3d-redirect-form').submit();</script>
        <?php
    }

    /** Legacy woocommerce_api_ handler — unreachable on this host's root routing, kept only
     *  as a harmless fallback in case WooCommerce internals ever call it directly. */
    public function handle_bank_return()
    {
        $order_id = isset($_GET['order_id']) ? absint($_GET['order_id']) : 0;
        $key      = isset($_GET['key']) ? sanitize_text_field(wp_unslash($_GET['key'])) : '';
        $result   = $this->finalize_from_return($order_id, $key);
        $order    = wc_get_order($order_id);

        if ($result['success'] && $order) {
            wp_safe_redirect($this->get_return_url($order));
            exit;
        }

        wc_add_notice('Ödeme tamamlanamadı: ' . $result['message'], 'error');
        wp_safe_redirect(wc_get_checkout_url());
        exit;
    }

    /**
     * Wired into WooCommerce's native "Refund" button on the order screen
     * (WooCommerce → Orders → open order → Refund). Full or partial.
     *
     * @param int         $order_id
     * @param float|null  $amount
     * @param string      $reason
     * @return bool|\WP_Error
     */
    public function process_refund($order_id, $amount = null, $reason = '')
    {
        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('qnb_refund_error', 'Sipariş bulunamadı.');
        }

        $ref_ret_num = $order->get_meta('_qnb_ref_ret_num');
        if (!$ref_ret_num) {
            return new WP_Error(
                'qnb_refund_error',
                'Bu sipariş için banka referans numarası kayıtlı değil (QNB gateway üzerinden ödenmemiş olabilir). İadeyi QNB Sanal POS panelinden manuel yapın.'
            );
        }

        $order_amount = (float) $order->get_meta('_qnb_paid_amount');
        $currency     = $order->get_meta('_qnb_currency') ?: PosInterface::CURRENCY_TRY;
        $refund_amount = $amount !== null ? (float) $amount : $order_amount;

        try {
            [$pos] = $this->build_pos();

            $pos->refund([
                'id'           => (string) $order->get_id(),
                'amount'       => $refund_amount,
                'order_amount' => $order_amount ?: $refund_amount,
                'currency'     => $currency,
                'ref_ret_num'  => $ref_ret_num,
                'ip'           => $this->get_client_ip(),
            ]);

            $response = $pos->getResponse();

            if ($pos->isSuccess()) {
                $order->add_order_note(sprintf(
                    'QNB Finansbank üzerinden %s %s iade edildi.%s%s',
                    number_format($refund_amount, 2),
                    $currency,
                    $reason ? ' Sebep: ' . $reason : '',
                    $this->test_mode ? ' (TEST MODU)' : ''
                ));
                return true;
            }

            $error = $response['error_message'] ?? 'Banka iadeyi reddetti.';
            $order->add_order_note('QNB iade başarısız: ' . $error);
            return new WP_Error('qnb_refund_error', $error);
        } catch (\Throwable $e) {
            wc_get_logger()->error('QNB PayFor process_refund error: ' . $e->getMessage(), ['source' => 'qnb-payfor']);
            return new WP_Error('qnb_refund_error', 'İade sırasında hata oluştu: ' . $e->getMessage());
        }
    }

    private function get_client_ip(): string
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '127.0.0.1';
    }
}
