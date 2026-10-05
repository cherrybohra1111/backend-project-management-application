import multer from "multer";
import { allowedMimeTypes, maxAttachments } from "../utils/constants.js"
import { ApiError } from "../utils/api-error.js";

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, `./public/images`);
    },
    filename: function(req, file, cb) {
        cb(null,`${Date.now()}-${file.originalname}`)
    }
});

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)){
        cb(null, true);
    }
    else {
        cb(new ApiError(415, "Unsupported file type"));
    }
}
export const upload = multer ({
    storage,
    fileFilter : fileFilter,
    limits: {
        fileSize: 1*1024*1024,
        files : maxAttachments 
    },
});