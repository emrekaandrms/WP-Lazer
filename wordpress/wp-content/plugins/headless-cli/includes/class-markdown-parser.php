<?php
/**
 * Markdown Parser for Headless CLI
 *
 * @package Headless_CLI
 */

class Markdown_Parser {
    public function parse($content) {
        $frontmatter = [];
        $markdown_content = $content;

        // Extract frontmatter
        if (preg_match('/^---\s*\n(.*?)\n---\s*\n/s', $content, $matches)) {
            $frontmatter = $this->parse_frontmatter($matches[1]);
            $markdown_content = substr($content, strlen($matches[0]));
        }

        // Convert markdown to HTML
        $html_content = $this->markdown_to_html($markdown_content);

        return [
            'frontmatter' => $frontmatter,
            'content' => $html_content,
            'raw_content' => $markdown_content,
        ];
    }

    private function parse_frontmatter($frontmatter_text) {
        $data = [];
        $current_key = null;
        $current_indent = 0;

        $lines = explode("\n", $frontmatter_text);

        foreach ($lines as $line) {
            if (preg_match('/^(\s*)(\w+):\s*(.*)$/', $line, $matches)) {
                $indent = strlen($matches[1]);
                $key = $matches[2];
                $value = trim($matches[3]);

                // Handle inline YAML values
                if (!empty($value) && $value !== '') {
                    if (preg_match('/^["\'](.*)["\']$/', $value, $m)) {
                        $value = $m[1];
                    }
                    $data[$key] = $value;
                } else {
                    $data[$key] = [];
                }

                $current_key = $key;
                $current_indent = $indent;
            } elseif ($current_key !== null && preg_match('/^\s{2,}-\s+(.*)$/', $line, $matches)) {
                // Handle array items
                $value = trim($matches[1]);
                if (is_array($data[$current_key])) {
                    if (preg_match('/^["\'](.*)["\']$/', $value, $m)) {
                        $value = $m[1];
                    }
                    $data[$current_key][] = $value;
                }
            }
        }

        return $data;
    }

    private function markdown_to_html($markdown) {
        $html = $markdown;

        // Headers
        $html = preg_replace('/^#### (.*)$/m', '<h4>$1</h4>', $html);
        $html = preg_replace('/^### (.*)$/m', '<h3>$1</h3>', $html);
        $html = preg_replace('/^## (.*)$/m', '<h2>$1</h2>', $html);
        $html = preg_replace('/^# (.*)$/m', '<h1>$1</h1>', $html);

        // Bold and italic
        $html = preg_replace('/\*\*\*(.*?)\*\*\*/', '<strong><em>$1</em></strong>', $html);
        $html = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $html);
        $html = preg_replace('/\*(.*?)\*/', '<em>$1</em>', $html);

        // Links
        $html = preg_replace('/\[([^\]]+)\]\(([^)]+)\)/', '<a href="$2">$1</a>', $html);

        // Lists
        $html = preg_replace('/^\s*-\s+(.*)$/m', '<li>$1</li>', $html);
        $html = preg_replace('/(<li>.*<\/li>\n?)+/', '<ul>$0</ul>', $html);

        // Paragraphs
        $html = preg_replace('/\n\n+/', "</p>\n<p>", $html);
        $html = '<p>' . $html . '</p>';
        $html = preg_replace('/<p>\s*<\/(h[1-6]|ul|li)>/', '</$1>', $html);
        $html = preg_replace('/<(h[1-6]|ul|li)>\s*<\/p>/', '<$1>', $html);

        // Clean up empty paragraphs
        $html = preg_replace('/<p>\s*<\/p>/', '', $html);

        return $html;
    }
}
