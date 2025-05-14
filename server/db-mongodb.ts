import mongoose from 'mongoose';

// Connect to MongoDB using Mongoose
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/manandvan');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Call this function when your server starts
export async function initializeDatabase() {
  await connectToDatabase();
}

export default mongoose;