import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";

export const generateAccessTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();

        return { accessToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating  access token"
        );
    }
};
