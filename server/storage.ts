import {
  users, 
  vanListings, 
  services, 
  bookings, 
  reviews,
  messages,
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
  type Message,
  type InsertMessage,
  type MessageWithSender,
  type VanListingWithServices,
  type VanListingWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, like, desc, sql, and, or, asc } from "drizzle-orm";

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
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByBooking(bookingId: number): Promise<MessageWithSender[]>;
  getUnreadMessageCountForUser(userId: number): Promise<number>;
  markMessagesAsRead(bookingId: number, userId: number): Promise<void>;
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
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.id));
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
    // Retrieve all listings
    const listings = await db.select().from(vanListings);
    
    // Add services, user details, and ratings to each listing
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
    // Get all listings
    const allListings = await db.select().from(vanListings);
    
    // Filter by user ID
    const userListings = allListings.filter(listing => listing.userId === userId);
    
    // Add services, user details, and ratings to each listing
    return Promise.all(
      userListings.map(async (listing) => {
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
    // Get all listings and filter them in-memory to avoid Drizzle type issues
    const allListings = await db.select().from(vanListings);
    
    // Filter listings by location and van size
    const filteredListings = allListings.filter(listing => {
      // Location filter (if provided)
      const locationMatches = !location || 
        listing.location.toLowerCase().includes(location.toLowerCase()) ||
        listing.postcode.toLowerCase().includes(location.toLowerCase());
        
      // Van size filter (if provided)
      const sizeMatches = !vanSize || vanSize === "any" || listing.vanSize === vanSize;
      
      return locationMatches && sizeMatches;
    });
    
    // Enrich listings with services, user, and ratings
    return Promise.all(
      filteredListings.map(async (listing) => {
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

  async getBookingsByUser(userId: number): Promise<any[]> {
    // First get all bookings for the user
    const userBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId));
    
    // Then enhance each booking with van listing data
    const enhancedBookings = await Promise.all(
      userBookings.map(async (booking) => {
        // Get the related van listing
        const [vanListingData] = await db
          .select()
          .from(vanListings)
          .where(eq(vanListings.id, booking.vanListingId));
        
        if (!vanListingData) {
          return booking; // Return basic booking if no van listing found
        }
        
        // Get the van owner's data
        const [ownerData] = await db
          .select({
            fullName: users.fullName
          })
          .from(users)
          .where(eq(users.id, vanListingData.userId));
          
        return {
          ...booking,
          vanListing: {
            id: vanListingData.id,
            title: vanListingData.title,
            vanSize: vanListingData.vanSize,
            hourlyRate: vanListingData.hourlyRate,
            user: {
              fullName: ownerData?.fullName || "Unknown"
            }
          }
        };
      })
    );
    
    return enhancedBookings;
  }

  async getBookingsByVanListing(vanListingId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.vanListingId, vanListingId));
  }
  
  async getAllBookings(): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(asc(bookings.id));
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
  
  async getAllReviews(): Promise<Review[]> {
    return db.select().from(reviews).orderBy(asc(reviews.id));
  }

  async getAverageRatingForVanListing(vanListingId: number): Promise<number> {
    const result = await db.select({
      averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`
    })
    .from(reviews)
    .where(eq(reviews.vanListingId, vanListingId));
    
    // Handle cases where averageRating might be a string or a number
    const rating = result[0].averageRating;
    if (typeof rating === 'number') {
      return parseFloat(rating.toFixed(1));
    } else if (typeof rating === 'string') {
      return parseFloat(parseFloat(rating).toFixed(1));
    } else {
      return 0;
    }
  }

  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    const [result] = await db
      .insert(messages)
      .values(message)
      .returning();
    
    return result;
  }

  async getMessagesByBooking(bookingId: number): Promise<MessageWithSender[]> {
    const messagesData = await db
      .select()
      .from(messages)
      .where(eq(messages.bookingId, bookingId))
      .orderBy(asc(messages.createdAt));
    
    // Fetch sender details for each message
    const messagesWithSenders = await Promise.all(
      messagesData.map(async (message) => {
        const sender = await this.getUser(message.senderId);
        
        return {
          ...message,
          sender: sender ? {
            id: sender.id,
            fullName: sender.fullName,
            isVanOwner: sender.isVanOwner
          } : {
            id: 0,
            fullName: "Unknown User",
            isVanOwner: false
          }
        };
      })
    );
    
    return messagesWithSenders;
  }

  async getUnreadMessageCountForUser(userId: number): Promise<number> {
    // Get all bookings where the user is either the customer or van owner
    const userBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId));
    
    // Also get bookings where the user is the van owner
    const userVanListings = await this.getVanListingsByUser(userId);
    const vanListingIds = userVanListings.map(listing => listing.id);
    
    const vanOwnerBookings = vanListingIds.length > 0 
      ? await db
          .select()
          .from(bookings)
          .where(sql`${bookings.vanListingId} IN (${vanListingIds.join(',')})`)
      : [];
    
    // Combine all booking IDs
    const allBookingIds = [
      ...userBookings.map(b => b.id),
      ...vanOwnerBookings.map(b => b.id)
    ];
    
    if (allBookingIds.length === 0) {
      return 0;
    }
    
    // Count unread messages where the user is NOT the sender
    const unreadCount = await db
      .select({
        count: sql`COUNT(*)`
      })
      .from(messages)
      .where(
        and(
          sql`${messages.bookingId} IN (${allBookingIds.join(',')})`,
          eq(messages.isRead, false),
          sql`${messages.senderId} != ${userId}`
        )
      );
    
    return Number(unreadCount[0].count) || 0;
  }

  async markMessagesAsRead(bookingId: number, userId: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.bookingId, bookingId),
          sql`${messages.senderId} != ${userId}`
        )
      );
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
