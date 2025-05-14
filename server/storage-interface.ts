// This interface must be compatible with both PostgreSQL and MongoDB storage implementations
export interface IStorage {
  // User methods
  getUser(id: any): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  createUser(user: any): Promise<any>;
  
  // Van listing methods
  getVanListing(id: any): Promise<any>;
  getVanListings(): Promise<any[]>;
  getVanListingsByUser(userId: any): Promise<any[]>;
  searchVanListings(location: string, date?: string, vanSize?: string): Promise<any[]>;
  createVanListing(listing: any): Promise<any>;
  updateVanListing(id: any, listing: Partial<any>): Promise<any>;
  deleteVanListing(id: any): Promise<boolean>;
  
  // Service methods
  addService(service: any): Promise<any>;
  getServicesByVanListing(vanListingId: any): Promise<any[]>;
  
  // Booking methods
  createBooking(booking: any): Promise<any>;
  getBooking(id: any): Promise<any>;
  getBookingsByUser(userId: any): Promise<any[]>;
  getBookingsByVanListing(vanListingId: any): Promise<any[]>;
  updateBookingStatus(id: any, status: string): Promise<any>;
  
  // Review methods
  createReview(review: any): Promise<any>;
  getReviewsByVanListing(vanListingId: any): Promise<any[]>;
  getAverageRatingForVanListing(vanListingId: any): Promise<number>;
  
  // Initialize test data
  initializeTestData(): Promise<void>;
}