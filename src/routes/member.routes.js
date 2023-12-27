import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addMember, deleteMember } from "../controllers/member.controller.js";

const router = Router();

router.route("/").post(verifyJWT, addMember);

router.route("/:id").delete(verifyJWT, deleteMember);

export default router;
