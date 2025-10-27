import mongoose, { Types } from "mongoose";

export enum GenderType {
  male = "male",
  female = "female",
}

export enum RoleType {
  user = "user",
  admin = "admin",
}

export enum ProviderType {
  system = "system",
  google = "google",
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
  profileImage?: string;
  tempProfileImage?: string;
  coverImage?: string
  gender: GenderType;
  role: RoleType;
  confirmed?: boolean;
  otp?: string;
  provider: ProviderType;
  changeCredentials?: Date;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  restoredAt: Date;
  restoredBy?: Types.ObjectId;
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
    },
    lName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
    },
    email: { type: String, required: true, trim: true, unique: true },
    password: {
      type: String,
      trim: true,
      required: function () {
        return this.provider === ProviderType.google ? false : true;
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 60,
      required: function () {
        return this.provider === ProviderType.google ? false : true;
      },
    },
    phone: { type: String },
    address: { type: String },
    profileImage: { type: String },
    tempProfileImage: { type: String },
    coverImage: { type: String },
    confirmed: { type: Boolean },
    otp: { type: String },
    deletedAt: { type: Date },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    restoredAt: { type: Date },
    restoredBy: { type: Types.ObjectId, ref: "User" },
    provider: {
      type: String,
      enum: ProviderType,
      default: ProviderType.system,
    },
    changeCredentials: { type: Date },
    gender: {
      type: String,
      enum: GenderType,
      required: function () {
        return this.provider === ProviderType.google ? false : true;
      },
    },
    role: { type: String, enum: RoleType, default: RoleType.user },
  },
  {
    timestamps: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
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
