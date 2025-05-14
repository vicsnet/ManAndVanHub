import {
  users, 
  vanListings, 
  services, 
  bookings, 
  reviews, 
  type User, 
  type InsertUser, 
  type VanListing, 
  type InsertVanListing, 
  type Service, 
  type InsertService, 
  type Booking, 
  type InsertBooking, 
  type Review, 
  type InsertReview,
  type VanListingWithServices,
  type VanListingWithDetails
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Van listing methods
  getVanListing(id: number): Promise<VanListingWithDetails | undefined>;
  getVanListings(): Promise<VanListingWithServices[]>;
  getVanListingsByUser(userId: number): Promise<VanListingWithServices[]>;
  searchVanListings(location: string, date?: string, vanSize?: string): Promise<VanListingWithServices[]>;
  createVanListing(listing: InsertVanListing): Promise<VanListing>;
  updateVanListing(id: number, listing: Partial<InsertVanListing>): Promise<VanListing | undefined>;
  deleteVanListing(id: number): Promise<boolean>;
  
  // Service methods
  addService(service: InsertService): Promise<Service>;
  getServicesByVanListing(vanListingId: number): Promise<Service[]>;
  
  // Booking methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByVanListing(vanListingId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Review methods
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByVanListing(vanListingId: number): Promise<Review[]>;
  getAverageRatingForVanListing(vanListingId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vanListings: Map<number, VanListing>;
  private services: Map<number, Service>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  
  private currentUserId: number;
  private currentVanListingId: number;
  private currentServiceId: number;
  private currentBookingId: number;
  private currentReviewId: number;

  constructor() {
    this.users = new Map();
    this.vanListings = new Map();
    this.services = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    
    this.currentUserId = 1;
    this.currentVanListingId = 1;
    this.currentServiceId = 1;
    this.currentBookingId = 1;
    this.currentReviewId = 1;
    
    // Add some initial data
    this.initializeData();
  }

  private initializeData() {
    // Create sample users
    const jamesUser: InsertUser = {
      username: "james_moving",
      email: "james@example.com",
      password: "password123",
      fullName: "James Smith",
      isVanOwner: true,
      phone: "+44 7123 456789"
    };
    const daveUser: InsertUser = {
      username: "dave_transport",
      email: "dave@example.com",
      password: "password123",
      fullName: "Dave Johnson",
      isVanOwner: true,
      phone: "+44 7234 567890"
    };
    const sarahUser: InsertUser = {
      username: "sarah_movers",
      email: "sarah@example.com",
      password: "password123",
      fullName: "Sarah Wilson",
      isVanOwner: true,
      phone: "+44 7345 678901"
    };
    
    // Create the users
    const james = this.createUser(jamesUser);
    const dave = this.createUser(daveUser);
    const sarah = this.createUser(sarahUser);
    
    // Create sample van listings
    const jamesVan: InsertVanListing = {
      userId: james.id,
      title: "James's Moving Service",
      description: "Professional moving service with experienced handlers and a large van suitable for house moves.",
      vanSize: "large",
      hourlyRate: 25,
      location: "North London, N1",
      postcode: "N1 9AB",
      imageUrl: "https://images.unsplash.com/photo-1605152276897-4f618f831968",
      helpersCount: 2,
      isAvailableToday: true
    };
    
    const daveVan: InsertVanListing = {
      userId: dave.id,
      title: "Dave's Reliable Transport",
      description: "Reliable and affordable transport service for medium-sized moves around South London.",
      vanSize: "medium",
      hourlyRate: 22,
      location: "South London, SW4",
      postcode: "SW4 7BC",
      imageUrl: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55",
      helpersCount: 1,
      isAvailableToday: false
    };
    
    const sarahVan: InsertVanListing = {
      userId: sarah.id,
      title: "Sarah's Quick Movers",
      description: "Efficient office relocation service with professional handlers and a large van.",
      vanSize: "large",
      hourlyRate: 30,
      location: "East London, E14",
      postcode: "E14 5AB",
      imageUrl: "https://pixabay.com/get/gf227fd1e9d39b9f47f88c1a93eec0e054c7c883c483114141abe14a9b5a3fb8d587b07773c8ae508496b32d7835ca77ad652118e3468e8b48951655c4a61283e_1280.jpg",
      helpersCount: 3,
      isAvailableToday: true
    };
    
    // Create van listings
    const jamesListing = this.createVanListing(jamesVan);
    const daveListing = this.createVanListing(daveVan);
    const sarahListing = this.createVanListing(sarahVan);
    
    // Add services
    this.addService({ vanListingId: jamesListing.id, serviceName: "Furniture" });
    this.addService({ vanListingId: jamesListing.id, serviceName: "House Moves" });
    
    this.addService({ vanListingId: daveListing.id, serviceName: "House Moves" });
    this.addService({ vanListingId: daveListing.id, serviceName: "Single Item" });
    
    this.addService({ vanListingId: sarahListing.id, serviceName: "Office Moves" });
    this.addService({ vanListingId: sarahListing.id, serviceName: "Furniture" });
    
    // Add some reviews
    for (let i = 0; i < 5; i++) {
      this.createReview({
        vanListingId: jamesListing.id,
        userId: this.currentUserId++,
        rating: 5,
        comment: "Excellent service, very professional!"
      });
      
      this.createReview({
        vanListingId: daveListing.id,
        userId: this.currentUserId++,
        rating: 4,
        comment: "Good service, would use again."
      });
      
      this.createReview({
        vanListingId: sarahListing.id,
        userId: this.currentUserId++,
        rating: 5,
        comment: "Amazing service, highly recommend!"
      });
    }
    
    // Reset user ID counter after adding sample data
    this.currentUserId = 4;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Van listing methods
  async getVanListing(id: number): Promise<VanListingWithDetails | undefined> {
    const listing = this.vanListings.get(id);
    if (!listing) return undefined;

    const services = await this.getServicesByVanListing(id);
    const reviews = await this.getReviewsByVanListing(id);
    const averageRating = await this.getAverageRatingForVanListing(id);
    
    // Get user details for reviews
    const reviewsWithUserDetails = await Promise.all(
      reviews.map(async (review) => {
        const user = await this.getUser(review.userId);
        return {
          ...review,
          user: { fullName: user?.fullName || "Anonymous" }
        };
      })
    );
    
    const user = await this.getUser(listing.userId);
    
    return {
      ...listing,
      services,
      user: { fullName: user?.fullName || "Unknown" },
      reviews: reviewsWithUserDetails,
      averageRating,
      reviewCount: reviews.length
    };
  }

  async getVanListings(): Promise<VanListingWithServices[]> {
    const listings = Array.from(this.vanListings.values());
    
    return Promise.all(
      listings.map(async (listing) => {
        const services = await this.getServicesByVanListing(listing.id);
        const user = await this.getUser(listing.userId);
        const averageRating = await this.getAverageRatingForVanListing(listing.id);
        const reviews = await this.getReviewsByVanListing(listing.id);
        
        return {
          ...listing,
          services,
          user: { fullName: user?.fullName || "Unknown" },
          averageRating,
          reviewCount: reviews.length
        };
      })
    );
  }

  async getVanListingsByUser(userId: number): Promise<VanListingWithServices[]> {
    const listings = Array.from(this.vanListings.values())
      .filter(listing => listing.userId === userId);
    
    return Promise.all(
      listings.map(async (listing) => {
        const services = await this.getServicesByVanListing(listing.id);
        const user = await this.getUser(listing.userId);
        const averageRating = await this.getAverageRatingForVanListing(listing.id);
        const reviews = await this.getReviewsByVanListing(listing.id);
        
        return {
          ...listing,
          services,
          user: { fullName: user?.fullName || "Unknown" },
          averageRating,
          reviewCount: reviews.length
        };
      })
    );
  }

  async searchVanListings(location: string, date?: string, vanSize?: string): Promise<VanListingWithServices[]> {
    let listings = Array.from(this.vanListings.values());
    
    // Filter by location (postcode or text)
    if (location) {
      listings = listings.filter(listing => 
        listing.location.toLowerCase().includes(location.toLowerCase()) || 
        listing.postcode.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Filter by van size if provided
    if (vanSize && vanSize !== "any") {
      listings = listings.filter(listing => listing.vanSize === vanSize);
    }
    
    // Date filtering could be done here, but for MVP we'll just return the filtered listings
    
    return Promise.all(
      listings.map(async (listing) => {
        const services = await this.getServicesByVanListing(listing.id);
        const user = await this.getUser(listing.userId);
        const averageRating = await this.getAverageRatingForVanListing(listing.id);
        const reviews = await this.getReviewsByVanListing(listing.id);
        
        return {
          ...listing,
          services,
          user: { fullName: user?.fullName || "Unknown" },
          averageRating,
          reviewCount: reviews.length
        };
      })
    );
  }

  async createVanListing(listing: InsertVanListing): Promise<VanListing> {
    const id = this.currentVanListingId++;
    const createdAt = new Date();
    const vanListing: VanListing = { ...listing, id, createdAt };
    this.vanListings.set(id, vanListing);
    return vanListing;
  }

  async updateVanListing(id: number, listing: Partial<InsertVanListing>): Promise<VanListing | undefined> {
    const existingListing = this.vanListings.get(id);
    if (!existingListing) return undefined;
    
    const updatedListing = { ...existingListing, ...listing };
    this.vanListings.set(id, updatedListing);
    return updatedListing;
  }

  async deleteVanListing(id: number): Promise<boolean> {
    return this.vanListings.delete(id);
  }

  // Service methods
  async addService(service: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const newService: Service = { ...service, id };
    this.services.set(id, newService);
    return newService;
  }

  async getServicesByVanListing(vanListingId: number): Promise<Service[]> {
    return Array.from(this.services.values())
      .filter(service => service.vanListingId === vanListingId);
  }

  // Booking methods
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const createdAt = new Date();
    const newBooking: Booking = { ...booking, id, createdAt };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.userId === userId);
  }

  async getBookingsByVanListing(vanListingId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.vanListingId === vanListingId);
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Review methods
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const createdAt = new Date();
    const newReview: Review = { ...review, id, createdAt };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async getReviewsByVanListing(vanListingId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.vanListingId === vanListingId);
  }

  async getAverageRatingForVanListing(vanListingId: number): Promise<number> {
    const reviews = await this.getReviewsByVanListing(vanListingId);
    if (reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((totalRating / reviews.length).toFixed(1));
  }
}

export const storage = new MemStorage();
