export const UserRolesEnum = {
    ADMIN : "admin",
    PROJECT_ADMIN : "project_admin",
    MEMBER: "member"
}

export const AvailableUserRole = Object.values(UserRolesEnum)

export const TaskStatusEnum = {
    TODO : "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done"
}

export const AvailableTasKStatues = Object.values(TaskStatusEnum);

export const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const maxAttachments = 5; 