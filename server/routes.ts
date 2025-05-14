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

          // In a real application, we would hash the password and compare
          if (user.password !== password) {
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
      
      // In a real implementation, you would:
      // 1. Check if user exists
      const user = await storage.getUserByEmail(email);
      
      // 2. Generate a token - In a real app, use a secure random token
      // 3. Store the token with expiration in the database
      // 4. Send an email with a link to reset password
      
      // For now, we'll simulate success
      // We still return 200 even if the email doesn't exist to prevent email enumeration
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
      
      // In a real implementation, you would:
      // 1. Check if the token exists in the database
      // 2. Check if the token is expired
      
      // For now, we'll simulate a valid token for demo purposes
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
      
      // In a real implementation, you would:
      // 1. Verify the token again
      // 2. Find the user associated with the token
      // 3. Update the user's password
      // 4. Remove the used token
      
      // For demo purposes, we'll simulate success
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
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
