export default {
	allow: [
		"all"
	],
	importMap: "./modules.json",
	noCheck: true,
	scripts: {
		start: {
			desc: "start",
			cmd: "./merge-stems.js",
			watch: false
		},
		compile: {
			desc: "compile",
			cmd: "./compile.js",
			watch: false
		}
	}
}