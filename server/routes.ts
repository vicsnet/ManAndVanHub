import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertVanListingSchema, insertBookingSchema, insertReviewSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
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
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
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
      const data = loginSchema.parse(req.body);
      
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
      const data = insertUserSchema.parse(req.body);
      
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
      const id = parseInt(req.params.id);
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
      const data = insertVanListingSchema.parse({
        ...req.body,
        userId: user.id
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
      const id = parseInt(req.params.id);
      
      // Check if the listing exists
      const listing = await storage.getVanListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Van listing not found" });
      }
      
      // Check if the user owns the listing
      if (listing.userId !== user.id) {
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
      const id = parseInt(req.params.id);
      
      // Check if the listing exists
      const listing = await storage.getVanListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Van listing not found" });
      }
      
      // Check if the user owns the listing
      if (listing.userId !== user.id) {
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
      const listings = await storage.getVanListingsByUser(user.id);
      res.json(listings);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a booking
  app.post("/api/bookings", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      
      // Validate the input data
      const data = insertBookingSchema.parse({
        ...req.body,
        userId: user.id
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
      const bookings = await storage.getBookingsByUser(user.id);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  });
  
  // Update booking status
  app.patch("/api/bookings/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as any;
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Check if the booking exists
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if the user owns the booking or the van listing
      const listing = await storage.getVanListing(booking.vanListingId);
      if (booking.userId !== user.id && listing?.userId !== user.id) {
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
      const data = insertReviewSchema.parse({
        ...req.body,
        userId: user.id
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
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
