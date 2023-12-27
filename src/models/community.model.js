import mongoose from "mongoose";
import { Snowflake } from "@theinternetfolks/snowflake";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const communitySchema = new mongoose.Schema(
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
            required: true,
            minlength: 2,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        owner: {
            type: String, // userId
            required: true,
        },
    },
    { timestamps: true }
);

communitySchema.plugin(aggregatePaginate);

export const Community = mongoose.model("community", communitySchema);
