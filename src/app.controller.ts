import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve("./config/.env") });
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { AppError } from "./utils/classError";
import userRouter from "./modules/users/user.controller";
import connectionDB from "./DB/connectionDB";

const app: express.Application = express();
const port: string | number = process.env.PORT || 5000;
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  message: {
    error: "Game Over...... 😡",
  },
  statusCode: 429,
  legacyHeaders: false,
});

// Initialize all application features
const bootstrap = async () => {
  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(limiter);

  // Routes
  app.get("/", (req: Request, res: Response, next: NextFunction) => {
    return res
      .status(200)
      .json({ message: "Welcome on my social media app..... ❤️" });
  });

  app.use("/users", userRouter);

  // Database connection
  await connectionDB();

  // Handle invalid routes
  app.use("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
    throw new AppError(`InValid Url ${req.originalUrl}`, 404);
  });

  // Global Error Handling
  app.use((err: AppError, Req: Request, res: Response, next: NextFunction) => {
    return res.status((err.statusCode as unknown as number) || 500).json({
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
    });
  });

  // Start server
  app.listen(port, () => {
    console.log(`server is running on port ${port}.... 👀`);
  });
};

export default bootstrap;
