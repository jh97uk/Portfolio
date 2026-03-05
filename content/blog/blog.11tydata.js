export default {
	title: "Blog",
	tags: [
		"blog"
	],
	"layout": "layouts/post.njk",
	eleventyCMSMetadata:{
		draft:true,
		shortDescription:"",
	},
	eleventyComputed: {
		metaDescription: data => data.shortDescription? data.shortDescription : data.page.rawInput.substring(0, 155)
	}
};
