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

const deleteNote = asyncHandler(async(req, res) => {
    const { projectId, noteId } = req.params;

    const note = await ProjectNote.findOne({
        _id: noteId,
        project : projectId,
    });

    if (!note){
        throw new ApiError (404, "Note do not exist in the project");
    }

    await ProjectNote.findByIdAndDelete(noteId);

    return res
        .status(200)
        .json(new ApiResponse(200, note, "Note deleted successfully"))

})

const updateNote = asyncHandler(async(req, res)  => {
    const { projectId, noteId } = req.params;
    const { content } = req.body;

    let note = await ProjectNote.findOne({
        _id: noteId,
        project : projectId,
    });

    if (!note){
        throw new ApiError (404, "Note does not exist in the project");
    }

    note = await ProjectNote.findByIdAndUpdate(
        noteId,
        {
            content,
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, note, "Note updated successfully"))
});

export {
    createNote,
    deleteNote,
    updateNote,
}