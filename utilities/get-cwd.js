import {
	fromFileUrl,
	join
} from "std/path";

const {
	execPath,
	mainModule
} = Deno;

const isCompiled = execPath().match(/merge-stems-[a-z]$/) !== null;

const getCwd = () => {
	return isCompiled
		? join(execPath(), "./")
		: join(fromFileUrl(mainModule), "./");
};

export default getCwd;