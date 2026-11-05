/**
 * Timeline Extraction Script
 * Extracts timeline events from HTML to JSON for Eleventy data file
 *
 * Usage: node scripts/extract-timeline.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Paths
const SOURCE_FILE = path.join(__dirname, '../../explore-static-organized/explore/the-history-of-toynbee-hall-a-timeline/index.html');
const OUTPUT_FILE = path.join(__dirname, '../src/_data/timeline.json');

// Read and parse HTML
const html = fs.readFileSync(SOURCE_FILE, 'utf8');
const $ = cheerio.load(html);

const events = [];

$('.event-wrap').each((index, el) => {
    const $event = $(el);

    // Position (left or right)
    const position = $event.hasClass('right') ? 'right' : 'left';

    // Year
    const year = $event.find('.year').text().trim();

    // Month
    const month = $event.find('.month').text().trim();

    // Image
    let image = '';
    const $img = $event.find('.event-image img');
    if ($img.length) {
        image = $img.attr('src') || '';
        // Normalize paths
        if (image.startsWith('../../assets/')) {
            image = image.replace('../../assets/', '/assets/');
        } else if (image.startsWith('../assets/')) {
            image = image.replace('../assets/', '/assets/');
        }
    }

    // Title
    const title = $event.find('.event-text h3').text().trim();

    // Date string
    const dateStr = $event.find('.event-text p[style]').first().text().trim();

    // Description - get all paragraphs except the date one
    let description = '';
    $event.find('.event-text p').each((i, p) => {
        const $p = $(p);
        // Skip the date paragraph (has inline style)
        if (!$p.attr('style')) {
            const text = $p.text().trim();
            if (text) {
                description += text + '\n\n';
            }
        }
    });
    description = description.trim();

    events.push({
        position,
        year: parseInt(year) || year,
        month,
        date: dateStr,
        title,
        description,
        image
    });
});

// Sort by year
events.sort((a, b) => a.year - b.year);

// Write JSON
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(events, null, 2));

console.log(`Extracted ${events.length} timeline events`);
console.log(`Output: ${OUTPUT_FILE}`);
