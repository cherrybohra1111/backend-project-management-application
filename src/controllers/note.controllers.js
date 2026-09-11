import { Project } from "../models/project.models.js"
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ProjectNote } from "../models/note.models.js"
import mongoose from "mongoose";

const createNote = asyncHandler(async(req, res) => {
    const { projectId } = req.params;
    const { content } = req.body;

    const project = await Project.findById(projectId);

    if (!project){
        throw new ApiError (404, "Project do not exist");
    }

    const note = await ProjectNote.create({
        project: new mongoose.Types.ObjectId(projectId),
        createdBy: new mongoose.Types.ObjectId(req.user._id),
        content,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, note, "Note created successfully"))
});

export {
    createNote,
}