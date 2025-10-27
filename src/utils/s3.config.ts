import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { StorageEnum } from "../middleware/multer.cloud";
import { AppError } from "./classError";
import { v4 as uuidv4 } from "uuid";
import { createReadStream } from "fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = () => {
  return new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
};

export const uploadFile = async ({
  storageType = StorageEnum.cloud,
  Bucket = process.env.AWS_BUCKET_NAME!,
  path = "general",
  ACL = "private" as ObjectCannedACL,
  file,
}: {
  storageType?: StorageEnum;
  Bucket?: string;
  path: string;
  ACL?: ObjectCannedACL;
  file: Express.Multer.File;
}): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Key: `${process.env.APPLICATION_NAME}/${path}/${uuidv4()}_${
      file.originalname
    }`,
    Body:
      storageType === StorageEnum.cloud
        ? file.buffer
        : createReadStream(file.path),
    ContentType: file.mimetype,
  });

  await s3Client().send(command);
  if (!command.input.Key) {
    throw new AppError("Failed to upload file to s3", 500);
  }
  return command.input.Key;
};

export const uploadLargeFile = async ({
  storageType = StorageEnum.cloud,
  Bucket = process.env.AWS_BUCKET_NAME!,
  path = "general",
  ACL = "private" as ObjectCannedACL,
  file,
}: {
  storageType?: StorageEnum;
  Bucket?: string;
  path: string;
  ACL?: ObjectCannedACL;
  file: Express.Multer.File;
}): Promise<string> => {
  const upload = new Upload({
    client: s3Client(),
    params: {
      Bucket,
      ACL,
      Key: `${process.env.APPLICATION_NAME}/${path}/${uuidv4()}_${
        file.originalname
      }`,
      Body:
        storageType === StorageEnum.cloud
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype,
    },
  });
  upload.on("httpUploadProgress", (progress) => {
    console.log(progress);
  });

  const { Key } = await upload.done();
  if (!Key) {
    throw new AppError("Failed to upload file to s3", 500);
  }
  return Key;
};

export const uploadFiles = async ({
  storageType = StorageEnum.cloud,
  Bucket = process.env.AWS_BUCKET_NAME!,
  path = "general",
  ACL = "private" as ObjectCannedACL,
  files,
  useLarge = false,
}: {
  storageType?: StorageEnum;
  Bucket?: string;
  path: string;
  ACL?: ObjectCannedACL;
  files: Express.Multer.File[];
  useLarge?: boolean;
}) => {
  let urls: string[] = [];
  if (useLarge) {
    urls = await Promise.all(
      files.map((file) =>
        uploadLargeFile({
          storageType,
          Bucket,
          path,
          ACL,
          file,
        })
      )
    );
  } else {
    urls = await Promise.all(
      files.map((file) =>
        uploadFile({
          storageType,
          Bucket,
          path,
          ACL,
          file,
        })
      )
    );
  }
  return urls;
};

export const createUploadFilePresignedUrl = async ({
  Bucket = process.env.AWS_BUCKET_NAME!,
  path = "general",
  originalName,
  ContentType,
  expiresIn = 60 * 60,
}: {
  Bucket?: string;
  path?: string;
  originalName: string;
  ContentType: string;
  expiresIn?: number;
}) => {
  const Key = `${
    process.env.APPLICATION_NAME
  }/${path}/${uuidv4()}_${originalName}`;
  const command = new PutObjectCommand({
    Bucket,
    Key,
    ContentType,
  });
  const url = await getSignedUrl(s3Client(), command, { expiresIn });
  return { url, Key };
};

export const getFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME!,
  Key,
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
  });
  return await s3Client().send(command);
};

export const getFilePresignedUrl = async ({
  Bucket = process.env.AWS_BUCKET_NAME!,
  Key,
  expiresIn = 60,
  downloadName
}: {
  Bucket?: string;
  Key: string;
  expiresIn?: number;
  downloadName?: string | undefined;
}) => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
    ResponseContentDisposition: downloadName ?  `attachment; filename="${
            downloadName
          }"` : undefined,
  });

  const url = await getSignedUrl(s3Client(), command, { expiresIn });
  return url;
};

export const deleteFile = async({
  Bucket = process.env.AWS_BUCKET_NAME!,
  Key,
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new DeleteObjectCommand({
    Bucket,
    Key,
  });
  return await s3Client().send(command);
}

export const deleteFiles = async({
  Bucket = process.env.AWS_BUCKET_NAME!,
  urls,
  Quiet = false,
}: {
  Bucket?: string;
  urls: string[]
  Quiet?: boolean;
}) => {
  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects: urls.map((url) => ({ Key: url })),
      Quiet,
    },
  });
  return await s3Client().send(command);
}

export const listFiles = async({
  Bucket = process.env.AWS_BUCKET_NAME!,
  path
}: {
  Bucket?: string;
  path: string;
}) => {
  const command = new ListObjectsV2Command({
    Bucket,
    Prefix: `${process.env.APPLICATION_NAME}/${path}`,
  })
  return await s3Client().send(command);
}

  export const deleteFolderByPrefix = async ({ path }: { path: string }) => {
    const result = await listFiles({
      path,
    });

    if (!result?.Contents || result.Contents.length === 0) {
      throw new AppError(`No files found in path: ${path}`);
    }
    
    const keys = result?.Contents?.map(
      (item) => item.Key
    ) as string[];

    if(keys.length === 0){
      throw new AppError(`No valid keys found in path: ${path}`);
    }

    await deleteFiles({
      urls: keys,
      Quiet: true,
    });

    console.log(`Deleted ${keys.length} files from path: ${path}`);
  };