import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Snowflake } from "@theinternetfolks/snowflake";

const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: Snowflake.generate({
                timestamp: 1649157035498,
                shard_id: 4,
            }),
        },
        name: {
            type: String,
            required: true,
            trim: true,
            default: "",
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// userSchema.pre("save", function (next) {
//     if (!this.id) {
//         // Check if id doesn't exist
//         this.id = Snowflake.generate(); // Generate a new snowflake id
//     }
//     next();
// });

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
