import mongoose from 'mongoose';
import * as crypto from 'crypto';
import { 
  UserModel, VanListingModel, ServiceModel, BookingModel, ReviewModel, MessageModel, VanTrackingModel,
  User, VanListing, Service, Booking, Review, Message, VanTracking,
  InsertUser, InsertVanListing, InsertService, InsertBooking, InsertReview, InsertMessage, InsertVanTracking,
  VanListingWithServices, VanListingWithDetails, MessageWithSender
} from '../shared/mongodb-schema';
import { IStorage } from './storage-interface';

// Simple password hashing function
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export class MongoDBStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id);
      return user || undefined;
    } catch (error) {
      console.error('Error in getUser:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ email });
      return user || undefined;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Hash the password before storing
      const userWithHashedPassword = {
        ...user,
        password: hashPassword(user.password)
      };
      
      const newUser = new UserModel(userWithHashedPassword);
      await newUser.save();
      return newUser;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }
  
  // Password reset methods
  async storePasswordResetToken(userId: string | number, token: string, expires: Date): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndUpdate(
        userId,
        {
          resetPasswordToken: token,
          resetPasswordExpires: expires
        }
      );
      return !!result;
    } catch (error) {
      console.error('Error in storePasswordResetToken:', error);
      return false;
    }
  }

  async verifyPasswordResetToken(token: string): Promise<boolean> {
    try {
      const user = await UserModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });
      return !!user;
    } catch (error) {
      console.error('Error in verifyPasswordResetToken:', error);
      return false;
    }
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });
      return user || undefined;
    } catch (error) {
      console.error('Error in getUserByResetToken:', error);
      return undefined;
    }
  }

  async updateUserPassword(userId: string | number, newPassword: string): Promise<boolean> {
    try {
      // Hash the new password before storing
      const hashedPassword = hashPassword(newPassword);
      
      const result = await UserModel.findByIdAndUpdate(
        userId,
        { password: hashedPassword }
      );
      return !!result;
    } catch (error) {
      console.error('Error in updateUserPassword:', error);
      return false;
    }
  }

  async clearPasswordResetToken(userId: string | number): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndUpdate(
        userId,
        {
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      );
      return !!result;
    } catch (error) {
      console.error('Error in clearPasswordResetToken:', error);
      return false;
    }
  }

  // Van listing methods
  async getVanListing(id: number): Promise<VanListingWithDetails | undefined> {
    try {
      const listing = await VanListingModel.findById(id);
      if (!listing) return undefined;

      const services = await ServiceModel.find({ vanListingId: listing._id });
      const user = await UserModel.findById(listing.userId);
      const reviews = await this.getReviewsByVanListing(id);
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const user = await UserModel.findById(review.userId);
          return {
            ...review.toObject(),
            user: { fullName: user?.fullName || "Unknown" }
          };
        })
      );
      const averageRating = await this.getAverageRatingForVanListing(id);

      return {
        ...listing.toObject(),
        services,
        user: { fullName: user?.fullName || "Unknown" },
        reviews: reviewsWithUsers,
        averageRating,
        reviewCount: reviews.length
      };
    } catch (error) {
      console.error('Error in getVanListing:', error);
      return undefined;
    }
  }

  async getVanListings(): Promise<VanListingWithServices[]> {
    try {
      const listings = await VanListingModel.find();
      
      return Promise.all(
        listings.map(async (listing) => {
          const services = await ServiceModel.find({ vanListingId: listing._id });
          const user = await UserModel.findById(listing.userId);
          const reviews = await ReviewModel.find({ vanListingId: listing._id });
          const averageRating = await this.getAverageRatingForVanListing(listing._id);
          
          return {
            ...listing.toObject(),
            services,
            user: { fullName: user?.fullName || "Unknown" },
            averageRating,
            reviewCount: reviews.length
          };
        })
      );
    } catch (error) {
      console.error('Error in getVanListings:', error);
      return [];
    }
  }

  async getVanListingsByUser(userId: number): Promise<VanListingWithServices[]> {
    try {
      const listings = await VanListingModel.find({ userId });
      
      return Promise.all(
        listings.map(async (listing) => {
          const services = await ServiceModel.find({ vanListingId: listing._id });
          const user = await UserModel.findById(listing.userId);
          const reviews = await ReviewModel.find({ vanListingId: listing._id });
          const averageRating = await this.getAverageRatingForVanListing(listing._id);
          
          return {
            ...listing.toObject(),
            services,
            user: { fullName: user?.fullName || "Unknown" },
            averageRating,
            reviewCount: reviews.length
          };
        })
      );
    } catch (error) {
      console.error('Error in getVanListingsByUser:', error);
      return [];
    }
  }

  async searchVanListings(location: string, date?: string, vanSize?: string): Promise<VanListingWithServices[]> {
    try {
      // Build query conditions
      const query: any = {};
      
      if (location) {
        query.$or = [
          { location: { $regex: location, $options: 'i' } },
          { postcode: { $regex: location, $options: 'i' } }
        ];
      }
      
      if (vanSize && vanSize !== 'any') {
        query.vanSize = vanSize;
      }
      
      const listings = await VanListingModel.find(query);
      
      return Promise.all(
        listings.map(async (listing) => {
          const services = await ServiceModel.find({ vanListingId: listing._id });
          const user = await UserModel.findById(listing.userId);
          const reviews = await ReviewModel.find({ vanListingId: listing._id });
          const averageRating = await this.getAverageRatingForVanListing(listing._id);
          
          return {
            ...listing.toObject(),
            services,
            user: { fullName: user?.fullName || "Unknown" },
            averageRating,
            reviewCount: reviews.length
          };
        })
      );
    } catch (error) {
      console.error('Error in searchVanListings:', error);
      return [];
    }
  }

  async createVanListing(listing: InsertVanListing): Promise<VanListing> {
    try {
      const newListing = new VanListingModel(listing);
      await newListing.save();
      return newListing;
    } catch (error) {
      console.error('Error in createVanListing:', error);
      throw error;
    }
  }

  async updateVanListing(id: number, listing: Partial<InsertVanListing>): Promise<VanListing | undefined> {
    try {
      const updatedListing = await VanListingModel.findByIdAndUpdate(
        id,
        { $set: listing },
        { new: true }
      );
      return updatedListing || undefined;
    } catch (error) {
      console.error('Error in updateVanListing:', error);
      return undefined;
    }
  }

  async deleteVanListing(id: number): Promise<boolean> {
    try {
      const result = await VanListingModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error in deleteVanListing:', error);
      return false;
    }
  }

  // Service methods
  async addService(service: InsertService): Promise<Service> {
    try {
      const newService = new ServiceModel(service);
      await newService.save();
      return newService;
    } catch (error) {
      console.error('Error in addService:', error);
      throw error;
    }
  }

  async getServicesByVanListing(vanListingId: number): Promise<Service[]> {
    try {
      return await ServiceModel.find({ vanListingId });
    } catch (error) {
      console.error('Error in getServicesByVanListing:', error);
      return [];
    }
  }

  // Booking methods
  async createBooking(booking: InsertBooking): Promise<Booking> {
    try {
      const newBooking = new BookingModel(booking);
      await newBooking.save();
      return newBooking;
    } catch (error) {
      console.error('Error in createBooking:', error);
      throw error;
    }
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    try {
      const booking = await BookingModel.findById(id);
      return booking || undefined;
    } catch (error) {
      console.error('Error in getBooking:', error);
      return undefined;
    }
  }

  async getBookingsByUser(userId: number): Promise<any[]> {
    try {
      // Get all bookings for the user
      const bookings = await BookingModel.find({ userId });
      
      // Enhance each booking with van listing details
      const enhancedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const vanListing = await VanListingModel.findById(booking.vanListingId);
          if (!vanListing) {
            // Fall back to basic booking data if van listing not found
            return booking.toObject();
          }
          
          const owner = await UserModel.findById(vanListing.userId);
          
          return {
            ...booking.toObject(),
            vanListing: {
              id: vanListing._id,
              title: vanListing.title,
              vanSize: vanListing.vanSize,
              hourlyRate: vanListing.hourlyRate,
              user: {
                fullName: owner?.fullName || "Unknown Owner"
              }
            }
          };
        })
      );
      
      return enhancedBookings;
    } catch (error) {
      console.error('Error in getBookingsByUser:', error);
      return [];
    }
  }

  async getBookingsByVanListing(vanListingId: number): Promise<Booking[]> {
    try {
      return await BookingModel.find({ vanListingId });
    } catch (error) {
      console.error('Error in getBookingsByVanListing:', error);
      return [];
    }
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    try {
      const updatedBooking = await BookingModel.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true }
      );
      return updatedBooking || undefined;
    } catch (error) {
      console.error('Error in updateBookingStatus:', error);
      return undefined;
    }
  }

  // Review methods
  async createReview(review: InsertReview): Promise<Review> {
    try {
      const newReview = new ReviewModel(review);
      await newReview.save();
      return newReview;
    } catch (error) {
      console.error('Error in createReview:', error);
      throw error;
    }
  }

  async getReviewsByVanListing(vanListingId: number): Promise<Review[]> {
    try {
      return await ReviewModel.find({ vanListingId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error in getReviewsByVanListing:', error);
      return [];
    }
  }

  async getAverageRatingForVanListing(vanListingId: number): Promise<number> {
    try {
      const result = await ReviewModel.aggregate([
        { $match: { vanListingId: new mongoose.Types.ObjectId(vanListingId.toString()) } },
        { $group: { _id: null, averageRating: { $avg: "$rating" } } }
      ]);
      
      if (result.length > 0) {
        return parseFloat(result[0].averageRating.toFixed(1));
      }
      return 0;
    } catch (error) {
      console.error('Error in getAverageRatingForVanListing:', error);
      return 0;
    }
  }

  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      const newMessage = new MessageModel(message);
      await newMessage.save();
      return newMessage;
    } catch (error) {
      console.error('Error in createMessage:', error);
      throw error;
    }
  }

  async getMessagesByBooking(bookingId: number): Promise<MessageWithSender[]> {
    try {
      const messages = await MessageModel.find({ bookingId: bookingId.toString() })
        .sort({ createdAt: 1 });
      
      const messagesWithSenders: MessageWithSender[] = [];
      
      for (const message of messages) {
        const user = await UserModel.findById(message.senderId);
        if (user) {
          messagesWithSenders.push({
            ...message.toObject(),
            sender: {
              id: user._id.toString(),
              fullName: user.fullName,
              isVanOwner: user.isVanOwner
            }
          });
        }
      }
      
      return messagesWithSenders;
    } catch (error) {
      console.error('Error in getMessagesByBooking:', error);
      return [];
    }
  }

  async getUnreadMessageCountForUser(userId: number): Promise<number> {
    try {
      // First, find all bookings for this user
      const userBookings = await BookingModel.find({ userId: userId.toString() });
      const listingBookings = await BookingModel.find({ 
        vanListingId: { $in: await VanListingModel.find({ userId: userId.toString() }).distinct('_id') } 
      });
      
      const bookingIds = [
        ...userBookings.map(b => b._id.toString()),
        ...listingBookings.map(b => b._id.toString())
      ];
      
      // Then, count unread messages where recipient is this user
      const unreadCount = await MessageModel.countDocuments({
        bookingId: { $in: bookingIds },
        senderId: { $ne: userId.toString() },
        isRead: false
      });
      
      return unreadCount;
    } catch (error) {
      console.error('Error in getUnreadMessageCountForUser:', error);
      return 0;
    }
  }

  async markMessagesAsRead(bookingId: number, userId: number): Promise<void> {
    try {
      await MessageModel.updateMany(
        { 
          bookingId: bookingId.toString(),
          senderId: { $ne: userId.toString() },
          isRead: false
        },
        { isRead: true }
      );
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
    }
  }
  
  // Van tracking methods
  async updateVanPosition(bookingId: string | number, position: {lat: number, lng: number}): Promise<any> {
    try {
      const bookingObjectId = new mongoose.Types.ObjectId(bookingId.toString());
      
      // Create a new tracking record
      const trackingData = {
        bookingId: bookingObjectId,
        vanPosition: position,
        timestamp: new Date()
      };
      
      const trackingRecord = await VanTrackingModel.create(trackingData);
      return trackingRecord;
    } catch (error) {
      console.error('Error updating van position:', error);
      throw error;
    }
  }

  async getVanPosition(bookingId: string | number): Promise<{lat: number, lng: number} | null> {
    try {
      const bookingObjectId = new mongoose.Types.ObjectId(bookingId.toString());
      
      // Get the most recent position for this booking
      const latestPosition = await VanTrackingModel.findOne(
        { bookingId: bookingObjectId },
        null,
        { sort: { timestamp: -1 } }
      );
      
      return latestPosition ? latestPosition.vanPosition : null;
    } catch (error) {
      console.error('Error getting van position:', error);
      throw error;
    }
  }

  async getVanTrackingHistory(bookingId: string | number): Promise<any[]> {
    try {
      const bookingObjectId = new mongoose.Types.ObjectId(bookingId.toString());
      
      // Get all tracking records for this booking, ordered by timestamp
      const trackingHistory = await VanTrackingModel.find(
        { bookingId: bookingObjectId },
        null,
        { sort: { timestamp: 1 } }
      );
      
      return trackingHistory;
    } catch (error) {
      console.error('Error getting van tracking history:', error);
      throw error;
    }
  }

  // Initialize test data for development
  async initializeTestData() {
    // Check if data already exists
    const usersCount = await UserModel.countDocuments();
    if (usersCount > 0) {
      console.log('Test data already exists, skipping initialization');
      return;
    }

    console.log('Initializing test data...');

    // Create sample users
    const jamesUser = new UserModel({
      username: 'james123',
      email: 'james@example.com',
      password: 'password123',
      fullName: 'James Smith',
      isVanOwner: true
    });
    await jamesUser.save();

    const daveUser = new UserModel({
      username: 'dave456',
      email: 'dave@example.com',
      password: 'password123',
      fullName: 'Dave Johnson',
      isVanOwner: true
    });
    await daveUser.save();

    const sarahUser = new UserModel({
      username: 'sarah789',
      email: 'sarah@example.com',
      password: 'password123',
      fullName: 'Sarah Williams',
      isVanOwner: true
    });
    await sarahUser.save();

    // Create van listings
    const jamesVan = new VanListingModel({
      userId: jamesUser._id,
      title: "James's Moving Service",
      description: "Reliable and efficient moving service with a large van. Can help with loading and unloading.",
      vanSize: "large",
      hourlyRate: 35,
      location: "London",
      postcode: "E1 6AN",
      imageUrl: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=2865&auto=format&fit=crop"
    });
    await jamesVan.save();

    // Add services for James
    await ServiceModel.create([
      { vanListingId: jamesVan._id, serviceName: "Furniture Moving" },
      { vanListingId: jamesVan._id, serviceName: "House Clearance" },
      { vanListingId: jamesVan._id, serviceName: "Office Relocation" }
    ]);

    const daveVan = new VanListingModel({
      userId: daveUser._id,
      title: "Dave's Delivery Solutions",
      description: "Quick and reliable deliveries across the city. Medium-sized van perfect for apartment moves.",
      vanSize: "medium",
      hourlyRate: 28,
      location: "Manchester",
      postcode: "M1 1AE",
      imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=2874&auto=format&fit=crop"
    });
    await daveVan.save();

    // Add services for Dave
    await ServiceModel.create([
      { vanListingId: daveVan._id, serviceName: "Parcel Delivery" },
      { vanListingId: daveVan._id, serviceName: "Ikea Pickup" },
      { vanListingId: daveVan._id, serviceName: "Student Moves" }
    ]);

    const sarahVan = new VanListingModel({
      userId: sarahUser._id,
      title: "Sarah's Student Movers",
      description: "Specializing in student moves and small relocations. Friendly service with competitive rates.",
      vanSize: "small",
      hourlyRate: 22,
      location: "Birmingham",
      postcode: "B1 1AA",
      imageUrl: "https://images.unsplash.com/photo-1546238232-20216dec9f72?q=80&w=2942&auto=format&fit=crop"
    });
    await sarahVan.save();

    // Add services for Sarah
    await ServiceModel.create([
      { vanListingId: sarahVan._id, serviceName: "Student Moves" },
      { vanListingId: sarahVan._id, serviceName: "Small Deliveries" }
    ]);

    // Create some reviews
    for (const listing of [jamesVan, daveVan, sarahVan]) {
      const numberOfReviews = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < numberOfReviews; i++) {
        const reviewUser = new UserModel({
          username: `reviewer${i}_${Math.random().toString(36).substring(7)}`,
          email: `reviewer${i}_${Math.random().toString(36).substring(7)}@example.com`,
          password: 'password123',
          fullName: `Reviewer ${i}`,
          isVanOwner: false
        });
        await reviewUser.save();
        
        await ReviewModel.create({
          userId: reviewUser._id,
          vanListingId: listing._id,
          rating: Math.floor(Math.random() * 3) + 3, // 3-5 star ratings
          comment: ["Great service!", "Very helpful and punctual.", "Would definitely use again.", "Highly recommended!", "Excellent value for money."][Math.floor(Math.random() * 5)],
        });
      }
    }

    console.log('Test data initialized successfully');
  }
}

export const mongoStorage = new MongoDBStorage();