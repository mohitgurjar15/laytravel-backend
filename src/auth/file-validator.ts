import { extname } from "path";

export const imageFileFilter = (req, file, callback) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
		req.fileValidationError = "Only Images are allowed.";
		req.statusCode = 422;
		return callback(null, false, new Error(req.fileValidationError), file.originialname);
	}
	callback(null, true);
};


export const csvFileFilter = (req, file, callback) => {
	if (!file.originalname.match(/\.(csv)$/)) {
		req.fileValidationError = "Only csv are allowed.";
		req.statusCode = 422;
		return callback(null, false, new Error(req.fileValidationError), file.originialname);
	}
	callback(null, true);
};


export const editFileName = (req, file, callback) => {
	let name = file.originalname.split(".")[0];
	name = name.split(" ").join("");
	const fileExtName = extname(file.originalname);
	const randomName = Array(4)
		.fill(null)
		.map(() => Math.round(Math.random() * 16).toString(16))
		.join("");
	callback(null, `${name}-${randomName}${fileExtName}`);
};
