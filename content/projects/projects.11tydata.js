export default {
	title: "Projects",
	tags: [
		"projects"
	],
	"layout": "layouts/project-post.njk",
	eleventyCMSMetadata:{
		shortDescription:"",
		image:'',
		imageAlt:'',
		languages:[],
		technologies:[],
		url:''
	},
	eleventyComputed: {
		metaDescription: data => data.shortDescription
	}
};
