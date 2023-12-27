import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessTokens } from "../utils/accessToken.js";
import { Snowflake } from "@theinternetfolks/snowflake";

const registerUser = asyncHandler(async (req, res) => {
    // get user data from req.body
    const { name, email, password } = req.body;
    console.log(name, email, password, Snowflake.generate());

    // validate user data - not empty, valid email, etc.
    if ([email, name, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // check if user already exists username or email
    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    // create user object - create entry in db
    const user = await User.create({
        _id: Snowflake.generate({
            timestamp: 1649157035498,
            shard_id: 4,
        }),
        name,
        email,
        password,
    });

    // remove password field from response
    const createdUser = await User.findById(user._id).select("-password");

    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }
    const { accessToken } = await generateAccessTokens(user._id);

    const data = {
        data: createdUser,
        meta: { access_token: accessToken },
    };

    // return response
    return res
        .status(201)
        .json(new ApiResponse(200, data, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, " email is required");
    }

    const user = await User.findOne({
        email,
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken } = await generateAccessTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: true,
    };
    const data = {
        data: loggedInUser,
        meta: { access_token: accessToken },
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, data, "User logged In Successfully"));
});

const getMe = asyncHandler(async (req, res) => {
    const data = {
        data: req.user,
    };
    return res
        .status(200)
        .json(new ApiResponse(200, data, "User fetched successfully"));
});

export { registerUser, loginUser, getMe };
