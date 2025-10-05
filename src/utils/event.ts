import { EventEmitter } from "events";
import { sendEmail } from "../service/sendEmail.service";
import { emailTemplate } from "../service/email.template";

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
