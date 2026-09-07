import { ProjectMember } from "../models/projectmember.models.js"
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";

export const validateProjectPermission = (roles = []) => {
    return asyncHandler (async (req, res, next) => {
        const { projectId } = req.params; 

        if (!projectId) {
            throw new ApiError (400, "project id is missing");
        }

        const projectMember  = await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id),
        });

        if (!projectMember) {
            throw new ApiError(403, "You are not a member of this project");
        }

        const givenRole = projectMember?.role;

        req.user.role = givenRole;

        if (!roles.includes(givenRole)) {
            throw new ApiError(
                403,
                "You do not have the permission to perform this action",
            );
        }

        next();
    });
};