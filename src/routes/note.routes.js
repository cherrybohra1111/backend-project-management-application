import { Router } from "express";

import {
    createNote,
    deleteNote,
    updateNote,
    getNotes,
    getNoteById,
} from "../controllers/note.controllers.js"

import {
    projectIdValidator,
    noteIdValidator,
    createNoteValidator,
    updateNoteValidator,
} from "../validators/index.js"

import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateProjectPermission } from "../middlewares/role.middleware.js";
import { UserRolesEnum , AvailableUserRole} from "../utils/constants.js";

const router = Router();
router.use(verifyJWT);

router
    .route("/:projectId")
    .get(
        projectIdValidator(),
        validate,
        validateProjectPermission(AvailableUserRole),
        getNotes
    )
    .post(
        projectIdValidator(),
        createNoteValidator(),
        validate,
        validateProjectPermission([UserRolesEnum.ADMIN]),
        createNote
    )

router
    .route("/:projectId/n/:noteId")
    .get(
        projectIdValidator(),
        noteIdValidator(),
        validate,
        validateProjectPermission(AvailableUserRole),
        getNoteById
    )
    .put(
        projectIdValidator(),
        noteIdValidator(),
        updateNoteValidator(),
        validate,
        validateProjectPermission([UserRolesEnum.ADMIN]),
        updateNote
    )
    .delete(
        projectIdValidator(),
        noteIdValidator(),
        validate,
        validateProjectPermission([UserRolesEnum.ADMIN]),
        deleteNote
    )

export default router;
