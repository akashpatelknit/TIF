import { asyncHandler } from "../utils/asyncHandler.js";
import { Community } from "../models/community.model.js";
import slugify from "slugify";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import { User } from "../models/user.model.js";
import { Role } from "../models/role.model.js";
import { Member } from "../models/member.model.js";

export const createCommunity = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const slugifyOptions = {
        replacement: "-",
        remove: /[*+~.()'"!:@#1234567890$]/g,
        lower: true,
    };

    const isCommunityExist = await Community.findOne({ name });
    if (isCommunityExist) {
        throw new ApiError(400, "Community already exists");
    }

    const community = await Community.create({
        _id: Snowflake.generate({
            timestamp: 1649157035498,
            shard_id: 4,
        }),
        name,
        slug: slugify(name, slugifyOptions),
        owner: req.user._id,
    });

    if (!community) {
        throw new ApiError(
            500,
            "Something went wrong while creating community"
        );
    }

    const role = await Role.findOne({ name: "Community Admin" });
    if (!role) {
        throw new ApiError(500, "Something went wrong while fetching role");
    }

    const member = await Member.create({
        _id: Snowflake.generate({
            timestamp: 1649157035498,
            shard_id: 4,
        }),
        community: community._id,
        user: req.user._id,
        role: role._id,
    });

    if (!member) {
        throw new ApiError(500, "Something went wrong while adding member");
    }

    const data = {
        data: community,
    };
    return res
        .status(201)
        .json(new ApiResponse(201, data, "Community created successfully"));
});

export const getAllCommunities = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Calculate the skip value
    const skip = (page - 1) * limit;

    const totalCommunities = await Community.aggregate([
        { $match: { owner: req.user._id } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            },
        },
        {
            $addFields: {
                owner: {
                    $arrayElemAt: ["$ownerDetails", 0],
                },
            },
        },
        {
            $skip: skip,
        },
        { $limit: limit },
        {
            $project: {
                _id: 1,
                name: 1,
                slug: 1,
                owner: {
                    _id: 1,
                    name: 1,
                },
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    const totalPages = Math.ceil(totalCommunities.length / limit);

    const response = {
        meta: {
            total: totalCommunities.length,
            pages: totalPages,
            page: page,
        },
        data: totalCommunities,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(200, response, "Communities fetched successfully")
        );
});

export const getAllMember = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { id } = req.params;

    // Calculate the skip value
    const skip = (page - 1) * limit;

    const allMember = await Member.aggregate([
        {
            $match: {
                community: id,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userDetails",
            },
        },

        {
            $addFields: {
                user: {
                    $arrayElemAt: ["$userDetails", 0],
                },
            },
        },
        {
            $lookup: {
                from: "roles",
                localField: "role",
                foreignField: "_id",
                as: "roleDetails",
            },
        },
        {
            $addFields: {
                role: {
                    $arrayElemAt: ["$roleDetails", 0],
                },
            },
        },
        {
            $skip: skip,
        },
        { $limit: limit },
        {
            $project: {
                _id: 1,
                community: 1,
                user: {
                    _id: 1,
                    name: 1,
                },
                role: {
                    _id: 1,
                    name: 1,
                },
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    const totalPages = Math.ceil(allMember.length / limit);

    const response = {
        meta: {
            total: allMember.length,
            pages: totalPages,
            page: page,
        },
        data: allMember,
    };
    return res
        .status(200)
        .json(new ApiResponse(200, response, "Members fetched successfully"));
});

export const getMyOwnedCommunity = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Calculate the skip value
    const skip = (page - 1) * limit;

    // Create options object
    const myOwnedCommunity = await Community.aggregate([
        {
            $match: {
                owner: req.user._id,
            },
        },
    ]);

    const totalPages = Math.ceil(myOwnedCommunity.length / limit);

    const response = {
        meta: {
            total: myOwnedCommunity.length,
            pages: totalPages,
            page: page,
        },
        data: myOwnedCommunity,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(200, response, "Communities fetched successfully")
        );
});

export const getMyJoinedCommunity = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Calculate the skip value
    const skip = (page - 1) * limit;

    // Create options object
    const options = {
        skip: skip,
        limit: limit,
        collation: { locale: "en" },
    };

    const totalCommunities = await Member.countDocuments({
        user: req.user._id,
    });

    const communities = await Member.aggregate([
        {
            $match: {
                user: req.user._id,
            },
        },
        {
            $lookup: {
                from: "communities",
                localField: "community",
                foreignField: "_id",
                as: "communityDetails",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "communityDetails.owner",
                foreignField: "_id",
                as: "ownerDetails",
            },
        },
        {
            $unwind: "$communityDetails",
        },
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },
        {
            $project: {
                _id: "$communityDetails._id",
                name: "$communityDetails.name",
                slug: "$communityDetails.slug",
                owner: {
                    _id: { $arrayElemAt: ["$ownerDetails._id", 0] },
                    name: { $arrayElemAt: ["$ownerDetails.name", 0] },
                },
                createdAt: "$communityDetails.createdAt",
                updatedAt: "$communityDetails.updatedAt",
            },
        },
    ]);

    const totalPages = Math.ceil(totalCommunities / limit);

    const response = {
        meta: {
            total: totalCommunities,
            pages: totalPages,
            page: page,
        },
        data: communities,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(200, response, "Communities fetched successfully")
        );
});
