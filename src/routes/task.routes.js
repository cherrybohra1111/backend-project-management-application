import { Router } from "express";

import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    createSubTask,
    deleteSubTask,
    updateSubTask
} from "../controllers/task.controllers.js"

import {
        projectIdValidator,
        taskIdValidator,
        createTaskValidator,
        updateTaskValidator,
    
        subTaskIdValidator,
        createSubTaskValidator,
        updateSubTaskValidator,
} from "../validators/index.js"

import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateProjectPermission } from "../middlewares/role.middleware.js";
import { UserRolesEnum , TaskStatusEnum} from "../utils/constants.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

//=========== Task and subtask routes =============

router
    .route("/:projectId")
    .get(
        projectIdValidator(),
        validate,
        validateProjectPermission(AvailableUserRole),
        getTasks
    )
    .post(
        projectIdValidator(),
        createTaskValidator(),
        validate,
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN
        ]),
        createTask
    )

router
    .route("/:projectId/t/:taskId")
    .get(
        projectIdValidator(),
        taskIdValidator(),
        validate,
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
            UserRolesEnum.MEMBER
        ]),
        getTaskById,
    )
    .put(
        projectIdValidator(),
        taskIdValidator(),
        upload.array("attachments"),
        updateTaskValidator(),
        validate,
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        updateTask,
    )
    .delete(
        projectIdValidator(),
        taskIdValidator(),
        validate,
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        deleteTask,
    );



export default router;
