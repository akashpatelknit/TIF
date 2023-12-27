import mongoose from "mongoose";
import { Snowflake } from "@theinternetfolks/snowflake";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const memberSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: Snowflake.generate({
                timestamp: 1649157035498,
                shard_id: 4,
            }),
        },
        community: {
            type: String, // communityId
            required: true,
        },
        user: {
            type: String, // userId
            required: true,
        },
        role: {
            type: String, // roleId
            required: true,
        },
    },
    { timestamps: true }
);

memberSchema.plugin(aggregatePaginate);

export const Member = mongoose.model("member", memberSchema);
