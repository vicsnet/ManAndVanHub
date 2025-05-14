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
import { db } from "./db";
import { eq, like, desc, sql, and, or } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Van listing methods
  async getVanListing(id: number): Promise<VanListingWithDetails | undefined> {
    const listingResult = await db.select().from(vanListings).where(eq(vanListings.id, id));
    const listing = listingResult[0];
    if (!listing) return undefined;

    const servicesList = await this.getServicesByVanListing(id);
    const reviewsList = await this.getReviewsByVanListing(id);
    const averageRating = await this.getAverageRatingForVanListing(id);
    
    // Get user details for each review
    const reviewsWithUserDetails = await Promise.all(
      reviewsList.map(async (review) => {
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
      services: servicesList,
      user: { fullName: user?.fullName || "Unknown" },
      reviews: reviewsWithUserDetails,
      averageRating,
      reviewCount: reviewsList.length
    };
  }

  async getVanListings(): Promise<VanListingWithServices[]> {
    const listings = await db.select().from(vanListings);
    
    return Promise.all(
      listings.map(async (listing) => {
        const servicesList = await this.getServicesByVanListing(listing.id);
        const user = await this.getUser(listing.userId);
        const averageRating = await this.getAverageRatingForVanListing(listing.id);
        const reviewsList = await this.getReviewsByVanListing(listing.id);
        
        return {
          ...listing,
          services: servicesList,
          user: { fullName: user?.fullName || "Unknown" },
          averageRating,
          reviewCount: reviewsList.length
        };
      })
    );
  }

  async getVanListingsByUser(userId: number): Promise<VanListingWithServices[]> {
    const listings = await db.select().from(vanListings).where(eq(vanListings.userId, userId));
    
    return Promise.all(
      listings.map(async (listing) => {
        const servicesList = await this.getServicesByVanListing(listing.id);
        const user = await this.getUser(listing.userId);
        const averageRating = await this.getAverageRatingForVanListing(listing.id);
        const reviewsList = await this.getReviewsByVanListing(listing.id);
        
        return {
          ...listing,
          services: servicesList,
          user: { fullName: user?.fullName || "Unknown" },
          averageRating,
          reviewCount: reviewsList.length
        };
      })
    );
  }

  async searchVanListings(location: string, date?: string, vanSize?: string): Promise<VanListingWithServices[]> {
    let query = db.select().from(vanListings);
    
    // Filter conditions
    const conditions = [];
    
    // Filter by location if provided
    if (location) {
      conditions.push(
        or(
          like(vanListings.location, `%${location}%`),
          like(vanListings.postcode, `%${location}%`)
        )
      );
    }
    
    // Filter by van size if provided
    if (vanSize && vanSize !== "any") {
      conditions.push(eq(vanListings.vanSize, vanSize));
    }
    
    // Apply filters if any conditions exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const listings = await query;
    
    return Promise.all(
      listings.map(async (listing) => {
        const servicesList = await this.getServicesByVanListing(listing.id);
        const user = await this.getUser(listing.userId);
        const averageRating = await this.getAverageRatingForVanListing(listing.id);
        const reviewsList = await this.getReviewsByVanListing(listing.id);
        
        return {
          ...listing,
          services: servicesList,
          user: { fullName: user?.fullName || "Unknown" },
          averageRating,
          reviewCount: reviewsList.length
        };
      })
    );
  }

  async createVanListing(listing: InsertVanListing): Promise<VanListing> {
    const result = await db.insert(vanListings).values(listing).returning();
    return result[0];
  }

  async updateVanListing(id: number, listing: Partial<InsertVanListing>): Promise<VanListing | undefined> {
    const result = await db.update(vanListings)
      .set(listing)
      .where(eq(vanListings.id, id))
      .returning();
    
    return result[0];
  }

  async deleteVanListing(id: number): Promise<boolean> {
    const result = await db.delete(vanListings)
      .where(eq(vanListings.id, id))
      .returning({ id: vanListings.id });
    
    return result.length > 0;
  }

  // Service methods
  async addService(service: InsertService): Promise<Service> {
    const result = await db.insert(services).values(service).returning();
    return result[0];
  }

  async getServicesByVanListing(vanListingId: number): Promise<Service[]> {
    return db.select().from(services).where(eq(services.vanListingId, vanListingId));
  }

  // Booking methods
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const result = await db.insert(bookings).values(booking).returning();
    return result[0];
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id));
    return result[0];
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getBookingsByVanListing(vanListingId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.vanListingId, vanListingId));
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    
    return result[0];
  }

  // Review methods
  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  async getReviewsByVanListing(vanListingId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.vanListingId, vanListingId))
      .orderBy(desc(reviews.createdAt));
  }

  async getAverageRatingForVanListing(vanListingId: number): Promise<number> {
    const result = await db.select({
      averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`
    })
    .from(reviews)
    .where(eq(reviews.vanListingId, vanListingId));
    
    return parseFloat(result[0].averageRating.toFixed(1));
  }

  // Initialize data for testing
  async initializeTestData() {
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
    const james = await this.createUser(jamesUser);
    const dave = await this.createUser(daveUser);
    const sarah = await this.createUser(sarahUser);
    
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
    const jamesListing = await this.createVanListing(jamesVan);
    const daveListing = await this.createVanListing(daveVan);
    const sarahListing = await this.createVanListing(sarahVan);
    
    // Add services
    await this.addService({ vanListingId: jamesListing.id, serviceName: "Furniture" });
    await this.addService({ vanListingId: jamesListing.id, serviceName: "House Moves" });
    
    await this.addService({ vanListingId: daveListing.id, serviceName: "House Moves" });
    await this.addService({ vanListingId: daveListing.id, serviceName: "Single Item" });
    
    await this.addService({ vanListingId: sarahListing.id, serviceName: "Office Moves" });
    await this.addService({ vanListingId: sarahListing.id, serviceName: "Furniture" });
    
    // Add some reviews
    const userStartId = 4; // Start IDs for review users
    let userId = userStartId;
    
    // Create a review user
    const createReviewUser = async (id: number): Promise<User> => {
      const reviewUser: InsertUser = {
        username: `user${id}`,
        email: `user${id}@example.com`,
        password: "password123",
        fullName: `User ${id}`,
        isVanOwner: false,
      };
      return this.createUser(reviewUser);
    };
    
    // Add reviews for each listing
    for (let i = 0; i < 5; i++) {
      const reviewUser1 = await createReviewUser(userId++);
      await this.createReview({
        vanListingId: jamesListing.id,
        userId: reviewUser1.id,
        rating: 5,
        comment: "Excellent service, very professional!"
      });
      
      const reviewUser2 = await createReviewUser(userId++);
      await this.createReview({
        vanListingId: daveListing.id,
        userId: reviewUser2.id,
        rating: 4,
        comment: "Good service, would use again."
      });
      
      const reviewUser3 = await createReviewUser(userId++);
      await this.createReview({
        vanListingId: sarahListing.id,
        userId: reviewUser3.id,
        rating: 5,
        comment: "Amazing service, highly recommend!"
      });
    }
  }
}

export const storage = new DatabaseStorage();
