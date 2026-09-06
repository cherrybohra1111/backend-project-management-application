import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js"
import { ProjectMember } from "../models/projectmember.models.js"
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";


const createProject = asyncHandler (async (req,res)=>{
    const { name , description } = req.body;

    const project = await Project.create({
        name,
        description,
        createdBy : new mongoose.Types.ObjectId(req.user._id),
    });

    if (!project) {
        throw new ApiError(500, "Project couldn't be created")
    }

    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: UserRolesEnum.ADMIN,
    })

    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project created successfully"))

});

export {
    createProject,
}