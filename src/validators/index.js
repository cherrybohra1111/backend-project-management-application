import { body } from "express-validator";

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

export {
    userRegisterValidator,
    userLoginValidator
}