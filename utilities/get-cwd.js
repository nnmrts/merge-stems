import {
	fromFileUrl,
	join
} from "std/path";

const {
	execPath,
	mainModule
} = Deno;

const isCompiled = execPath().endsWith("merge-stems");

const getCwd = () => {
	return isCompiled
		? join(execPath(), "./")
		: join(fromFileUrl(mainModule), "./");
};

export default getCwd;