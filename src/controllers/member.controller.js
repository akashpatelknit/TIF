import { asyncHandler } from "../utils/asyncHandler.js";
import { Member } from "../models/member.model.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Community } from "../models/community.model.js";

export const addMember = asyncHandler(async (req, res) => {
    const { community, user, role } = req.body;

    const communityExists = await Community.findOne({ _id: community });
    if (!communityExists) {
        throw new ApiError(404, "Community not found");
    }

    const userExists = await User.findOne({ _id: user });
    if (!userExists) {
        throw new ApiError(404, "User not found");
    }

    const isMember = await Member.findOne({
        community: community,
        user: user,
        role: role,
    });

    if (isMember) {
        throw new ApiError(400, "Member already exists");
    }

    const member = await Member.create({
        _id: Snowflake.generate({
            timestamp: 1649157035498,
            shard_id: 4,
        }),
        community: community,
        user: user,
        role: role,
    });

    if (!member) {
        throw new ApiError(500, "Something went wrong while adding member");
    }
    const data = {
        data: member,
    };
    return res
        .status(201)
        .json(new ApiResponse(201, data, "Member added successfully"));
});

export const deleteMember = asyncHandler(async (req, res) => {});
