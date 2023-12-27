import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// USER ROUTES
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/auth", userRouter);

// COMMUNITY ROUTES
import communityRouter from "./routes/community.routes.js";
app.use("/api/v1/community", communityRouter);

// ROLE ROUTES
import roleRouter from "./routes/role.routes.js";
app.use("/api/v1/role", roleRouter);

// MEMBER ROUTES
import memberRouter from "./routes/member.routes.js";
app.use("/api/v1/member", memberRouter);

app.get("/", (req, res) => {
    res.send("⚙️ ⚙️ ⚙️ Every thing is working fine  ⚙️ ⚙️ ⚙️");
});

export { app };
