import {
	join
} from "std/path";

const {
	args,
	mkdir,
	run
} = Deno;

const [targetsString] = args;

const targetsMap = {
	linux: "x86_64-unknown-linux-gnu",
	windows: "x86_64-pc-windows-msvc",
	mac: "x86_64-apple-darwin",
	armmac: "aarch64-apple-darwin"
};

let targets = [];

if (typeof args !== "undefined") {
	if (typeof targetsString !== "undefined") {
		if (targetsString === "all") {
			targets = Object.values(targetsMap);
		}
		else {
			targets = targetsString.split(",").map(shortTarget => targetsMap[shortTarget]);
		}
	}
}

const processes = [];

for (const target of targets) {
	const outputFolder = join("./binaries", target);
	await mkdir(outputFolder, { recursive: true });

	const process = run({
		cmd: [
			"deno",
			"compile",
			"-A",
			"--no-check",
			"--unstable",
			"--reload",
			"--import-map",
			"./modules.json",
			"--target",
			target,
			"--output",
			join(outputFolder, "merge-stems"),
			"./merge-stems.js"
		]
	});

	processes.push(process);
}

await Promise.all(processes.map(process => process.status()))

for (const process of processes) {
	process.close();
}