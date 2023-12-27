import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createCommunity,
    getAllCommunities,
    getAllMember,
    getMyJoinedCommunity,
    getMyOwnedCommunity,
} from "../controllers/community.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createCommunity);

router.route("/").get(verifyJWT, getAllCommunities);

router.route("/:id/members").get(verifyJWT, getAllMember);

router.route("/me/owner").get(verifyJWT, getMyOwnedCommunity);

router.route("/me/member").get(verifyJWT, getMyJoinedCommunity);

export default router;
