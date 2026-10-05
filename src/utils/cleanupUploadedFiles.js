import { unlink } from "node:fs/promises";

export const cleanupUploadedFiles = async (files) => {
    const results = await Promise.allSettled(
        files.map((file) => unlink(file.path))
    );

    for (const result of results) {
        if (result.status === "rejected") {
            throw new ApiError("Failed to remove uploaded file:", result.reason);
        }
    }
};
