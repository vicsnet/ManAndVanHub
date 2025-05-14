import mongoose from 'mongoose';

// Connect to MongoDB using Mongoose
async function connectToDatabase() {
  try {
    // Use the provided MongoDB URI directly
    const mongoURI = 'mongodb+srv://rovedev:rovenow1234@cluster0.gkxebqh.mongodb.net/man-van?retryWrites=true&w=majority';
    
    // Network issues can occur with Replit and MongoDB Atlas
    // Let's try to connect with more robust options
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s 
      socketTimeoutMS: 60000, // Close sockets after 60s of inactivity
      connectTimeoutMS: 30000, // Give up initial connection after 30s
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: "majority",
    });
    
    console.log('Connected to MongoDB Atlas successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB. Using fallback storage instead:', error);
    return false; // Return false to indicate connection failure
  }
}

// Call this function when your server starts
export async function initializeDatabase() {
  const mongoConnected = await connectToDatabase();
  return mongoConnected;
}

export default mongoose;