import mongoose from "mongoose";
import _db from "../utils/db.js";

// Connect to database
await _db();

// Create a temporary schema for migration that accepts both old and new formats
const tempUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile: { type: String, required: true, unique: true },
  refferalCode: { type: String },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  walletBalance: { type: Number, default: 0 },
  firstPurchaseRewardGiven: { type: Boolean, default: false },
  firstPurchaseRewardAmount: { type: Number, default: 0 },
  password: { type: String, required: true },
  // Mixed type to handle both old and new structures during migration
  purchasedCourses: { type: mongoose.Schema.Types.Mixed },
  acceptTerms: { type: Boolean },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: false },
  currentSessionId: { type: String, default: null },
  lastLoginAt: { type: Date, default: null },
  sessionCreatedAt: { type: Date, default: null },
  otpToken: String,
  otpTokenExpiry: Date,
}, { strict: false });

// Final schema for after migration
const finalUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile: { type: String, required: true, unique: true },
  refferalCode: { type: String },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  walletBalance: { type: Number, default: 0 },
  firstPurchaseRewardGiven: { type: Boolean, default: false },
  firstPurchaseRewardAmount: { type: Number, default: 0 },
  password: { type: String, required: true },
  purchasedCourses: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    purchaseDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    isExpired: { type: Boolean, default: false }
  }],
  acceptTerms: { type: Boolean },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: false },
  currentSessionId: { type: String, default: null },
  lastLoginAt: { type: Date, default: null },
  sessionCreatedAt: { type: Date, default: null },
  otpToken: String,
  otpTokenExpiry: Date,
});

// Basic Course schema for population (only include fields you need for verification)
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // Add other fields if needed for verification
}, { strict: false });

// Pre-save middleware for final schema
finalUserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  if (this.isModified('currentSessionId') && this.currentSessionId) {
    this.sessionCreatedAt = new Date();
  }
  
  if (this.isModified('currentSessionId') && !this.currentSessionId) {
    this.sessionCreatedAt = null;
  }
  
  next();
});

const TempUser = mongoose.model('TempUser', tempUserSchema, 'users');
const FinalUser = mongoose.model('FinalUser', finalUserSchema, 'users');
const Course = mongoose.model('Course', courseSchema, 'courses'); // Register Course model

// Function to migrate a single user by email
async function migrateSingleUser(userEmail) {
  try {
    console.log(`Starting migration for user: ${userEmail}`);
    
    // Find the specific user using temp schema
    const user = await TempUser.findOne({ email: userEmail.toLowerCase() });
    
    if (!user) {
      console.log(`User not found: ${userEmail}`);
      return;
    }
    
    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current purchasedCourses:`, user.purchasedCourses);
    
    // Check if user already has the new structure
    if (user.purchasedCourses && user.purchasedCourses.length > 0) {
      const firstCourse = user.purchasedCourses[0];
      if (firstCourse.course || (typeof firstCourse === 'object' && firstCourse.purchaseDate)) {
        console.log('User already has the new purchasedCourses structure!');
        return;
      }
    }
    
    // Transform purchasedCourses from ObjectId array to new structure
    const transformedCourses = (user.purchasedCourses || []).map(courseId => ({
      course: courseId,
      purchaseDate: user.createdAt || new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isExpired: false
    }));
    
    console.log('Transformed courses:', transformedCourses);
    
    // Update the user with new structure using updateOne to avoid validation
    const result = await TempUser.updateOne(
      { email: userEmail.toLowerCase() },
      { 
        $set: { 
          purchasedCourses: transformedCourses,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Successfully migrated user: ${user.email}`);
      
      // Verify with final schema (without population to avoid dependency issues)
      const updatedUser = await FinalUser.findOne({ email: userEmail.toLowerCase() });
      console.log(`New purchasedCourses structure:`, updatedUser.purchasedCourses);
    } else {
      console.log(`❌ No changes made to user: ${user.email}`);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Function to verify the migration
async function verifyMigration(userEmail) {
  try {
    console.log(`Verifying migration for user: ${userEmail}`);
    
    // First, get user without population
    const user = await FinalUser.findOne({ email: userEmail.toLowerCase() });
    
    if (!user) {
      console.log(`User not found: ${userEmail}`);
      return;
    }
    
    console.log('\n=== MIGRATION VERIFICATION ===');
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`Total purchased courses: ${user.purchasedCourses.length}`);
    
    // Try to populate courses, but handle errors gracefully
    try {
      const userWithCourses = await FinalUser.findOne({ email: userEmail.toLowerCase() })
        .populate('purchasedCourses.course', 'title');
      
      userWithCourses.purchasedCourses.forEach((courseData, index) => {
        console.log(`\nCourse ${index + 1}:`);
        console.log(`  - Course ID: ${courseData.course._id || courseData.course}`);
        console.log(`  - Course Title: ${courseData.course.title || 'N/A'}`);
        console.log(`  - Purchase Date: ${courseData.purchaseDate}`);
        console.log(`  - Expiry Date: ${courseData.expiryDate}`);
        console.log(`  - Is Expired: ${courseData.isExpired}`);
      });
    } catch (populateError) {
      console.log('\n⚠️  Course population failed, showing raw data:');
      user.purchasedCourses.forEach((courseData, index) => {
        console.log(`\nCourse ${index + 1}:`);
        console.log(`  - Course ID: ${courseData.course}`);
        console.log(`  - Purchase Date: ${courseData.purchaseDate}`);
        console.log(`  - Expiry Date: ${courseData.expiryDate}`);
        console.log(`  - Is Expired: ${courseData.isExpired}`);
      });
      console.log(`\nNote: Could not fetch course titles (${populateError.message})`);
    }
    
    console.log('\n✅ Migration verification completed!');
    
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Function to rollback a single user
async function rollbackSingleUser(userEmail) {
  try {
    console.log(`Rolling back user: ${userEmail}`);
    
    const user = await TempUser.findOne({ email: userEmail.toLowerCase() });
    
    if (!user) {
      console.log(`User not found: ${userEmail}`);
      return;
    }
    
    // Convert back to simple ObjectId array
    const simpleCourses = (user.purchasedCourses || []).map(courseData => {
      return courseData.course || courseData;
    });
    
    const result = await TempUser.updateOne(
      { email: userEmail.toLowerCase() },
      { 
        $set: { 
          purchasedCourses: simpleCourses,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Successfully rolled back user: ${user.email}`);
      console.log(`Reverted purchasedCourses:`, simpleCourses);
    }
    
  } catch (error) {
    console.error('Rollback failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Function to show user's current structure
async function showUserStructure(userEmail) {
  try {
    const user = await TempUser.findOne({ email: userEmail.toLowerCase() });
    
    if (!user) {
      console.log(`User not found: ${userEmail}`);
      return;
    }
    
    console.log('\n=== CURRENT USER STRUCTURE ===');
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`Purchased Courses:`, JSON.stringify(user.purchasedCourses, null, 2));
    
    // Determine structure type
    if (user.purchasedCourses && user.purchasedCourses.length > 0) {
      const firstCourse = user.purchasedCourses[0];
      if (firstCourse.course || (typeof firstCourse === 'object' && firstCourse.purchaseDate)) {
        console.log('📊 Structure: NEW (Object with course, purchaseDate, expiryDate, isExpired)');
      } else {
        console.log('📊 Structure: OLD (Simple ObjectId array)');
      }
    } else {
      console.log('📊 No purchased courses found');
    }
    
  } catch (error) {
    console.error('Failed to show user structure:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Export functions
export {
  migrateSingleUser,
  verifyMigration,
  rollbackSingleUser,
  showUserStructure
};

// CLI interface
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if this script is run directly
if (process.argv[1] === __filename) {
  const args = process.argv.slice(2);
  const command = args[0];
  const userEmail = args[1];
  
  if (!userEmail) {
    console.log('Usage:');
    console.log('  node migrate-single-user.js migrate user@example.com');
    console.log('  node migrate-single-user.js verify user@example.com');
    console.log('  node migrate-single-user.js rollback user@example.com');
    console.log('  node migrate-single-user.js show user@example.com');
    process.exit(1);
  }
  
  switch (command) {
    case 'migrate':
      await migrateSingleUser(userEmail);
      break;
    case 'verify':
      await verifyMigration(userEmail);
      break;
    case 'rollback':
      await rollbackSingleUser(userEmail);
      break;
    case 'show':
      await showUserStructure(userEmail);
      break;
    default:
      console.log('Invalid command. Use: migrate, verify, rollback, or show');
  }
}