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
import { unlink } from "node:fs/promises";
import { basename, join } from "node:path";
import { maxAttachments } from "../utils/constants.js";
import { cleanupUploadedFiles } from "../utils/cleanupUploadedFiles.js";

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

const getTaskById = asyncHandler(async (req, res) => {

    const { projectId, taskId } = req.params;

    const task = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId),
                project: new mongoose.Types.ObjectId(projectId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtasks",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            createdBy: {
                                $arrayElemAt: ["$createdBy", 0],
                            },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                assignedTo: {
                    $arrayElemAt: ["$assignedTo", 0],
                },
            },
        },
    ]);

    if (!task || task.length === 0) {
        throw new ApiError(404, "Task not found in this project");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                task[0],
                "Task fetched successfully"
            )
        );
});

const createTask = asyncHandler (async (req, res) => {
    const { projectId } = req.params;
    const { title , description, assignedTo, status } = req.body;

    const uploadedFiles = req.files || [];
    let task;

    try {
        const project = await Project.findById(projectId);
    
        if (!project){
            throw new ApiError(404, "Project not found");
        }
    
        if (assignedTo) {
            const member = await ProjectMember.findOne({
                user: assignedTo,
                project: projectId,
            });
    
            if (!member) {
                throw new ApiError(400, "Assignee must be a member of this project");
            }
        }

    
        const attachments = uploadedFiles.map((file) => {
            return {
                url: `${process.env.SERVER_URL}/images/${file.filename}`,
                mimetype : file.mimetype,
                size: file.size,
            }
        });
    
        task = await Task.create({
            title,
            description,
            project: new mongoose.Types.ObjectId(projectId),
            assignedTo: assignedTo
                ? new mongoose.Types.ObjectId(assignedTo)
                : undefined,
            status,
            assignedBy: new mongoose.Types.ObjectId(req.user._id),
            attachments,
        });
    }
    catch (error) {
        if (uploadedFiles.length > 0){
            await cleanupUploadedFiles(uploadedFiles);
        }
        
        if (error instanceof ApiError){
            throw error;
        }
        else {
            throw new ApiError(500,'Failed to create the task' )
        }
    }

    return res
        .status(201)
        .json(new ApiResponse(201, task, "Task created successfully"));
});

const updateTask = asyncHandler (async (req, res) => {
    const { projectId , taskId } = req.params;
    const { title , description, assignedTo, status } = req.body;
    
    const uploadedFiles = req.files || [];
    let task;
    
    try {
        const project = await Project.findById(projectId);

        if (!project){
            throw new ApiError(404, "Project not found");
        }
    
        task = await Task.findOne(
            {
                _id : taskId,
                project: projectId,
            }
        );
    
        if (!task){
            throw new ApiError(404, "Task not found in this project");
        }
    
        const updateData = {};
    
        if (assignedTo) {
            if (assignedTo === null) {
                updateData.assignedTo = null;
            } else {
                const member = await ProjectMember.findOne({
                    user: assignedTo,
                    project: projectId,
                });
        
                if (!member) {
                    throw new ApiError(400, "Assignee must be a member of this project");
                }
    
                updateData.assignedTo = new mongoose.Types.ObjectId(assignedTo);
            }
        }
    
    
        if (title !== undefined) {
            updateData.title = title;
        }
    
        if (description !== undefined) {
            updateData.description = description;
        }
    
        if (status !== undefined) {
            updateData.status = status;
        }
    
        if (uploadedFiles.length) {
            if (task.attachments.length + uploadedFiles.length > maxAttachments) {
                throw new ApiError(
                    400,
                    `A task can have at most ${maxAttachments} attachments`
                );
            }
    
            const newAttachments = uploadedFiles.map((file) => ({
                url: `${process.env.SERVER_URL}/images/${file.filename}`,
                mimetype: file.mimetype,
                size: file.size,
            }));
    
            updateData.attachments = [
                ...task.attachments,
                ...newAttachments,
            ];
        }
    
        if (Object.keys(updateData).length === 0) {
            throw new ApiError(400, "At least one field must be provided to update");
        }
    
    
        task = await Task.findOneAndUpdate(
            { _id: taskId, project: projectId },
            updateData,
            { new: true }
        );
    
        if (!task){
            throw new ApiError(404, "Task not found in this project");
        }
    }
    catch (error) {
        if (uploadedFiles.length > 0){
            await cleanupUploadedFiles(uploadedFiles);
        }
        
        if (error instanceof ApiError){
            throw error;
        }
        else {
            throw new ApiError(500,'Failed to update the task' )
        }
    }
    
        
    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task was updated successfully"))
});

const deleteTask = asyncHandler (async (req, res) => {
    const { projectId , taskId } = req.params;
    const project = await Project.findById(projectId);

    if (!project){
        throw new ApiError(404, "Project not found");
    }

    const task = await Task.findOneAndDelete(
        {
            _id : taskId,
            project: projectId,
        }
    );
    
    if (!task){
        throw new ApiError(404, "Task not found in this project");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task deleted succesfully"))
})

const createSubTask = asyncHandler (async( req, res,)=> {
    const { projectId, taskId }  = req.params;
    const { title } = req.body;

    const task = await Task.findOne({
        _id : taskId,
        project: projectId
    });

    if (!task){
        throw new ApiError(404, "Task not found in this project");
    }

    const subtask = await Subtask.create({
        title,
        task: new mongoose.Types.ObjectId(taskId),
        isCompleted: false,
        createdBy: new mongoose.Types.ObjectId(req.user._id),
    });

    return res
        .status(201)
        .json(new ApiResponse(201, subtask, "Subtask created successfully"))
});

const deleteSubTask = asyncHandler(async (req, res) => {
    const { subTaskId, projectId } = req.params;

    let subtask = await Subtask.findById(subTaskId);

    if (!subtask){
        throw new ApiError(404, "Subtask does not exist");
    }

    const task = await Task.findOne({
        _id: subtask.task,
        project : projectId,
    })

    if (!task){
        throw new ApiError(404, "SubTask not found in the project")
    }

    subtask = await Subtask.findByIdAndDelete(subTaskId);

    return res
        .status(200)
        .json(new ApiResponse(200, subtask, "Subtask was deleted successfully"))
});

const updateSubTask = asyncHandler(async (req, res) => {
    const { subTaskId, projectId } = req.params;
    const { title, isCompleted } = req.body;

    let subtask = await Subtask.findById (subTaskId);
    
    if (!subtask){
        throw new ApiError(404, "Subtask does not exist")
    }

    const task = await Task.findOne({
        _id: subtask.task,
        project : projectId,
    })

    if (!task){
        throw new ApiError(404, "Subtask not found in the project")
    }

    const updateData = {};

    
    if (title !== undefined) {
        updateData.title = title;
    }
    
    if (isCompleted !== undefined){
        updateData.isCompleted = isCompleted;
    }
    

    subtask = await Subtask.findByIdAndUpdate(
        subTaskId,
        updateData
        ,
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, subtask, "Subtask was updated successfully"))

});

export {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    createSubTask,
    deleteSubTask,
    updateSubTask
}