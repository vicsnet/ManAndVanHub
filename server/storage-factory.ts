import { IStorage } from './storage-interface';
import { DatabaseStorage } from './storage';
import { MongoDBStorage } from './mongodb-storage';
import mongoose from 'mongoose';
import * as pgSchema from '../shared/schema';
import * as mongoSchema from '../shared/mongodb-schema';

let storageInstance: IStorage | null = null;
let _usingMongoDB: boolean | null = null;

/**
 * Get the appropriate storage implementation based on the database connection
 */
export function getStorage(): IStorage {
  if (storageInstance) {
    return storageInstance;
  }

  // Check if MongoDB is connected
  if (mongoose.connection.readyState === 1) {
    console.log('Using MongoDB Storage implementation');
    storageInstance = new MongoDBStorage();
    _usingMongoDB = true;
  } else {
    console.log('Using PostgreSQL Storage implementation');
    storageInstance = new DatabaseStorage();
    _usingMongoDB = false;
  }

  return storageInstance;
}

/**
 * Check if MongoDB is being used
 */
export function usingMongoDB(): boolean {
  if (_usingMongoDB === null) {
    _usingMongoDB = mongoose.connection.readyState === 1;
  }
  return _usingMongoDB;
}

/**
 * Get the appropriate schema for validation based on the database in use
 * This normalizes the schema names between MongoDB and PostgreSQL
 */
export function getSchemas() {
  if (usingMongoDB()) {
    return {
      // Map MongoDB schema names to a consistent interface
      insertUserSchema: mongoSchema.userValidationSchema,
      insertVanListingSchema: mongoSchema.vanListingValidationSchema,
      insertServiceSchema: mongoSchema.serviceValidationSchema, 
      insertBookingSchema: mongoSchema.bookingValidationSchema,
      insertReviewSchema: mongoSchema.reviewValidationSchema,
      loginSchema: mongoSchema.loginValidationSchema
    };
  } else {
    return {
      // Map PostgreSQL schema names
      insertUserSchema: pgSchema.insertUserSchema,
      insertVanListingSchema: pgSchema.insertVanListingSchema, 
      insertServiceSchema: pgSchema.insertServiceSchema,
      insertBookingSchema: pgSchema.insertBookingSchema,
      insertReviewSchema: pgSchema.insertReviewSchema,
      loginSchema: pgSchema.loginSchema
    };
  }
}