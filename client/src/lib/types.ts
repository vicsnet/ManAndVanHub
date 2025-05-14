// Re-export types from schema.ts
export type {
  User,
  InsertUser,
  VanListing,
  InsertVanListing,
  Service,
  InsertService,
  Booking,
  InsertBooking,
  Review,
  InsertReview,
  Login,
  VanListingWithServices,
  VanListingWithDetails
} from "@shared/schema";

// Additional types for frontend

export interface SearchParams {
  location: string;
  date?: string;
  vanSize?: string;
}

export interface BookingFormData {
  vanListingId: number;
  bookingDate: Date;
  duration: number;
  fromLocation: string;
  toLocation: string;
  totalPrice: number;
}

export interface ReviewFormData {
  vanListingId: number;
  rating: number;
  comment: string;
}
