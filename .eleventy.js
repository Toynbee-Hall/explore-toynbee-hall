module.exports = function(eleventyConfig) {
  // Theme and vendor assets (CSS, JS, fonts, libraries) are in git
  eleventyConfig.addPassthroughCopy("src/assets/theme");
  eleventyConfig.addPassthroughCopy("src/assets/vendor");
  eleventyConfig.addWatchTarget("src/assets/theme/css/");

  // Large media assets are uploaded directly to server
  // Only copy them if they exist locally (for development)
  const fs = require('fs');
  if (fs.existsSync('src/assets/media')) {
    eleventyConfig.addPassthroughCopy("src/assets/media");
  }
  if (fs.existsSync('src/assets/Pano')) {
    eleventyConfig.addPassthroughCopy("src/assets/Pano");
  }

  // Dev server: serve passthrough files straight from src instead of copying
  // them (media is ~7GB), and don't watch the large media folders for changes.
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
  eleventyConfig.watchIgnores.add("src/assets/media/**");
  eleventyConfig.watchIgnores.add("src/assets/Pano/**");

  // Add a filter to slugify strings (for tag URLs etc)
  eleventyConfig.addFilter("slugify", function(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  });

  // Plain-text excerpt of a page's raw markdown/HTML, for link-preview descriptions
  eleventyConfig.addFilter("shareExcerpt", function(raw, maxLen = 200) {
    if (!raw || typeof raw !== "string") return "";
    const paragraphs = raw
      .replace(/\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\}/g, "")  // template tags
      .replace(/<[^>]+>/g, " ")                          // HTML tags
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")              // markdown images
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")           // markdown links -> text
      .replace(/[*_#>`]+/g, "")                          // emphasis, headings, quotes
      .split(/\n\s*\n/)
      .map(p => p.replace(/\s+/g, " ").trim())
      .filter(p => p.length > 40 && !/^No description available/i.test(p));
    if (!paragraphs.length) return "";
    const text = paragraphs[0];
    if (text.length <= maxLen) return text;
    return text.slice(0, text.lastIndexOf(" ", maxLen)).replace(/[,;:.\s]+$/, "") + "…";
  });

  // Check if string matches a regex pattern
  eleventyConfig.addFilter("match", function(str, pattern) {
    if (!str) return false;
    const regex = new RegExp(pattern);
    return regex.test(str);
  });

  // Check if tag is a decade (e.g., "1890s", "1990s")
  eleventyConfig.addFilter("isDecade", function(str) {
    if (!str) return false;
    return /^\d{4}s$/.test(str);
  });

  // Process timeline data to add position and gap classes
  eleventyConfig.addFilter("timelineWithLayout", function(events) {
    if (!events || !Array.isArray(events)) return events;

    let prevYear = 0;
    let side = 'left';
    let uniqueYearCount = 0;

    return events.map((event, index) => {
      const yearGap = prevYear > 0 ? event.year - prevYear : 0;

      // Alternate side when year changes
      if (event.year !== prevYear && prevYear > 0) {
        side = side === 'left' ? 'right' : 'left';
        uniqueYearCount++;
      }

      // Calculate gap class
      let gapClass;
      if (yearGap === 0 && index > 0) {
        gapClass = 'gap-same';
      } else if (yearGap <= 2) {
        gapClass = 'gap-small';
      } else if (yearGap <= 5) {
        gapClass = 'gap-medium';
      } else if (yearGap <= 10) {
        gapClass = 'gap-large';
      } else {
        gapClass = 'gap-xlarge';
      }

      prevYear = event.year;

      return {
        ...event,
        position: side,
        gapClass: gapClass
      };
    });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    passthroughFileCopy: true
  };
};
