import { join } from "std/path";
import * as Temporal from "temporal";
import "core-js/proposals/array-grouping";

import { getCwd } from "./utilities.js";

const {
	dateToTemporalInstant
} = Temporal;

const cwd = getCwd();

const {
	args: [
		stemsFolderPath = join(cwd, "../stems"),
		outputFolderPath = join(stemsFolderPath, "../output"),
		outputFormat = "wav"
	],
	build: {
		os
	},
	mkdir,
	readDir,
	stat,
	run
} = Deno;

const sortByBirth = (array) => [...array]
	.sort((
		{ birth: birthA },
		{ birth: birthB }
	) => {
		return birthA.since(birthB).total({ unit: "nanosecond" });
	});

const stems = [];

for await (const { name, isFile } of readDir(stemsFolderPath)) {
	if (isFile && name.match(/^(?!\._).*\.(wav|mp3)$/)) {
		const { birthtime } = await stat(join(stemsFolderPath, name));

		const birth = dateToTemporalInstant(birthtime);

		const [album, trackName, indexString] = name.split(/_|\./);

		stems.push({
			birth,
			album,
			name: trackName,
			fileName: name,
			index: Number(indexString)
		});
	}
}

const tracks = Object.entries(stems.groupBy(({ name }) => name))
	.map(([name, stems]) => {
		const sortedStemsByBirth = sortByBirth(stems);

		const { birth: firstDownloadedStemBirth, album } = sortedStemsByBirth[0];

		const sortedStemsByIndex = [...stems]
			.sort((
				{ index: indexA },
				{ index: indexB }
			) => {
				return indexA - indexB;
			});

		const stemFileNames = sortedStemsByIndex
			.map(({ fileName }) => fileName);

		return {
			name,
			album,
			birth: firstDownloadedStemBirth,
			stems: stemFileNames
		};
	});

const sortedTracks = sortByBirth(tracks);

await mkdir(outputFolderPath, { recursive: true });

for (const [index, { name, stems }] of sortedTracks.entries()) {
	const inputArguments = stems
		.map((fileName) => ["-i", join(stemsFolderPath, fileName)])
		.flat();

	const outputFileName = join(outputFolderPath, `${String(index + 1).padStart(2, "0")} ${name}.${outputFormat}`);

	let command = [
		"ffmpeg",
		...inputArguments,
		"-filter_complex",
		`amix=inputs=${stems.length}:duration=longest`,
		outputFileName
	];

	if (os === "windows") {
		command = [
			"cmd",
			"/C",
			...command
		];
	}

	const process = run({
		cmd: command
	});

	await process.status();

	process.close();
}