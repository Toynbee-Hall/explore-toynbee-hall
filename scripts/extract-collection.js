/**
 * Collection Extraction Script
 * Converts existing HTML collection items to Eleventy-compatible Markdown
 *
 * Usage: node scripts/extract-collection.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Paths
const SOURCE_DIR = path.join(__dirname, '../../explore-static-organized/collection');
const OUTPUT_DIR = path.join(__dirname, '../src/collection');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get all collection folders
const folders = fs.readdirSync(SOURCE_DIR).filter(item => {
    const itemPath = path.join(SOURCE_DIR, item);
    return fs.statSync(itemPath).isDirectory() && item !== 'index.html';
});

console.log(`Found ${folders.length} collection items to process...\n`);

let successCount = 0;
let errorCount = 0;

folders.forEach((folder, index) => {
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
        // Remove " – Toynbee Hall" suffix
        title = title.replace(/\s*[–-]\s*Toynbee Hall\s*$/i, '').trim();
        // Decode HTML entities
        title = title.replace(/&#x[0-9A-Fa-f]+;/g, '').replace(/&#\d+;/g, '');

        // Extract images
        const images = [];
        $('.collection-img').each((i, el) => {
            let src = $(el).attr('data-lazy') || $(el).attr('src');
            if (src) {
                // Normalize path
                if (src.startsWith('/assets/')) {
                    // Already correct
                } else if (src.startsWith('../../assets/')) {
                    src = src.replace('../../assets/', '/assets/');
                } else if (src.startsWith('../assets/')) {
                    src = src.replace('../assets/', '/assets/');
                } else if (src.startsWith('assets/')) {
                    src = '/' + src;
                }
                images.push(src);
            }
        });

        // Extract about text
        let aboutText = '';
        const aboutDiv = $('.about');
        if (aboutDiv.length) {
            // Get the paragraph content, removing the h3
            aboutDiv.find('h3').remove();
            aboutText = aboutDiv.find('p').text().trim();
            // Also try to get HTML content for richer formatting
            const aboutHtml = aboutDiv.find('p').html();
            if (aboutHtml) {
                aboutText = aboutHtml
                    .replace(/<p>/g, '')
                    .replace(/<\/p>/g, '\n\n')
                    .replace(/<br\s*\/?>/g, '\n')
                    .replace(/<[^>]+>/g, '')
                    .trim();
            }
        }

        // Extract catalogue reference
        let catalogueRef = '';
        const archiveInfo = $('.archive-info p').first().text();
        const refMatch = archiveInfo.match(/\[Catalogue reference\]:\s*(.+)/);
        if (refMatch) {
            catalogueRef = refMatch[1].trim();
        }

        // Extract tags
        const tags = [];
        $('.single-tags li a').each((i, el) => {
            const tagText = $(el).text().trim();
            if (tagText) {
                tags.push(tagText);
            }
        });

        // Create frontmatter
        const frontmatter = {
            layout: 'collection-item.njk',
            title: title,
            slug: folder,
            images: images,
            tags: tags,
            catalogueRef: catalogueRef
        };

        // Build markdown content
        let markdown = '---\n';
        markdown += `layout: collection-item.njk\n`;
        markdown += `title: "${title.replace(/"/g, '\\"')}"\n`;
        markdown += `slug: "${folder}"\n`;

        if (catalogueRef) {
            markdown += `catalogueRef: "${catalogueRef}"\n`;
        }

        if (images.length > 0) {
            markdown += `images:\n`;
            images.forEach(img => {
                markdown += `  - "${img}"\n`;
            });
        }

        if (tags.length > 0) {
            markdown += `tags:\n`;
            tags.forEach(tag => {
                markdown += `  - "${tag.replace(/"/g, '\\"')}"\n`;
            });
        }

        markdown += '---\n\n';
        markdown += aboutText || 'No description available.';
        markdown += '\n';

        // Write markdown file
        const outputPath = path.join(OUTPUT_DIR, `${folder}.md`);
        fs.writeFileSync(outputPath, markdown);

        successCount++;

        // Progress indicator
        if ((index + 1) % 50 === 0) {
            console.log(`Processed ${index + 1}/${folders.length} items...`);
        }

    } catch (error) {
        console.error(`✗ Error processing ${folder}: ${error.message}`);
        errorCount++;
    }
});

console.log(`\n========================================`);
console.log(`Extraction complete!`);
console.log(`✓ Success: ${successCount} items`);
console.log(`✗ Errors: ${errorCount} items`);
console.log(`Output: ${OUTPUT_DIR}`);
console.log(`========================================\n`);
