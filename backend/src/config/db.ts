import { Schema, model, Document, connect as mongooseConnect } from "mongoose";
import {
  IUser,
  User,
  UserRole,
  IAdvertisement,
  Advertisement,
  AdStatus,
  MediaType,
  IDisplay,
  Display,
  DisplayStatus,
  IDisplayLoop,
  DisplayLoop,
  RotationType,
  DisplayLayout,
  IDisplayConnectionRequest,
  DisplayConnectionRequest,
  ConnectionRequestStatus,
  ISystemLog,
  SystemLog,
  LogAction,
  EntityType,
  IAnalytics,
  Analytics,
  EngagementMetrics,
  Resolution,
  DisplayConfiguration,
  LoopAdvertisementEntry,
} from "@admiro/domain";
import { getEnv } from "./env.js";

interface IUserDocument extends IUser, Document {}
interface IAdvertisementDocument extends IAdvertisement, Document {}
interface IDisplayDocument extends IDisplay, Document {}
interface IDisplayLoopDocument extends IDisplayLoop, Document {}
interface IDisplayConnectionRequestDocument
  extends IDisplayConnectionRequest, Document {}
interface ISystemLogDocument extends ISystemLog, Document {}
interface IAnalyticsDocument extends IAnalytics, Document {}

const jsonTransform = {
  transform(doc: Document, ret: Record<string, any>) {
    delete (ret as any).__v;
    return ret;
  },
};

const resolutionSchema = new Schema(
  {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false },
);

const displayConfigurationSchema = new Schema(
  {
    brightness: { type: Number, required: true, default: 100 },
    volume: { type: Number, required: true, default: 50 },
    refreshRate: { type: Number, required: true, default: 60 },
    orientation: { type: String, required: true },
  },
  { _id: false },
);

const loopAdvertisementEntrySchema = new Schema(
  {
    advertisementId: { type: String, required: true },
    order: { type: Number, required: true },
    duration: { type: Number, required: true },
    weight: { type: Number, required: true, default: 1 },
  },
  { _id: false },
);

const engagementMetricsSchema = new Schema(
  {
    clicks: { type: Number, required: true, default: 0 },
    interactions: { type: Number, required: true, default: 0 },
    dwellTime: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const userSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: String,
    firstName: String,
    lastName: String,
    role: {
      type: String,
      required: true,
      enum: Object.values(UserRole),
    },
    googleId: String,
    isActive: { type: Boolean, required: true, default: true },
    profilePicture: String,
    lastLogin: Date,
    // Account lockout fields for security
    failedLoginAttempts: { type: Number, required: true, default: 0 },
    isLocked: { type: Boolean, required: true, default: false },
    lockedUntil: Date,
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    timestamps: false,
    id: false,
    toJSON: jsonTransform,
  },
);

const advertisementSchema = new Schema<IAdvertisementDocument>(
  {
    id: { type: String, required: true },
    adId: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          return /^AD-[0-9a-fA-F-]{36}$/.test(value);
        },
        message: 'Invalid adId format. Expected "AD-{UUID}"',
      },
    },
    advertiserId: { type: String, required: true },
    adName: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    mediaType: {
      type: String,
      required: true,
      enum: Object.values(MediaType),
    },
    mediaObjectKey: String,
    thumbnailUrl: String,
    duration: { type: Number, required: true },
    description: String,
    status: {
      type: String,
      required: true,
      enum: Object.values(AdStatus),
    },
    targetAudience: String,
    fileSize: Number,
    views: { type: Number, required: true, default: 0 },
    clicks: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    timestamps: false,
    id: false,
    toJSON: jsonTransform,
  },
);

const displaySchema = new Schema<IDisplayDocument>(
  {
    id: { type: String, required: true },
    displayId: { type: String, required: true },
    displayName: { type: String, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(DisplayStatus),
    },
    assignedAdminId: String,
    resolution: { type: resolutionSchema, required: true },
    lastSeen: Date,
    firmwareVersion: { type: String, required: true },
    configuration: { type: displayConfigurationSchema, required: true },
    connectionToken: { type: String, required: true },
    password: String,
    isConnected: { type: Boolean, required: true, default: false },
    currentLoopId: String,
    needsRefresh: { type: Boolean, required: true, default: false },
    lastRefreshCheck: Date,
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    timestamps: false,
    id: false,
    toJSON: jsonTransform,
  },
);

const displayLoopSchema = new Schema<IDisplayLoopDocument>(
  {
    id: { type: String, required: true },
    loopId: { type: String, required: true },
    loopName: { type: String, required: true },
    displayId: { type: String, default: "" },
    displayIds: { type: [String], required: true, default: [] },
    advertisements: { type: [loopAdvertisementEntrySchema], required: true },
    rotationType: {
      type: String,
      required: true,
      enum: Object.values(RotationType),
    },
    displayLayout: {
      type: String,
      required: true,
      enum: Object.values(DisplayLayout),
    },
    totalDuration: { type: Number, required: true },
    isActive: { type: Boolean, required: true, default: true },
    description: String,
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    timestamps: false,
    id: false,
    toJSON: jsonTransform,
  },
);

const displayConnectionRequestSchema =
  new Schema<IDisplayConnectionRequestDocument>(
    {
      id: { type: String, required: true },
      requestId: { type: String, required: true },
      displayId: { type: String, required: true },
      displayName: { type: String, required: true },
      displayLocation: { type: String, required: true },
      firmwareVersion: { type: String, required: true },
      status: {
        type: String,
        required: true,
        enum: Object.values(ConnectionRequestStatus),
      },
      requestedAt: { type: Date, required: true },
      respondedAt: Date,
      respondedById: String,
      rejectionReason: String,
      notes: String,
      createdAt: { type: Date, required: true, default: () => new Date() },
      updatedAt: { type: Date, required: true, default: () => new Date() },
    },
    {
      timestamps: false,
      id: false,
      toJSON: jsonTransform,
    },
  );

const systemLogSchema = new Schema<ISystemLogDocument>(
  {
    id: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: Object.values(LogAction),
    },
    entityType: {
      type: String,
      required: true,
      enum: Object.values(EntityType),
    },
    entityId: { type: String, required: true },
    userId: { type: String, required: true },
    details: {
      description: { type: String, required: true },
      changes: { type: Schema.Types.Mixed },
      metadata: { type: Schema.Types.Mixed },
    },
    ipAddress: String,
    userAgent: String,
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    timestamps: false,
    id: false,
    toJSON: jsonTransform,
  },
);

const analyticsSchema = new Schema<IAnalyticsDocument>(
  {
    id: { type: String, required: true },
    displayId: { type: String, required: true },
    adId: { type: String, required: true },
    loopId: { type: String, required: true },
    impressions: { type: Number, required: true, default: 0 },
    engagementMetrics: { type: engagementMetricsSchema, required: true },
    viewDuration: { type: Number, required: true, default: 0 },
    completedViews: { type: Number, required: true, default: 0 },
    partialViews: { type: Number, required: true, default: 0 },
    timestamp: { type: Date, required: true },
    date: { type: Date, required: true },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    timestamps: false,
    id: false,
    toJSON: jsonTransform,
  },
);

userSchema.loadClass(User);
advertisementSchema.loadClass(Advertisement);
displaySchema.loadClass(Display);
displayLoopSchema.loadClass(DisplayLoop);
displayConnectionRequestSchema.loadClass(DisplayConnectionRequest);
systemLogSchema.loadClass(SystemLog);
analyticsSchema.loadClass(Analytics);

export const UserModel = model<IUserDocument>("User", userSchema);
export const AdvertisementModel = model<IAdvertisementDocument>(
  "Advertisement",
  advertisementSchema,
);
export const DisplayModel = model<IDisplayDocument>("Display", displaySchema);
export const DisplayLoopModel = model<IDisplayLoopDocument>(
  "DisplayLoop",
  displayLoopSchema,
);
export const DisplayConnectionRequestModel =
  model<IDisplayConnectionRequestDocument>(
    "DisplayConnectionRequest",
    displayConnectionRequestSchema,
  );
export const SystemLogModel = model<ISystemLogDocument>(
  "SystemLog",
  systemLogSchema,
);
export const AnalyticsModel = model<IAnalyticsDocument>(
  "Analytics",
  analyticsSchema,
);

let connectionPromise: Promise<typeof import("mongoose")> | null = null;

export async function connectDb() {
  const env = getEnv();

  if (!connectionPromise) {
    connectionPromise = mongooseConnect(env.MONGODB_URI);
  }

  await connectionPromise;
}
