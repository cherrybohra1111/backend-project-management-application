import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js"
import { ProjectMember } from "../models/projectmember.models.js"
import { Task } from "../models/task.models.js"
import { Subtask } from "../models/subtask.models.js"
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { pipeline } from "nodemailer/lib/xoauth2/index.js"


const getTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project){
        throw new ApiError(404, "Project not found");
    }

    const tasks = await Task.find({
        project: new mongoose.Types.ObjectId(projectId),
    }).populate("assignedTo","avatar username fullName");

    return res
        .status(200)
        .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

export {
    getTasks,
}