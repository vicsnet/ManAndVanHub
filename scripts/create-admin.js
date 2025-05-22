/**
 * Script to create an admin user in the database
 * Run with: node scripts/create-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');

// Simple password hashing function
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  }
}

// Create user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  isVanOwner: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdminUser() {
  const adminUsername = 'admin';
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123'; // Change this in production!
  const adminFullName = 'System Administrator';

  try {
    const existingAdmin = await User.findOne({ username: adminUsername });
    
    if (existingAdmin) {
      console.log(`Admin user '${adminUsername}' already exists.`);
      
      // Update admin privileges if not already an admin
      if (!existingAdmin.isAdmin) {
        await User.updateOne(
          { username: adminUsername },
          { $set: { isAdmin: true } }
        );
        console.log(`Updated '${adminUsername}' with admin privileges.`);
      }
    } else {
      // Create new admin user
      const adminUser = new User({
        username: adminUsername,
        email: adminEmail,
        password: hashPassword(adminPassword),
        fullName: adminFullName,
        isVanOwner: true,
        isAdmin: true
      });

      await adminUser.save();
      console.log(`Admin user '${adminUsername}' created successfully.`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

async function main() {
  await connectToDatabase();
  await createAdminUser();
  mongoose.connection.close();
  console.log('Done');
}

main().catch(console.error);