import jwt from "jsonwebtoken";

export const GenerateToken = async ({
  payload,
  signature,
  options,
}: {
  payload: object;
  signature: string;
  options: jwt.SignOptions;
}): Promise<string> => {
  return jwt.sign(payload, signature, options);
};
