import "reflect-metadata";
import "dotenv/config";

import { AppDataSource } from "./data-source";
import express from "express";

import AuthRouter from "./app/routes/auth.route";
import UserRouter from "./app/routes/user.route";
import StudentUserRouter from "./app/routes/student.user.route";
import EducatorUserRouter from "./app/routes/educator.user.route";

import SkillRouter from "./app/routes/skill.route";
import AdminSkillRouter from "./app/routes/admin.skill.route";
import CategoryRouter from "./app/routes/category.route";
import AdminCategoryRouter from "./app/routes/admin.category.route";

import ProductRouter from "./app/routes/product.route";
import EducatorProductRouter from "./app/routes/educator.product.route";

import ProductDetailRouter from "./app/routes/product-detail.route";
import EducatorProductDetailRouter from "./app/routes/educator.product-detail.route";
import AdminProductDetailRouter from "./app/routes/admin.product-detail.route";

import ViewHistoryRouter from "./app/routes/view-history.route";
import AdminViewHistoryRouter from "./app/routes/admin.view-history.route";
import FavoriteRouter from "./app/routes/favorite.route";
import AdminFavoriteRouter from "./app/routes/admin.favorite.route";

import AdminAllowedOriginRouter from "./app/routes/admin.allowed-origin.route";
import AdminForbiddenWordRouter from "./app/routes/admin.forbidden-word.route";


import { AllowedOriginService } from "./app/services/allowed-origin.service";

import cors from "cors";

import { transformMiddleware } from "./app/middlewares/transformer.middleware";
import { errorHandler } from "./app/middlewares/error-handler.middleware";
import { allowedOriginRepository } from "./app/repositories/allowed-origin.repository";
import { ForbiddenWordService } from "./app/services/forbidden-word.service";
import { forbiddenWordRepository } from "./app/repositories/forbidden-word.repository";

const app = express();
const port = 5000;

const allowedOriginService = new AllowedOriginService(allowedOriginRepository);
const forbiddenWordService = new ForbiddenWordService(forbiddenWordRepository);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOriginService.isOriginAllowed(origin)) {
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
    // Load allowed origins and forbidden words from DB
    await allowedOriginService.loadCache();
    await forbiddenWordService.loadCache();

    console.log("Connected to database");
    app.get("/", (req, res) => {
      res.send("🚀 Hello from TypeORM & Express!");
    });

    app.use("/api/auth", AuthRouter);
    app.use("/api/users", UserRouter);
    app.use("/api/students", StudentUserRouter);
    app.use("/api/educators", EducatorUserRouter);

    app.use("/api/skills", SkillRouter);
    app.use("/api/admin/skills", AdminSkillRouter);
    app.use("/api/categories", CategoryRouter);
    app.use("/api/admin/categories", AdminCategoryRouter);

    app.use("/api/products", ProductRouter);
    app.use("/api/educator/products", EducatorProductRouter);

    app.use("/api/products", ProductDetailRouter);
    app.use("/api/educator/products", EducatorProductDetailRouter);
    app.use("/api/admin/products", AdminProductDetailRouter);

    app.use("/api/users/me/view-history", ViewHistoryRouter);
    app.use("/api/admin/view-history", AdminViewHistoryRouter);
    app.use("/api/users/me/favorite", FavoriteRouter);
    app.use("/api/admin/favorite", AdminFavoriteRouter);

    app.use("/api/admin/allowed-origins", AdminAllowedOriginRouter);
    app.use("/api/admin/forbidden-words", AdminForbiddenWordRouter);

    app.use(errorHandler);
  })
  .catch((error) => console.log(error))
  .finally(() => {
    app.listen(port, () => {
      console.log(`🚀 Server is running at ${port}`);
    });
  });
