import { Router } from "express";

import {
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjects,
    addMembersToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember,
} from "../controllers/project.controllers.js"

import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateProjectPermission } from "../middlewares/role.middleware.js";

import {
    addMemberToProjectValidator,
    createProjectValidator,
    projectIdValidator,
    projectMemberParamsValidator,
    updateMemberRoleValidator,
} from "../validators/index.js";

import { 
    AvailableUserRole, 
    UserRolesEnum 
} from "../utils/constants.js";

const router = Router();
router.use(verifyJWT);

 // ====================== PROJECT ========================
router
  .route("/")
  .get(getProjects)
  .post(createProjectValidator(), validate, createProject);

router
  .route("/:projectId")
  .get(
        projectIdValidator(), 
        validate ,
        validateProjectPermission(AvailableUserRole), 
        getProjectById
    )
  .put(
        [
            ...projectIdValidator(),
            ...createProjectValidator(),
        ],
        validate,
        validateProjectPermission([UserRolesEnum.ADMIN]),
        updateProject
    )
  .delete(
        projectIdValidator(),
        validate,
        validateProjectPermission([UserRolesEnum.ADMIN]), 
        deleteProject
    );


router
  .route("/:projectId/members")
  .get(  
        projectIdValidator(),
        validate,
        getProjectMembers
    )
  .post(
        [
            ...projectIdValidator(),
            ...addMemberToProjectValidator(),
        ],
        validate,
        validateProjectPermission([UserRolesEnum.ADMIN]),
        addMembersToProject
    );

router
  .route("/:projectId/members/:userId")
  .put(
        [
            ...projectMemberParamsValidator(),
            ...updateMemberRoleValidator(),
        ],
        validate,
        validateProjectPermission([UserRolesEnum.ADMIN]),
        updateMemberRole
    )
  .delete(
        projectMemberParamsValidator(),
        validate,
        validateProjectPermission([UserRolesEnum.ADMIN]),
        deleteMember
    );


export default router;
