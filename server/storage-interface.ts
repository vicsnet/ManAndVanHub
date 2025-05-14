// This interface must be compatible with both PostgreSQL and MongoDB storage implementations
export interface IStorage {
  // User methods
  getUser(id: string | number): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  createUser(user: any): Promise<any>;
  
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
  
  // Review methods
  createReview(review: any): Promise<any>;
  getReviewsByVanListing(vanListingId: string | number): Promise<any[]>;
  getAverageRatingForVanListing(vanListingId: string | number): Promise<number>;
  
  // Initialize test data
  initializeTestData(): Promise<void>;
}