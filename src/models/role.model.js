import mongoose, { Schema } from "mongoose";
import { Snowflake } from "@theinternetfolks/snowflake";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const roleSchema = new Schema(
    {
        _id: {
            type: String,
            required: [true, "Id is required"],
            default: Snowflake.generate({
                timestamp: 1649157035498,
                shard_id: 4,
            }),
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            unique: true,
            minlength: 2,
        },
    },
    { timestamps: true }
);

roleSchema.plugin(aggregatePaginate);

export const Role = mongoose.model("role", roleSchema);
