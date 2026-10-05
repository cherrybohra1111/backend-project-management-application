import multer from "multer";

export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const statusCode =
            err.code === "LIMIT_FILE_SIZE" ? 413 : 400;

        return res.status(statusCode).json({
            statusCode,
            message:
                err.code === "LIMIT_FILE_SIZE"
                    ? "Uploaded file exceeds the 1 MB size limit"
                    : "Invalid file upload",
            success: false,
            errors: [],
        });
    }

    next(err);
};