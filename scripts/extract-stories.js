/**
 * Stories Extraction Script
 * Extracts story pages from HTML to Markdown for Eleventy
 *
 * Usage: node scripts/extract-stories.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Paths
const SOURCE_DIR = path.join(__dirname, '../../explore-static-organized/stories');
const OUTPUT_DIR = path.join(__dirname, '../src/stories');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get all story folders
const folders = fs.readdirSync(SOURCE_DIR).filter(item => {
    const itemPath = path.join(SOURCE_DIR, item);
    return fs.statSync(itemPath).isDirectory();
});

console.log(`Found ${folders.length} stories to process...\n`);

let successCount = 0;
let errorCount = 0;
const stories = [];

folders.forEach((folder) => {
    const htmlPath = path.join(SOURCE_DIR, folder, 'index.html');

    if (!fs.existsSync(htmlPath)) {
        console.log(`⚠ Skipping ${folder} - no index.html found`);
        return;
    }

    try {
        const html = fs.readFileSync(htmlPath, 'utf8');
        const $ = cheerio.load(html);

        // Extract title from <title> tag
        let title = $('title').text().trim();
        title = title.replace(/\s*[–-]\s*Toynbee Hall\s*$/i, '').trim();

        // Extract theme from body class
        const bodyClass = $('body').attr('class') || '';
        const themeMatch = bodyClass.match(/themes-([a-z-]+)/);
        const theme = themeMatch ? themeMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';

        // Extract featured image
        let featuredImage = '';
        const introBg = $('.introBg').attr('style') || '';
        const bgMatch = introBg.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (bgMatch) {
            featuredImage = bgMatch[1];
            // Normalize path
            if (featuredImage.startsWith('../../assets/')) {
                featuredImage = featuredImage.replace('../../assets/', '/assets/');
            }
        }

        // Extract introduction text
        let intro = $('#introText h3').text().trim();
        // Clean up weird characters
        intro = intro.replace(/\s+/g, ' ').trim();

        // Extract author
        let author = '';
        const authorText = $('.stories-title h2').text().trim();
        if (authorText.startsWith('By ')) {
            author = authorText.replace('By ', '');
        }

        // Extract main content
        let content = '';
        $('.stories-text').each((i, el) => {
            const html = $(el).html();
            if (html) {
                // Clean up nested p tags and convert to markdown-friendly format
                let text = html
                    .replace(/<p><p>/g, '<p>')
                    .replace(/<\/p><\/p>/g, '</p>')
                    .replace(/<p>/g, '\n\n')
                    .replace(/<\/p>/g, '')
                    .replace(/<br\s*\/?>/g, '\n')
                    .replace(/<strong>/g, '**')
                    .replace(/<\/strong>/g, '**')
                    .replace(/<em>/g, '*')
                    .replace(/<\/em>/g, '*')
                    .replace(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '[$2]($1)')
                    .replace(/<[^>]+>/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&#x0092;/g, "'")
                    .replace(/&#8217;/g, "'")
                    .replace(/&#8211;/g, "–")
                    .replace(/&#8220;/g, '"')
                    .replace(/&#8221;/g, '"')
                    .trim();
                content += text + '\n\n';
            }
        });

        // Extract images with captions
        const images = [];
        $('.stories-img').each((i, el) => {
            const $img = $(el).find('img');
            const $caption = $(el).find('figcaption');

            let src = $img.attr('src') || '';
            if (src.startsWith('../../assets/')) {
                src = src.replace('../../assets/', '/assets/');
            }

            const alt = $img.attr('alt') || '';
            const caption = $caption.text().trim();

            if (src) {
                images.push({ src, alt, caption });
            }
        });

        // Build markdown content
        let markdown = '---\n';
        markdown += `layout: story.njk\n`;
        markdown += `title: "${title.replace(/"/g, '\\"')}"\n`;
        markdown += `slug: "${folder}"\n`;

        if (theme) {
            markdown += `theme: "${theme}"\n`;
        }

        if (author) {
            markdown += `author: "${author.replace(/"/g, '\\"')}"\n`;
        }

        if (featuredImage) {
            markdown += `featuredImage: "${featuredImage}"\n`;
        }

        if (images.length > 0) {
            markdown += `images:\n`;
            images.forEach(img => {
                markdown += `  - src: "${img.src}"\n`;
                if (img.alt) markdown += `    alt: "${img.alt.replace(/"/g, '\\"')}"\n`;
                if (img.caption) markdown += `    caption: "${img.caption.replace(/"/g, '\\"')}"\n`;
            });
        }

        markdown += '---\n\n';

        if (intro) {
            markdown += `${intro}\n\n`;
        }

        markdown += content.trim() + '\n';

        // Write markdown file
        const outputPath = path.join(OUTPUT_DIR, `${folder}.md`);
        fs.writeFileSync(outputPath, markdown);

        // Store for index/ordering
        stories.push({
            slug: folder,
            title,
            theme,
            featuredImage
        });

        successCount++;

    } catch (error) {
        console.error(`✗ Error processing ${folder}: ${error.message}`);
        errorCount++;
    }
});

console.log(`\n========================================`);
console.log(`Extraction complete!`);
console.log(`✓ Success: ${successCount} stories`);
console.log(`✗ Errors: ${errorCount} stories`);
console.log(`Output: ${OUTPUT_DIR}`);
console.log(`========================================\n`);
