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
 */
export function getSchemas() {
  return usingMongoDB() ? mongoSchema : pgSchema;
}