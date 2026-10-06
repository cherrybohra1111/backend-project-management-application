import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";
import { cleanupUploadedFiles } from "../utils/cleanupUploadedFiles.js";

export const validate = async (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    const extractedErrors =[];

    errors.array().map((err) => extractedErrors.push({
            [err.path] : err.msg,
    }));

    const files = Array.isArray(req.files) ? req.files : [];
    await cleanupUploadedFiles(files);
    
    throw new ApiError(422, "Received data is not valid",
        extractedErrors);
};