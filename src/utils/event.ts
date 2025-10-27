import { EventEmitter } from "events";
import { sendEmail } from "../service/sendEmail.service";
import { emailTemplate } from "../service/email.template";
import { UserRepository } from "../DB/repositories/user.repository";
import userModel from "../DB/models/user.model";
import { deleteFile, deleteFolderByPrefix, getFile } from "./s3.config";

export const eventEmitter = new EventEmitter();

eventEmitter.on("confirmEmail", async (data) => {
  const { email, otp } = data;

  await sendEmail({
    to: email,
    subject: "Confirm Email",
    html: emailTemplate(otp, "Email Confirmation"),
  });
});

eventEmitter.on("forgetPassword", async (data) => {
  const { email, otp } = data;

  await sendEmail({
    to: email,
    subject: "Forget Password",
    html: emailTemplate(otp, "Forget Password"),
  });
});

eventEmitter.on("uploadProfileImage", async (data) => {
  const { userId, oldKey, Key, expiresIn } = data;
  console.log({ data });
  const _userModel = new UserRepository(userModel);
  setTimeout(async () => {
    try {
      await getFile({ Key });

      await _userModel.findOneAndUpdate(
        { _id: userId },
        { $unset: { tempProfileImage: "" } }
      );

      // Delete old profile image from S3
      if (oldKey) {
        await deleteFile({ Key: oldKey });
      }
      console.log("successfully updated profile image");
    } catch (error: any) {
      console.log({ error });
      if (error?.Code == "NoSuchKey") {
        if (!oldKey) {
          await _userModel.findOneAndUpdate(
            { _id: userId },
            { $unset: { profileImage: "" } }
          );
        } else {
          await _userModel.findOneAndUpdate(
            { _id: userId },
            { $set: { profileImage: oldKey }, $unset: { tempProfileImage: "" } }
          );
        }
      }
    }
  }, expiresIn * 1000);
});

eventEmitter.on("deleteUserFolder", async (data) => {
  const { userId } = data;
  try {
    await deleteFolderByPrefix({ path: `users/${userId}/` });
    console.log(`Successfully deleted folder for user: ${userId}`);
  } catch (error) {
    console.error(`Error deleting folder for user ${userId}:`, error);
  }
});

eventEmitter.on("deleteUserFiles", async (data) => {
  const { userId, profileImage } = data;
  try {
    if (profileImage) {
      await deleteFile({ Key: profileImage });
    }
  } catch (error) {
    console.error(`Error deleting files for user ${userId}:`, error);
  }
});
