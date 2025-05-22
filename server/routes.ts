import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { getStorage, getSchemas } from "./storage-factory";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Get the appropriate storage implementation based on available database
  const storage = getStorage();

  // Set up session management
  app.use(
    session({
      cookie: {
        maxAge: 86400000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
      store: new SessionStore({
        checkPeriod: 86400000, // 24 hours
      }),
      secret: process.env.SESSION_SECRET || 'van-and-man-secret-key',
      resave: false,
      saveUninitialized: false,
    })
  );
  
  // Initialize and configure passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport local strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Incorrect email or password" });
          }

          // Hash the password for comparison
          const crypto = require('crypto');
          const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
          
          if (user.password !== hashedPassword) {
            return done(null, false, { message: "Incorrect email or password" });
          }

          // Remove password before serializing
          const { password: _password, ...safeUser } = user;
          return done(null, safeUser);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  
  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    // Handle both MongoDB (_id) and PostgreSQL (id) formats
    done(null, user._id || user.id);
  });
  
  passport.deserializeUser(async (id: any, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      // Remove password before deserializing
      const { password: _password, ...safeUser } = user;
      done(null, safeUser);
    } catch (err) {
      done(err);
    }
  });
  
  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  
  // Get current user
  app.get("/api/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // Login route
  app.post("/api/login", (req, res, next) => {
    try {
      // Get the appropriate schema based on which database is in use
      const schemas = getSchemas();
      const data = schemas.loginSchema.parse(req.body);
      
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info?.message || "Authentication failed" });
        }
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.json(user);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      next(error);
    }
  });
  
  // Register route
  app.post("/api/register", async (req, res, next) => {
    try {
      // Get the appropriate schema based on which database is in use
      const schemas = getSchemas();
      const data = schemas.insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Create the user
      const user = await storage.createUser(data);
      
      // Remove password before returning
      const { password: _password, ...safeUser } = user;
      
      // Log the user in
      req.login(safeUser, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(201).json(safeUser);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      next(error);
    }
  });
  
  // Logout route
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // Forgot password endpoint
  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find user with this email
      const user = await storage.getUserByEmail(email);
      
      if (user) {
        // Generate a token (using a simple random string - in production, use a proper library)
        const token = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
        
        // Create a token expiration time (24 hours from now)
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 24);
        
        // Store the token in the user's document
        await storage.storePasswordResetToken(user._id || user.id, token, expiration);
        
        // In a real application, you would send an email with this link
        console.log(`Password reset link: ${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${token}`);
      }
      
      // Always return 200 even if user doesn't exist (prevent email enumeration)
      return res.status(200).json({ 
        message: "If an account with that email exists, a password reset link has been sent."
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Verify reset token endpoint
  app.get("/api/verify-reset-token", async (req, res, next) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      
      // Verify the token in database
      const isValid = await storage.verifyPasswordResetToken(token as string);
      
      if (!isValid) {
        return res.status(400).json({ 
          message: "Invalid or expired token", 
          valid: false 
        });
      }
      
      return res.status(200).json({ valid: true });
    } catch (error) {
      next(error);
    }
  });
  
  // Reset password endpoint
  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      
      // Verify the token one more time
      const isValid = await storage.verifyPasswordResetToken(token);
      
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
      // Get the user associated with this token
      const user = await storage.getUserByResetToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      
      // Update the password
      await storage.updateUserPassword(user._id || user.id, password);
      
      // Clear the used token
      await storage.clearPasswordResetToken(user._id || user.id);
      
      return res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      next(error);
    }
  });
  
  // Get all van listings
  app.get("/api/van-listings", async (req, res, next) => {
    try {
      const listings = await storage.getVanListings();
      res.json(listings);
    } catch (error) {
      next(error);
    }
  });
  
  // Search van listings
  app.get("/api/van-listings/search", async (req, res, next) => {
    try {
      const { location, date, vanSize } = req.query;
      
      if (!location) {
        return res.status(400).json({ message: "Location is required" });
      }
      
      const listings = await storage.searchVanListings(
        location as string,
        date as string | undefined,
        vanSize as string | undefined
      );
      
      res.json(listings);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a specific van listing
  app.get("/api/van-listings/:id", async (req, res, next) => {
    try {
      const id = req.params.id; // No need to parse, can use string ID with MongoDB
      const listing = await storage.getVanListing(id);
      
      if (!listing) {
        return res.status(404).json({ message: "Van listing not found" });
      }
      
      res.json(listing);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a van listing
  app.post("/api/van-listings", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      
      // Validate the input data
      const schemas = getSchemas();
      const data = schemas.insertVanListingSchema.parse({
        ...req.body,
        userId: user._id || user.id // Support both MongoDB and PostgreSQL
      });
      
      const listing = await storage.createVanListing(data);
      
      // Add services if provided
      if (req.body.services && Array.isArray(req.body.services)) {
        for (const serviceName of req.body.services) {
          await storage.addService({
            vanListingId: listing.id,
            serviceName
          });
        }
      }
      
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      next(error);
    }
  });
  
  // Update a van listing
  app.patch("/api/van-listings/:id", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      const id = req.params.id; // No need to parse for MongoDB
      const userId = user._id || user.id; // Support both MongoDB and PostgreSQL
      
      // Check if the listing exists
      const listing = await storage.getVanListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Van listing not found" });
      }
      
      // Check if the user owns the listing
      // For MongoDB, we need to compare the string representation or IDs
      const listingUserId = listing.userId.toString ? listing.userId.toString() : listing.userId;
      const userIdStr = userId.toString ? userId.toString() : userId;
      if (listingUserId !== userIdStr) {
        return res.status(403).json({ message: "You don't have permission to update this listing" });
      }
      
      // Update the listing
      const updatedListing = await storage.updateVanListing(id, req.body);
      res.json(updatedListing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      next(error);
    }
  });
  
  // Delete a van listing
  app.delete("/api/van-listings/:id", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      const id = req.params.id; // No need to parse for MongoDB
      const userId = user._id || user.id; // Support both MongoDB and PostgreSQL
      
      // Check if the listing exists
      const listing = await storage.getVanListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Van listing not found" });
      }
      
      // Check if the user owns the listing
      // For MongoDB, we need to compare the string representation or IDs
      const listingUserId = listing.userId.toString ? listing.userId.toString() : listing.userId;
      const userIdStr = userId.toString ? userId.toString() : userId;
      if (listingUserId !== userIdStr) {
        return res.status(403).json({ message: "You don't have permission to delete this listing" });
      }
      
      // Delete the listing
      await storage.deleteVanListing(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Get listings by current user
  app.get("/api/my-listings", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      const userId = user._id || user.id; // Support both MongoDB and PostgreSQL
      const listings = await storage.getVanListingsByUser(userId);
      res.json(listings);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a booking
  app.post("/api/bookings", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      const userId = user._id || user.id; // Support both MongoDB and PostgreSQL
      
      // Validate the input data
      const schemas = getSchemas();
      const data = schemas.insertBookingSchema.parse({
        ...req.body,
        userId: userId
      });
      
      // Check if the van listing exists
      const listing = await storage.getVanListing(data.vanListingId);
      if (!listing) {
        return res.status(404).json({ message: "Van listing not found" });
      }
      
      const booking = await storage.createBooking(data);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      next(error);
    }
  });
  
  // Get user's bookings
  app.get("/api/my-bookings", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      const userId = user._id || user.id; // Support both MongoDB and PostgreSQL
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  });
  
  // Get bookings for vans owned by the user
  app.get("/api/my-van-bookings", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      const userId = user._id || user.id; // Support both MongoDB and PostgreSQL
      
      // Get the user's van listings
      const vanListings = await storage.getVanListingsByUser(userId);
      
      if (!vanListings || vanListings.length === 0) {
        return res.json([]);
      }
      
      // Get all bookings for all van listings owned by this user
      const allBookings = await Promise.all(
        vanListings.map(async (listing) => {
          const listingId = listing.id;
          const bookings = await storage.getBookingsByVanListing(listingId);
          
          // Get customer details for each booking
          const enhancedBookings = await Promise.all(
            bookings.map(async (booking) => {
              // Get customer info
              const customer = await storage.getUser(booking.userId);
              
              return {
                ...booking,
                vanListing: {
                  id: listing.id,
                  title: listing.title,
                  vanSize: listing.vanSize,
                  hourlyRate: listing.hourlyRate
                },
                user: customer ? {
                  fullName: customer.fullName,
                  email: customer.email
                } : undefined
              };
            })
          );
          
          return enhancedBookings;
        })
      );
      
      // Flatten the array of arrays into a single array
      const flattenedBookings = allBookings.flat();
      
      res.json(flattenedBookings);
    } catch (error) {
      next(error);
    }
  });
  
  // Update booking status
  app.patch("/api/bookings/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      const id = req.params.id; // No need to parse for MongoDB
      const userId = user._id || user.id; // Support both MongoDB and PostgreSQL
      const { status } = req.body;
      
      if (!status || !["pending", "confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Check if the booking exists
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Get string representations of IDs for comparison
      const bookingUserId = booking.userId.toString ? booking.userId.toString() : booking.userId;
      const userIdStr = userId.toString ? userId.toString() : userId;
      
      // Check if the user owns the booking or the van listing
      const listing = await storage.getVanListing(booking.vanListingId);
      const listingUserId = listing?.userId.toString ? listing.userId.toString() : listing?.userId;
      
      if (bookingUserId !== userIdStr && listingUserId !== userIdStr) {
        return res.status(403).json({ message: "You don't have permission to update this booking" });
      }
      
      const updatedBooking = await storage.updateBookingStatus(id, status);
      res.json(updatedBooking);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a review
  app.post("/api/reviews", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      
      // Validate the input data
      const schemas = getSchemas();
      const data = schemas.insertReviewSchema.parse({
        ...req.body,
        userId: user._id || user.id // Support both MongoDB and PostgreSQL
      });
      
      // Check if the van listing exists
      const listing = await storage.getVanListing(data.vanListingId);
      if (!listing) {
        return res.status(404).json({ message: "Van listing not found" });
      }
      
      const review = await storage.createReview(data);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      next(error);
    }
  });
  
  // Admin route for migration
  app.post("/api/admin/migrate", async (req, res, next) => {
    try {
      // Check if we have a migration secret and it matches
      const { migrationSecret } = req.body;
      const expectedSecret = process.env.MIGRATION_SECRET || 'default-migration-secret';
      
      if (migrationSecret !== expectedSecret) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Try to run the migration
      try {
        const { migrateFromPostgresToMongo } = await import('./db-migration');
        const success = await migrateFromPostgresToMongo();
        if (success) {
          res.json({ message: "Migration completed successfully!" });
        } else {
          res.status(500).json({ message: "Migration did not complete successfully." });
        }
      } catch (error) {
        console.error('Error during migration:', error);
        res.status(500).json({ message: `Migration error: ${error.message}` });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Chat-related routes
  
  // Get messages for a specific booking
  app.get("/api/bookings/:id/messages", isAuthenticated, async (req, res, next) => {
    try {
      const bookingId = parseInt(req.params.id);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      // Get the booking to verify if the user is allowed to see messages
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const user = req.user as any;
      const userId = user._id || user.id; // Support both MongoDB and PostgreSQL
      
      // Allow access if user is either the booking customer or the van owner
      const vanListing = await storage.getVanListing(booking.vanListingId);
      if (!vanListing) {
        return res.status(404).json({ message: "Van listing not found" });
      }
      
      const isBookingCustomer = booking.userId == userId;
      const isVanOwner = vanListing.userId == userId;
      
      if (!isBookingCustomer && !isVanOwner) {
        return res.status(403).json({ message: "Not authorized to view these messages" });
      }
      
      // Get messages
      const messages = await storage.getMessagesByBooking(bookingId);
      
      // Mark messages as read for the current user
      await storage.markMessagesAsRead(bookingId, userId);
      
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });
  
  // Send a message
  app.post("/api/bookings/:id/messages", isAuthenticated, async (req, res, next) => {
    try {
      const bookingId = parseInt(req.params.id);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      // Check if the booking exists
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const user = req.user as any;
      const userId = user._id || user.id; // Support both MongoDB and PostgreSQL
      
      // Allow sending messages if user is either the booking customer or the van owner
      const vanListing = await storage.getVanListing(booking.vanListingId);
      if (!vanListing) {
        return res.status(404).json({ message: "Van listing not found" });
      }
      
      const isBookingCustomer = booking.userId == userId;
      const isVanOwner = vanListing.userId == userId;
      
      if (!isBookingCustomer && !isVanOwner) {
        return res.status(403).json({ message: "Not authorized to send messages for this booking" });
      }
      
      // Validate message content
      const { content } = req.body;
      if (!content || typeof content !== "string" || content.trim() === "") {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // Create message
      const message = await storage.createMessage({
        bookingId,
        senderId: userId,
        content: content.trim()
      });
      
      // Return the message with sender info
      const messageWithSender = {
        ...message,
        sender: {
          id: userId,
          fullName: user.fullName,
          isVanOwner: user.isVanOwner
        }
      };
      
      res.status(201).json(messageWithSender);
    } catch (error) {
      next(error);
    }
  });
  
  // Get unread message count for current user
  app.get("/api/messages/unread-count", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      const userId = user._id || user.id; // Support both MongoDB and PostgreSQL
      
      const count = await storage.getUnreadMessageCountForUser(userId);
      res.json({ count });
    } catch (error) {
      next(error);
    }
  });
  
  // Van tracking routes
  app.post("/api/van-tracking/update", isAuthenticated, async (req, res, next) => {
    try {
      const { bookingId, position } = req.body;
      
      if (!bookingId || !position || typeof position.lat !== 'number' || typeof position.lng !== 'number') {
        return res.status(400).json({ message: 'Invalid tracking data. Required: bookingId, position.lat, position.lng' });
      }
      
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Only allow the van owner to update the position
      const user = req.user as any;
      const userId = user._id || user.id;
      const vanListing = await storage.getVanListing(booking.vanListingId);
      const vanOwnerId = vanListing.userId.toString();
      
      if (vanOwnerId !== userId.toString()) {
        return res.status(403).json({ message: 'Only the van owner can update the position' });
      }
      
      const trackingUpdate = await storage.updateVanPosition(bookingId, position);
      res.status(201).json(trackingUpdate);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/van-tracking/:bookingId/current", isAuthenticated, async (req, res, next) => {
    try {
      const bookingId = req.params.bookingId;
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Only allow participants of the booking to view tracking data
      const user = req.user as any;
      const userId = user._id || user.id;
      const vanListing = await storage.getVanListing(booking.vanListingId);
      
      if (booking.userId.toString() !== userId.toString() && 
          vanListing.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this tracking data' });
      }
      
      const position = await storage.getVanPosition(bookingId);
      
      if (!position) {
        return res.status(404).json({ message: 'No tracking data found for this booking' });
      }
      
      res.json(position);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/van-tracking/:bookingId/history", isAuthenticated, async (req, res, next) => {
    try {
      const bookingId = req.params.bookingId;
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Only allow participants of the booking to view tracking history
      const user = req.user as any;
      const userId = user._id || user.id;
      const vanListing = await storage.getVanListing(booking.vanListingId);
      
      if (booking.userId.toString() !== userId.toString() && 
          vanListing.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to view tracking history' });
      }
      
      const history = await storage.getVanTrackingHistory(bookingId);
      res.json(history);
    } catch (error) {
      next(error);
    }
  });
  
  // Admin routes
  // Middleware to check if user is admin
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && (req.user as any).isAdmin) {
      return next();
    }
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  };

  // Get all users (admin only)
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const users = await UserModel.find({}, {
        password: 0, // exclude password field
        resetPasswordToken: 0,
        resetPasswordExpires: 0
      }).sort({ createdAt: -1 });
      
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:userId", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const { userId } = req.params;
      
      // Don't allow admins to delete themselves
      if (userId === (req.user as any).id.toString()) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      
      // First, check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Then remove all their data:
      // 1. Delete their van listings and associated services
      const vanListings = await VanListingModel.find({ userId });
      
      for (const listing of vanListings) {
        // Delete services for this listing
        await ServiceModel.deleteMany({ vanListingId: listing._id });
        
        // Delete reviews for this listing
        await ReviewModel.deleteMany({ vanListingId: listing._id });
        
        // Get bookings associated with this listing
        const bookings = await BookingModel.find({ vanListingId: listing._id });
        
        // Delete messages for each booking
        for (const booking of bookings) {
          await MessageModel.deleteMany({ bookingId: booking._id });
        }
        
        // Delete bookings for this listing
        await BookingModel.deleteMany({ vanListingId: listing._id });
      }
      
      // Delete all van listings owned by the user
      await VanListingModel.deleteMany({ userId });
      
      // 2. Delete all bookings made by the user
      const userBookings = await BookingModel.find({ userId });
      
      // Delete messages for each booking
      for (const booking of userBookings) {
        await MessageModel.deleteMany({ bookingId: booking._id });
      }
      
      await BookingModel.deleteMany({ userId });
      
      // 3. Delete all reviews made by the user
      await ReviewModel.deleteMany({ userId });
      
      // 4. Delete all messages sent by the user
      await MessageModel.deleteMany({ senderId: userId });
      
      // 5. Delete user's van tracking data
      if (VanTrackingModel) {
        await VanTrackingModel.deleteMany({ userId });
      }
      
      // Finally, delete the user
      await UserModel.findByIdAndDelete(userId);
      
      res.json({ message: "User and all associated data deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Update user's van owner status (admin only)
  app.patch("/api/admin/users/:userId/van-owner-status", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { isVanOwner } = req.body;
      
      if (typeof isVanOwner !== 'boolean') {
        return res.status(400).json({ message: "isVanOwner must be a boolean value" });
      }
      
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { isVanOwner },
        { new: true, runValidators: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        isVanOwner: updatedUser.isVanOwner,
        isAdmin: updatedUser.isAdmin
      });
    } catch (error) {
      next(error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
