import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  isVanOwner: boolean("is_van_owner").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Van Listings table
export const vanListings = pgTable("van_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  vanSize: text("van_size").notNull(), // small, medium, large, xl
  hourlyRate: doublePrecision("hourly_rate").notNull(),
  location: text("location").notNull(),
  postcode: text("postcode").notNull(),
  imageUrl: text("image_url"),
  helpersCount: integer("helpers_count").default(1),
  isAvailableToday: boolean("is_available_today").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Services offered by van owners
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  vanListingId: integer("van_listing_id").notNull().references(() => vanListings.id),
  serviceName: text("service_name").notNull(), // furniture, house moves, office relocation, single item
});

// Bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  vanListingId: integer("van_listing_id").notNull().references(() => vanListings.id),
  userId: integer("user_id").notNull().references(() => users.id),
  bookingDate: timestamp("booking_date").notNull(),
  duration: integer("duration").notNull(), // in hours
  status: text("status").notNull().default("pending"), // pending, confirmed, completed, cancelled
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  vanListingId: integer("van_listing_id").notNull().references(() => vanListings.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define Zod schemas for insertions
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVanListingSchema = createInsertSchema(vanListings).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Auth schema for login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type VanListing = typeof vanListings.$inferSelect;
export type InsertVanListing = z.infer<typeof insertVanListingSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Login = z.infer<typeof loginSchema>;

// Extended types for frontend
export type VanListingWithServices = VanListing & {
  services: Service[];
  user: { fullName: string };
  averageRating?: number;
  reviewCount?: number;
};

export type VanListingWithDetails = VanListingWithServices & {
  reviews: (Review & { user: { fullName: string } })[];
};
