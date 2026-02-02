export default {
	title: "Blog",
	tags: [
		"blog"
	],
	"layout": "layouts/post.njk",
	eleventyComputed: {
		metaDescription: data => data.shortDescription? data.shortDescription : data.page.rawInput.substring(0, 155)
	}
};
