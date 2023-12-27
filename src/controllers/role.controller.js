import { Role } from "../models/role.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Snowflake } from "@theinternetfolks/snowflake";

export const createRole = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const role = await Role.create({
        _id: Snowflake.generate({
            timestamp: 1649157035498,
            shard_id: 4,
        }),
        name,
    });

    if (!role) {
        throw new ApiError(500, "Something went wrong while creating role");
    }
    const data = {
        data: role,
    };
    return res
        .status(201)
        .json(new ApiResponse(201, data, "Role created successfully"));
});

export const getRoles = asyncHandler(async (req, res) => {
    const roles = await Role.find();

    if (!roles) {
        throw new ApiError(500, "Something went wrong while fetching roles");
    }
    const data = {
        data: roles,
    };
    return res
        .status(200)
        .json(new ApiResponse(200, data, "Roles fetched successfully"));
});
