import {
  IdAttributePlugin,
  InputPathToUrlTransformPlugin,
  HtmlBasePlugin,
} from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import blogTools from "eleventy-plugin-blog-tools";
import pluginFilters from "./_config/filters.js";
import metadata from "./_data/metadata.js";
import { DateTime } from "luxon";
import CleanCSS from "clean-css";
import posthtml from "posthtml";
import Token from "markdown-it/lib/token.mjs";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
  // Drafts, see also _data/eleventyDataSchema.js
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
    if (data.draft) {
      data.title = `${data.title} (draft)`;
    }

    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }
  });

  eleventyConfig.addGlobalData(
    "eleventyComputed.eleventyExcludeFromCollections",
    function () {
      return (data) => {
        return data.draft;
      };
    },
  );

  // Copy the contents of the `public` folder to the output folder
  // For example, `./public/css/` ends up in `_site/css/`
  eleventyConfig.addPlugin(blogTools);
  eleventyConfig.addPassthroughCopy({ "./content/assets/favicon.svg": "/" });
  eleventyConfig
    .addPassthroughCopy({
      "./public/": "/",
    })
    .addPassthroughCopy({
      "./content/assets": "/assets",
    })
    .addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");

  // Run Eleventy when these files change:
  // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

  // Watch CSS files
  eleventyConfig.addWatchTarget("css/**/*.css");
  // Watch images for the image pipeline.
  eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

  // Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
  // Bundle <style> content and adds a {% css %} paired shortcode
  eleventyConfig.addBundle("css", {
    toFileDirectory: "dist",
    // Add all <style> content to `css` bundle (use <style eleventy:ignore> to opt-out)
    // Supported selectors: https://www.npmjs.com/package/posthtml-match-helper
    bundleHtmlContentFromSelector: "style",
  });

  // Bundle <script> content and adds a {% js %} paired shortcode
  eleventyConfig.addBundle("js", {
    toFileDirectory: "dist",
    // Add all <script> content to the `js` bundle (use <script eleventy:ignore> to opt-out)
    // Supported selectors: https://www.npmjs.com/package/posthtml-match-helper
    bundleHtmlContentFromSelector: "script",
  });

  // Official plugins
  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    preAttributes: { tabindex: 0 },
  });
  eleventyConfig.addPlugin(pluginNavigation);

  eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
  // eleventyConfig.amendLibrary('md', md => {
  // 	var defaultRenderOpen = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
  // 		return self.renderToken(tokens, idx, options);
  // 	};
  // 	var defaultRenderClose = md.renderer.rules.link_close || function (tokens, idx, options, env, self) {
  // 		return self.renderToken(tokens, idx, options);
  // 	};
  // 	md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  // 		const linkHref = tokens[idx].attrGet('href');

  // 		return `<span><span class="preview"></span>${defaultRenderOpen(tokens, idx, options, env, self)}`;
  // 	};
  // 	md.renderer.rules.link_close = function (tokens, idx, options, env, self) {
  // 		return `${defaultRenderOpen(tokens, idx, options, env, self)}</span>`;
  // 	}
  // 	return md
  // });

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom", // or "rss", "json"
    outputPath: "/feed.xml",
    templateData: {
      eleventyNavigation: {
        key: "Feed",
        order: 4,
      },
    },
    collection: {
      name: "blog",
      limit: 10,
    },
    metadata: {
      language: metadata.language,
      title: metadata.title,
      subtitle: metadata.description,
      base: metadata.url,
      author: {
        name: metadata.author.name,
      },
    },
  });
  eleventyConfig.addFilter("escapeHtml", function (value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  });

  // Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // Output formats for each image.
    formats: ["avif", "webp", "auto"],
    widths: [null],
    outputDir: "./_site/assets/img/",
    failOnError: true,
    htmlOptions: {
      imgAttributes: {
        // e.g. <img loading decoding> assigned on the HTML tag will override these values.
        loading: "lazy",
        decoding: "async",
        sizes: "100vw",
      },
    },

    sharpOptions: {
      animated: true,
    },
  });

  // Filters
  eleventyConfig.addPlugin(pluginFilters);

  eleventyConfig.addPlugin(IdAttributePlugin, {
    // by default we use Eleventy’s built-in `slugify` filter:
    // slugify: eleventyConfig.getFilter("slugify"),
    // selector: "h1,h2,h3,h4,h5,h6", // default
  });
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });
  eleventyConfig.addShortcode("currentBuildDate", () => {
    return new Date().toISOString();
  });

  eleventyConfig.addFilter("postDate", (dateObj) => {
    let isDateObj = dateObj instanceof Date;

    return DateTime.fromJSDate(
      isDateObj ? dateObj : new Date(dateObj),
    ).toLocaleString(DateTime.DATE_MED);
  });

  eleventyConfig.addFilter("relatedPosts", function (tags, collections) {
    let updatedTags = [...tags];
    updatedTags.shift(); // Remove the base collection like "blog" or "projects"
    let relatedPosts = [];
    updatedTags.forEach((tag) => {
      if (!collections[tag]) return;
      relatedPosts = collections[tag].splice(0, 4);
    });
    relatedPosts.shift(); // Remove the first match, which will always be the current page's
    return relatedPosts;
  });
  eleventyConfig.addFilter("sortDataByDate", (arr) => {
    return arr.sort((a, b) => {
      return new Date(b.data.date) - new Date(a.data.date);
    });
  });
}

export const config = {
  // Control which files Eleventy will process
  // e.g.: *.md, *.njk, *.html, *.liquid
  templateFormats: ["md", "njk", "html", "liquid", "11ty.js"],

  // Pre-process *.md files with: (default: `liquid`)
  markdownTemplateEngine: "njk",

  // Pre-process *.html files with: (default: `liquid`)
  htmlTemplateEngine: "njk",

  // These are all optional:
  dir: {
    input: "content", // default: "."
    includes: "../_includes", // default: "_includes" (`input` relative)
    data: "../_data", // default: "_data" (`input` relative)
    output: "_site",
  },
};
