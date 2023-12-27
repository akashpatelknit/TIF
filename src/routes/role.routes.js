import { Router } from "express";
import { createRole, getRoles } from "../controllers/role.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createRole);

router.route("/").get(verifyJWT, getRoles);

export default router;
