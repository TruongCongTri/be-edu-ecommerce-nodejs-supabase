import "reflect-metadata";
import "dotenv/config";

import { AppDataSource } from "./data-source";
import express from "express";

import AuthRouter from "./app/routes/auth.route";
import UserRouter from "./app/routes/user.route";
import SkillRouter from "./app/routes/skill.route";
import CategoryRouter from "./app/routes/category.route";
import LocationRouter from "./app/routes/location.route";
import JobRouter from "./app/routes/job.route";
import ApplicationRouter from "./app/routes/application.route";

import cors from "cors";
import { errorHandler } from "./app/middlewares/errorHandler";
import { transformMiddleware } from "./app/middlewares/transformer.middleware";

const app = express();
const port = 5000;

const allowedOrigins = ["http://localhost:3000", "https://your-domain.com"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(transformMiddleware());

AppDataSource.initialize()
  .then(async () => {
    console.log("Connected to database");
    app.get("/", (req, res) => {
      res.send("🚀 Hello from TypeORM & Express!");
    });

    app.use("/api/auth", AuthRouter);
    app.use("/api/user", UserRouter);

    app.use("/api/skills", SkillRouter);
    app.use("/api/categories", CategoryRouter);
    app.use("/api/locations", LocationRouter);
    app.use("/api/jobs", JobRouter);
    app.use("/api/applications", ApplicationRouter);

    app.use(errorHandler);

    app.listen(port, () => {
      console.log(`🚀 Server is running at ${port}`);
    });
  })
  .catch((error) => console.log(error));
