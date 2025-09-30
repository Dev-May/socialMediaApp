import mongoose, { Types } from "mongoose";

export enum GenderType {
  male = "male",
  female = "female",
}

export enum RoleType {
  user = "user",
  admin = "admin",
}

export interface IUser {
  fName: string;
  lName: string;
  fullName?: string;
  email: string;
  password: string;
  age: number;
  phone?: string;
  address?: string;
  gender: GenderType;
  role: RoleType;
  confirmed?: boolean;
  otp?: string;
  changeCredentials?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    fName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 5,
    },
    lName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 10,
    },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    age: { type: Number, min: 18, max: 60, required: true },
    phone: { type: String },
    address: { type: String },
    confirmed: { type: Boolean },
    otp: { type: String },
    changeCredentials: { type: Date },
    gender: {
      type: String,
      enum: GenderType,
      required: true,
    },
    role: { type: String, enum: RoleType, default: RoleType.user },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

userSchema
  .virtual("fullName")
  .set(function (value) {
    const [fName, lName] = value.split(" ");
    this.set({ fName, lName });
  })
  .get(function () {
    return this.fName + " " + this.lName;
  });

const userModel =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default userModel;
