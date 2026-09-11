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

const createTask = asyncHandler (async (req, res) => {
    const { projectId } = req.params;
    const { title , description, assignedTo, status } = req.body;
    const project = await Project.findById(projectId);

    if (!project){
        throw new ApiError(404, "Project not found");
    }

    const files = req.files || [];

    const attachments = files.map((file) => {
        return {
            url: `${process.env.SERVER_URL}/images/${file.filename}`,
            mimetype : file.mimetype,
            size: file.size,
        }
    });

    const task = await Task.create({
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
    
    return res
        .status(201)
        .json(new ApiResponse(201, task, "Task created successfully"));
});

const updateTask = asyncHandler (async (req, res) => {
    const { projectId , taskId } = req.params;
    const project = await Project.findById(projectId);
    const { title , description, assignedTo, status } = req.body;
    
    if (!project){
        throw new ApiError(404, "Project not found");
    }
    
    let task =  await Task.findById(taskId);
    if (!task){
        throw new ApiError(404, "Task not found");
    }

    const updateData = {};

    if (title !== undefined) {
        updateData.title = title;
    }

    if (description !== undefined) {
        updateData.description = description;
    }

    if (assignedTo !== undefined) {
        updateData.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }

    if (status !== undefined) {
        updateData.status = status;
    }

    if (req.files?.length) {
        const newAttachments = req.files.map((file) => ({
            url: `${process.env.SERVER_URL}/images/${file.filename}`,
            mimetype: file.mimetype,
            size: file.size,
        }));

        updateData.attachments = [
            ...task.attachments,
            ...newAttachments,
        ];
    }

    task = await Task.findByIdAndUpdate(
        taskId,
        updateData,
        {new : true}
    );


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