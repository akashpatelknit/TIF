import { Router } from "express";
import {
    getMe,
    loginUser,
    registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(registerUser);

router.route("/signin").post(loginUser);

router.route("/me").get(verifyJWT, getMe);

export default router;
