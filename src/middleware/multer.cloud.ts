import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { AppError } from "../utils/classError";
import os from "node:os";
import { v4 as uuidv4 } from "uuid";

export enum StorageEnum {
  disk = "disk",
  cloud = "cloud",
}

export const fileValidation = {
  image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "we"],
  audio: ["audio/mpeg", "audio/mp3"],
  file: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const multerCloud = ({
  fileTypes = fileValidation.image,
  storageType = StorageEnum.cloud,
  maxSize = 5,
}: {
  fileTypes?: string[];
  storageType?: StorageEnum;
  maxSize?: number;
}) => {
  const storage =
    storageType === StorageEnum.cloud
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: os.tmpdir(),
          filename: (req: Request, file: Express.Multer.File, cb) => {
            cb(null, `${uuidv4()}_${file.originalname}`);
          },
        });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (fileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      return cb(new AppError("Invalid file type", 400));
    }
  };
  const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * maxSize },
    fileFilter,
  });
  return upload;
};
