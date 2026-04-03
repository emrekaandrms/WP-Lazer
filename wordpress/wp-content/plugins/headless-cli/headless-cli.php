<?php
/**
 * Plugin Name: Headless CLI Commands
 * Plugin URI: https://example.com
 * Description: Custom WP-CLI commands for headless WooCommerce content management
 * Version: 1.0.0
 * Author: WP-Lzer
 * Author URI: https://example.com
 * Requires at least: 6.0
 * Requires PHP: 8.1
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('WP_CLI')) {
    return;
}

/**
 * Content import command
 *
 * <file>
 * : Path to markdown file or directory
 *
 * [--type=<type>]
 * : Type of content (page, policy, settings)
 *
 * [--dry-run]
 * : Preview without making changes
 */
class Content_Import_Command {
    private $parser;

    public function __construct() {
        require_once plugin_dir_path(__FILE__) . 'includes/class-markdown-parser.php';
        $this->parser = new Markdown_Parser();
    }

    public function import($args, $assoc_args) {
        $path = $args[0] ?? '';

        if (empty($path)) {
            WP_CLI::error('Please provide a file or directory path.');
            return;
        }

        $type = $assoc_args['type'] ?? 'page';
        $dry_run = isset($assoc_args['dry-run']);

        if (is_dir($path)) {
            $this->import_directory($path, $type, $dry_run);
        } else {
            $this->import_file($path, $type, $dry_run);
        }
    }

    private function import_file($file, $type, $dry_run) {
        if (!file_exists($file)) {
            WP_CLI::error("File not found: {$file}");
            return;
        }

        $content = file_get_contents($file);
        $parsed = $this->parser->parse($content);
        $slug = $parsed['frontmatter']['slug'] ?? basename($file, '.md');

        if ($dry_run) {
            WP_CLI::line("[DRY RUN] Would create/update: {$slug} (type: {$type})");
            WP_CLI::line("Title: " . ($parsed['frontmatter']['title'] ?? 'N/A'));
            return;
        }

        $this->create_or_update_content($slug, $parsed, $type);
        WP_CLI::success("Imported: {$slug}");
    }

    private function import_directory($dir, $type, $dry_run) {
        $files = glob($dir . '/*.md');

        if (empty($files)) {
            WP_CLI::warning("No markdown files found in: {$dir}");
            return;
        }

        $count = 0;
        foreach ($files as $file) {
            $this->import_file($file, $type, $dry_run);
            $count++;
        }

        WP_CLI::success("Imported {$count} files from {$dir}");
    }

    private function create_or_update_content($slug, $parsed, $type) {
        $post_type = $type === 'policy' ? 'page' : 'page';

        $existing = get_page_by_path($slug, OBJECT, $post_type);

        $post_data = [
            'post_title' => $parsed['frontmatter']['title'] ?? $slug,
            'post_content' => $parsed['content'],
            'post_status' => $parsed['frontmatter']['status'] ?? 'publish',
            'post_type' => $post_type,
            'post_name' => $slug,
        ];

        if ($existing) {
            $post_data['ID'] = $existing->ID;
            wp_update_post($post_data);
        } else {
            wp_insert_post($post_data);
        }

        // Handle SEO frontmatter
        if (isset($parsed['frontmatter']['seo'])) {
            update_post_meta($existing ? $existing->ID : 0, '_seo_title', $parsed['frontmatter']['seo']['title'] ?? '');
            update_post_meta($existing ? $existing->ID : 0, '_seo_description', $parsed['frontmatter']['seo']['description'] ?? '');
        }
    }
}

class Policy_Command {
    public function set($args, $assoc_args) {
        $slug = $args[0] ?? '';
        $file = $assoc_args['file'] ?? '';

        if (empty($slug) || empty($file)) {
            WP_CLI::error('Usage: wp policy set <slug> --file=<path>');
            return;
        }

        if (!file_exists($file)) {
            WP_CLI::error("File not found: {$file}");
            return;
        }

        $content = file_get_contents($file);
        $existing = get_page_by_path('policy/' . $slug, OBJECT, 'page');

        $post_data = [
            'post_title' => ucfirst($slug) . ' Policy',
            'post_content' => $content,
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_name' => 'policy/' . $slug,
        ];

        if ($existing) {
            $post_data['ID'] = $existing->ID;
            wp_update_post($post_data);
        } else {
            wp_insert_post($post_data);
        }

        WP_CLI::success("Policy updated: {$slug}");
    }
}

class Settings_Sync_Command {
    public function sync($args, $assoc_args) {
        $file = $args[0] ?? '';

        if (empty($file)) {
            WP_CLI::error('Usage: wp settings sync <file.json>');
            return;
        }

        if (!file_exists($file)) {
            WP_CLI::error("File not found: {$file}");
            return;
        }

        $settings = json_decode(file_get_contents($file), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            WP_CLI::error('Invalid JSON: ' . json_last_error_msg());
            return;
        }

        foreach ($settings as $key => $value) {
            update_option('headless_' . $key, $value);
        }

        WP_CLI::success('Settings synced from: ' . $file);
    }

    public function export($args, $assoc_args) {
        $keys = $assoc_args['keys'] ?? '';

        if (empty($keys)) {
            WP_CLI::error('Usage: wp settings export --keys=key1,key2');
            return;
        }

        $key_list = explode(',', $keys);
        $settings = [];

        foreach ($key_list as $key) {
            $value = get_option('headless_' . trim($key));
            if ($value !== false) {
                $settings[trim($key)] = $value;
            }
        }

        echo json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }
}

class Validate_Content_Command {
    public function __invoke($args, $assoc_args) {
        $dir = $args[0] ?? 'content/';
        $schema_dir = $dir . 'schemas/';

        if (!is_dir($schema_dir)) {
            WP_CLI::warning("No schemas directory found: {$schema_dir}");
            return;
        }

        $files = glob($dir . '/*.md');
        $errors = [];
        $valid = 0;

        foreach ($files as $file) {
            $content = file_get_contents($file);
            $frontmatter = $this->extract_frontmatter($content);

            $schema_file = $schema_dir . basename($file, '.md') . '.json';
            if (file_exists($schema_file)) {
                $schema = json_decode(file_get_contents($schema_file), true);
                if ($this->validate_frontmatter($frontmatter, $schema)) {
                    $valid++;
                } else {
                    $errors[] = basename($file);
                }
            }
        }

        if (empty($errors)) {
            WP_CLI::success("All {$valid} files validated successfully.");
        } else {
            WP_CLI::error('Validation failed for: ' . implode(', ', $errors));
        }
    }

    private function extract_frontmatter($content) {
        if (preg_match('/^---\s*\n(.*?)\n---\s*\n/s', $content, $matches)) {
            $fields = [];
            foreach (explode("\n", $matches[1]) as $line) {
                if (strpos($line, ':') !== false) {
                    list($key, $value) = explode(':', $line, 2);
                    $fields[trim($key)] = trim($value);
                }
            }
            return $fields;
        }
        return [];
    }

    private function validate_frontmatter($data, $schema) {
        foreach ($schema['required'] ?? [] as $field) {
            if (!isset($data[$field])) {
                return false;
            }
        }
        return true;
    }
}

// Register commands
WP_CLI::add_command('content', 'Content_Import_Command');
WP_CLI::add_command('policy', 'Policy_Command');
WP_CLI::add_command('settings', 'Settings_Sync_Command');
WP_CLI::add_command('validate', 'Validate_Content_Command');
