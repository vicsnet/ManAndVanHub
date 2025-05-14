import { IStorage } from './storage-interface';
import { DatabaseStorage } from './storage';
import { MongoDBStorage } from './mongodb-storage';
import mongoose from 'mongoose';

let storageInstance: IStorage | null = null;

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
  } else {
    console.log('Using PostgreSQL Storage implementation');
    storageInstance = new DatabaseStorage();
  }

  return storageInstance;
}