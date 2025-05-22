// This interface must be compatible with both PostgreSQL and MongoDB storage implementations
export interface IStorage {
  // User methods
  getUser(id: string | number): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  createUser(user: any): Promise<any>;
  getAllUsers?(): Promise<any[]>; // Optional: for migration
  
  // Password reset methods
  storePasswordResetToken(userId: string | number, token: string, expires: Date): Promise<boolean>;
  verifyPasswordResetToken(token: string): Promise<boolean>;
  getUserByResetToken(token: string): Promise<any>;
  updateUserPassword(userId: string | number, newPassword: string): Promise<boolean>;
  clearPasswordResetToken(userId: string | number): Promise<boolean>;
  
  // Van listing methods
  getVanListing(id: string | number): Promise<any>;
  getVanListings(): Promise<any[]>;
  getVanListingsByUser(userId: string | number): Promise<any[]>;
  searchVanListings(location: string, date?: string, vanSize?: string): Promise<any[]>;
  createVanListing(listing: any): Promise<any>;
  updateVanListing(id: string | number, listing: Partial<any>): Promise<any>;
  deleteVanListing(id: string | number): Promise<boolean>;
  
  // Service methods
  addService(service: any): Promise<any>;
  getServicesByVanListing(vanListingId: string | number): Promise<any[]>;
  
  // Booking methods
  createBooking(booking: any): Promise<any>;
  getBooking(id: string | number): Promise<any>;
  getBookingsByUser(userId: string | number): Promise<any[]>;
  getBookingsByVanListing(vanListingId: string | number): Promise<any[]>;
  updateBookingStatus(id: string | number, status: string): Promise<any>;
  getAllBookings?(): Promise<any[]>; // Optional: for migration
  
  // Review methods
  createReview(review: any): Promise<any>;
  getReviewsByVanListing(vanListingId: string | number): Promise<any[]>;
  getAverageRatingForVanListing(vanListingId: string | number): Promise<number>;
  getAllReviews?(): Promise<any[]>; // Optional: for migration
  
  // Message methods
  createMessage(message: any): Promise<any>;
  getMessagesByBooking(bookingId: string | number): Promise<any[]>;
  getUnreadMessageCountForUser(userId: string | number): Promise<number>;
  markMessagesAsRead(bookingId: string | number, userId: string | number): Promise<void>;
  
  // Van tracking methods
  updateVanPosition(bookingId: string | number, position: {lat: number, lng: number}): Promise<any>;
  getVanPosition(bookingId: string | number): Promise<{lat: number, lng: number} | null>;
  getVanTrackingHistory(bookingId: string | number): Promise<any[]>;
  
  // Initialize test data
  initializeTestData(): Promise<void>;
}