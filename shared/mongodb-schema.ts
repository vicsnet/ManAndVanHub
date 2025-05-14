import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// Define interfaces for MongoDB documents
export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  isVanOwner: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VanListingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  vanSize: string;
  hourlyRate: number;
  location: string;
  postcode: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceDocument extends Document {
  vanListingId: mongoose.Types.ObjectId;
  serviceName: string;
}

export interface BookingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  vanListingId: mongoose.Types.ObjectId;
  bookingDate: Date;
  duration: number;
  fromLocation: string;
  toLocation: string;
  status: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewDocument extends Document {
  userId: mongoose.Types.ObjectId;
  vanListingId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Mongoose Schemas
const userSchema = new Schema<UserDocument>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  isVanOwner: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const vanListingSchema = new Schema<VanListingDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  vanSize: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  location: { type: String, required: true },
  postcode: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const serviceSchema = new Schema<ServiceDocument>({
  vanListingId: { type: Schema.Types.ObjectId, ref: 'VanListing', required: true },
  serviceName: { type: String, required: true },
});

const bookingSchema = new Schema<BookingDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vanListingId: { type: Schema.Types.ObjectId, ref: 'VanListing', required: true },
  bookingDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  status: { type: String, default: 'pending' },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const reviewSchema = new Schema<ReviewDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vanListingId: { type: Schema.Types.ObjectId, ref: 'VanListing', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create Mongoose models
export const UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);
export const VanListingModel = mongoose.models.VanListing || mongoose.model<VanListingDocument>('VanListing', vanListingSchema);
export const ServiceModel = mongoose.models.Service || mongoose.model<ServiceDocument>('Service', serviceSchema);
export const BookingModel = mongoose.models.Booking || mongoose.model<BookingDocument>('Booking', bookingSchema);
export const ReviewModel = mongoose.models.Review || mongoose.model<ReviewDocument>('Review', reviewSchema);

// Define Zod schemas for validation
export const userValidationSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  isVanOwner: z.boolean().default(false),
});

export const vanListingValidationSchema = z.object({
  userId: z.string(),
  title: z.string().min(5),
  description: z.string().min(10),
  vanSize: z.string(),
  hourlyRate: z.number().positive(),
  location: z.string().min(2),
  postcode: z.string().min(5),
  imageUrl: z.string().optional(),
});

export const serviceValidationSchema = z.object({
  vanListingId: z.string(),
  serviceName: z.string().min(2),
});

export const bookingValidationSchema = z.object({
  userId: z.string(),
  vanListingId: z.string(),
  bookingDate: z.union([
    z.date(),
    z.string().transform((str) => new Date(str))
  ]),
  duration: z.number().positive(),
  fromLocation: z.string().min(5),
  toLocation: z.string().min(5),
  status: z.string().default('pending'),
  totalPrice: z.number().positive(),
});

export const reviewValidationSchema = z.object({
  userId: z.string(),
  vanListingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5),
});

export const loginValidationSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Type definitions for insert operations
export type InsertUser = z.infer<typeof userValidationSchema>;
export type InsertVanListing = z.infer<typeof vanListingValidationSchema>;
export type InsertService = z.infer<typeof serviceValidationSchema>;
export type InsertBooking = z.infer<typeof bookingValidationSchema>;
export type InsertReview = z.infer<typeof reviewValidationSchema>;
export type Login = z.infer<typeof loginValidationSchema>;

// Type definitions for querying
export type User = UserDocument;
export type VanListing = VanListingDocument;
export type Service = ServiceDocument;
export type Booking = BookingDocument;
export type Review = ReviewDocument;

// Additional composite types
export type VanListingWithServices = VanListing & {
  services: Service[];
  user: { fullName: string };
  averageRating?: number;
  reviewCount?: number;
};

export type VanListingWithDetails = VanListingWithServices & {
  reviews: (Review & { user: { fullName: string } })[];
};