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
import {
  deleteFile,
  deleteFiles,
  getFile,
  getFilePresignedUrl,
  listFiles,
} from "./utils/s3.config";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";

const writePipeLine = promisify(pipeline);

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

  // app.get(
  //   "/upload/",
  //   async (req: Request, res: Response, next: NextFunction) => {
  //     // const { path } = req.params as unknown as { path: string[] };
  //     // const Key = path.join("/");

  //     // const result = await deleteFiles({
  //     //   urls:[
  //     //     "socialMediaApp/users/68e285fda958308b84d8d3d8/0246eb25-270e-44cf-9710-15792a0b65a2_Cinematic Portrait o.jpg",
  //     //     "socialMediaApp/users/68e285fda958308b84d8d3d8/28776707-8509-449d-a9c6-e8db0b1a09e8_Concept_Art_In_the_depths_of_the_cosmos_a_shimmering_celestial_0.jpg"
  //     //   ],
  //     //   Quiet: true
  //     // });

  //     let result = await listFiles({
  //       path: "users/68e285fda958308b84d8d3d8/coverImage/",
  //     });
  //     console.log(result);
  //     if (!result?.Contents) {
  //       throw new AppError("No files found", 404);
  //     }
  //     result = result?.Contents?.map(
  //       (item) => item.Key
  //     ) as unknown as ListObjectsV2CommandOutput;

  //     await deleteFiles({
  //       urls: result as unknown as string[],
  //       Quiet: true,
  //     });
  //     return res.status(200).json({ message: "success", result });
  //   }
  // );

  // app.get(
  //   "/upload/pre-signed/*path",
  //   async (req: Request, res: Response, next: NextFunction) => {
  //     const { path } = req.params as unknown as { path: string[] };
  //     const { downloadName } = req.query as { downloadName: string };
  //     const Key = path.join("/");

  //     const url = await getFilePresignedUrl({
  //       Key,
  //       downloadName: downloadName ? downloadName : undefined,
  //     });
  //     return res.status(200).json({ message: "success", url });
  //   }
  // );

  app.get(
    "/upload/*path",
    async (req: Request, res: Response, next: NextFunction) => {
      const { path } = req.params as unknown as { path: string[] };
      const { downloadName } = req.query as { downloadName: string };
      const Key = path.join("/");

      const result = await getFile({
        Key,
      });
      const stream = result.Body as NodeJS.ReadableStream;
      res.setHeader("Content-Type", result?.ContentType!);
      if (downloadName) {
        res.setHeader(
          "Content-disposition",
          `attachment; filename="${downloadName || Key.split("/").pop()}"`
        );
      }
      await writePipeLine(stream, res);
    }
  );

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
