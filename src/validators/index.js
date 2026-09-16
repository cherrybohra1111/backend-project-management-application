import { body , param } from "express-validator";
import { AvailableUserRole, AvailableTasKStatues } from "../utils/constants.js";

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Please provide a valid email address")
            .normalizeEmail(),

        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be in lowercase")
            .isLength({ min: 3, max: 30 })
            .withMessage("Username must be between 3 and 30 characters")
            .matches(/^[a-z0-9_]+$/)
            .withMessage(
                "Username can only contain lowercase letters, numbers, and underscores"
            ),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8, max: 128 })
            .withMessage("Password must be between 8 and 128 characters"),

        body("fullName")
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage("Full name cannot exceed 100 characters"),
    ];
}

const userLoginValidator = () =>{
    return [
        body ("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid")
            .normalizeEmail(),

        body("password")
            .notEmpty()
            .withMessage("Password is required"),
    ]
}

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword")
            .notEmpty()
            .withMessage("Old Password is required"),

        body("newPassword")
            .notEmpty()
            .withMessage("New Password is required")
            .isLength({ min: 8, max: 128 })
            .withMessage("Password must be between 8 and 128 characters"),

    ];
};

const userForgotPasswordValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
    ];
}

const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword")
            .notEmpty()
            .withMessage("New Password is required")
            .isLength({ min: 8, max: 128 })
            .withMessage("Password must be between 8 and 128 characters"),
    ];
}

const createProjectValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Project name is required")
            .isLength({ min: 3, max: 100 })
            .withMessage("Project name must be between 3 and 100 characters"),

        body("description")
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage("Description cannot exceed 500 characters"),
    ];
};

const projectIdValidator = () => {
    return [
        param("projectId")
            .isMongoId()
            .withMessage("Invalid project ID"),
    ];
};

const projectMemberParamsValidator = () => {
    return [
        param("projectId")
            .isMongoId()
            .withMessage("Invalid project ID"),

        param("userId")
            .isMongoId()
            .withMessage("Invalid user ID"),
    ];
};

const updateMemberRoleValidator = () => {
    return [
        body("newRole")
            .notEmpty()
            .withMessage("New role is required")
            .isIn(AvailableUserRole)
            .withMessage("Invalid role"),
    ];
};

const addMemberToProjectValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(AvailableUserRole)
      .withMessage("Role is invalid"),
  ];
};

const taskIdValidator = () => {
    return [
        param("taskId")
            .isMongoId()
            .withMessage("Invalid task ID"),
    ];
};

const createTaskValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Task title is required")
            .isLength({ min: 3, max: 200 })
            .withMessage("Task title must be between 3 and 200 characters"),

        body("description")
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage("Task description cannot exceed 1000 characters"),

        body("assignedTo")
            .optional()
            .isMongoId()
            .withMessage("Invalid assigned user ID"),

        body("status")
            .optional()
            .isIn(AvailableTasKStatues)
            .withMessage("Invalid task status"),
    ];
};


const updateTaskValidator = () => {
    return [
        body("title")
            .optional()
            .trim()
            .isLength({ min: 3, max: 200 })
            .withMessage("Task title must be between 3 and 200 characters"),

        body("description")
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage("Task description cannot exceed 1000 characters"),

        body("assignedTo")
            .optional()
            .isMongoId()
            .withMessage("Invalid assigned user ID"),

        body("status")
            .optional()
            .isIn(AvailableTasKStatues)
            .withMessage("Invalid task status"),
    ];
};

export {
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,

    addMemberToProjectValidator,
    createProjectValidator,
    projectIdValidator,
    projectMemberParamsValidator,
    updateMemberRoleValidator,
    
    taskIdValidator,
    createTaskValidator,
    updateTaskValidator
}