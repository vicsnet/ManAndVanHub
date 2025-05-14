import { storage as pgStorage } from './storage';
import { mongoStorage } from './mongodb-storage';
import mongoose from 'mongoose';
import { log } from './vite';

/**
 * Utility to migrate data from PostgreSQL to MongoDB
 */
export async function migrateFromPostgresToMongo() {
  // Check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    log('MongoDB is not connected. Cannot perform migration.', 'migration');
    return false;
  }

  try {
    log('Starting data migration from PostgreSQL to MongoDB...', 'migration');
    
    // 1. Migrate users
    const users = await pgStorage.getAllUsers();
    log(`Migrating ${users.length} users...`, 'migration');
    for (const user of users) {
      try {
        // Check if user already exists in MongoDB
        const existingUser = await mongoStorage.getUserByEmail(user.email);
        if (!existingUser) {
          await mongoStorage.createUser({
            username: user.username,
            email: user.email,
            password: user.password,
            fullName: user.fullName,
            isVanOwner: user.isVanOwner
          });
          log(`Migrated user: ${user.email}`, 'migration');
        } else {
          log(`User already exists in MongoDB: ${user.email}`, 'migration');
        }
      } catch (error) {
        log(`Error migrating user ${user.email}: ${error}`, 'migration');
      }
    }

    // 2. Migrate van listings
    const listings = await pgStorage.getVanListings();
    log(`Migrating ${listings.length} van listings...`, 'migration');
    for (const listing of listings) {
      try {
        // Find the MongoDB user ID for this listing
        const user = await pgStorage.getUser(listing.userId);
        if (!user || !user.email) {
          log(`Cannot find user for listing ${listing.id}`, 'migration');
          continue;
        }
        
        const mongoUser = await mongoStorage.getUserByEmail(user.email);
        if (!mongoUser) {
          log(`Cannot find MongoDB user for email ${user.email}`, 'migration');
          continue;
        }

        // Create listing in MongoDB
        const mongoListing = await mongoStorage.createVanListing({
          userId: mongoUser._id,
          title: listing.title,
          description: listing.description,
          vanSize: listing.vanSize,
          hourlyRate: listing.hourlyRate,
          location: listing.location,
          postcode: listing.postcode,
          imageUrl: listing.imageUrl
        });
        
        log(`Migrated listing: ${listing.title}`, 'migration');

        // Migrate services for this listing
        const services = await pgStorage.getServicesByVanListing(listing.id);
        for (const service of services) {
          await mongoStorage.addService({
            vanListingId: mongoListing._id,
            serviceName: service.serviceName
          });
        }
        log(`Migrated ${services.length} services for listing ${listing.id}`, 'migration');
      } catch (error) {
        log(`Error migrating listing ${listing.id}: ${error}`, 'migration');
      }
    }

    // 3. Migrate bookings
    const bookings = await pgStorage.getAllBookings();
    log(`Migrating ${bookings.length} bookings...`, 'migration');
    for (const booking of bookings) {
      try {
        // Find MongoDB IDs for user and listing
        const user = await pgStorage.getUser(booking.userId);
        if (!user || !user.email) {
          log(`Cannot find user for booking ${booking.id}`, 'migration');
          continue;
        }
        
        const mongoUser = await mongoStorage.getUserByEmail(user.email);
        if (!mongoUser) {
          log(`Cannot find MongoDB user for email ${user.email}`, 'migration');
          continue;
        }

        // For the van listing, need to find by title or similar attributes
        const pgListing = await pgStorage.getVanListing(booking.vanListingId);
        if (!pgListing) {
          log(`Cannot find listing for booking ${booking.id}`, 'migration');
          continue;
        }
        
        // Find the MongoDB listing that matches this one
        const mongoListings = await mongoStorage.getVanListings();
        const mongoListing = mongoListings.find(l => l.title === pgListing.title);
        if (!mongoListing) {
          log(`Cannot find matching MongoDB listing for "${pgListing.title}"`, 'migration');
          continue;
        }

        await mongoStorage.createBooking({
          userId: mongoUser._id,
          vanListingId: mongoListing._id,
          bookingDate: booking.bookingDate,
          duration: booking.duration,
          fromLocation: booking.fromLocation,
          toLocation: booking.toLocation,
          status: booking.status,
          totalPrice: booking.totalPrice
        });
        
        log(`Migrated booking from ${booking.fromLocation} to ${booking.toLocation}`, 'migration');
      } catch (error) {
        log(`Error migrating booking ${booking.id}: ${error}`, 'migration');
      }
    }

    // 4. Migrate reviews
    const reviews = await pgStorage.getAllReviews();
    log(`Migrating ${reviews.length} reviews...`, 'migration');
    for (const review of reviews) {
      try {
        // Find MongoDB IDs for user and listing
        const user = await pgStorage.getUser(review.userId);
        if (!user || !user.email) {
          log(`Cannot find user for review ${review.id}`, 'migration');
          continue;
        }
        
        const mongoUser = await mongoStorage.getUserByEmail(user.email);
        if (!mongoUser) {
          log(`Cannot find MongoDB user for email ${user.email}`, 'migration');
          continue;
        }

        const pgListing = await pgStorage.getVanListing(review.vanListingId);
        if (!pgListing) {
          log(`Cannot find listing for review ${review.id}`, 'migration');
          continue;
        }
        
        const mongoListings = await mongoStorage.getVanListings();
        const mongoListing = mongoListings.find(l => l.title === pgListing.title);
        if (!mongoListing) {
          log(`Cannot find matching MongoDB listing for "${pgListing.title}"`, 'migration');
          continue;
        }

        await mongoStorage.createReview({
          userId: mongoUser._id,
          vanListingId: mongoListing._id,
          rating: review.rating,
          comment: review.comment
        });
        
        log(`Migrated review for listing ${pgListing.title}`, 'migration');
      } catch (error) {
        log(`Error migrating review ${review.id}: ${error}`, 'migration');
      }
    }

    log('Data migration completed successfully!', 'migration');
    return true;
  } catch (error) {
    log(`Migration failed: ${error}`, 'migration');
    return false;
  }
}