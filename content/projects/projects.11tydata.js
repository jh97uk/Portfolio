export default {
	title: "Projects",
	tags: [
		"projects"
	],
	"layout": "layouts/project-post.njk",
	eleventyComputed: {
		metaDescription: data => data.shortDescription
	}
};
