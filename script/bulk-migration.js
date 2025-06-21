import mongoose from "mongoose";
import _db from "../utils/db.js";
import fs from 'fs';
import path from 'path';

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

// Utility function to create backup
async function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'migration-backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `users-backup-${timestamp}.json`);
    
    console.log('📦 Creating backup of all users...');
    const allUsers = await TempUser.find({}).lean();
    
    fs.writeFileSync(backupFile, JSON.stringify(allUsers, null, 2));
    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`📊 Backed up ${allUsers.length} users`);
    
    return backupFile;
  } catch (error) {
    console.error('❌ Backup creation failed:', error);
    throw error;
  }
}

// Utility function to validate user data structure
function validateUserData(user) {
  const issues = [];
  
  // Check required fields
  if (!user.email) issues.push('Missing email');
  if (!user.name) issues.push('Missing name');
  if (!user.mobile) issues.push('Missing mobile');
  
  // Check purchasedCourses structure
  if (user.purchasedCourses) {
    if (!Array.isArray(user.purchasedCourses)) {
      issues.push('purchasedCourses is not an array');
    } else {
      user.purchasedCourses.forEach((course, index) => {
        if (!course) {
          issues.push(`purchasedCourses[${index}] is null/undefined`);
        } else if (typeof course === 'string' || mongoose.Types.ObjectId.isValid(course)) {
          // This is old format - OK for migration
        } else if (typeof course === 'object') {
          if (!course.course) {
            issues.push(`purchasedCourses[${index}] missing course field`);
          }
          if (!course.purchaseDate && !course.expiryDate) {
            issues.push(`purchasedCourses[${index}] missing date fields`);
          }
        } else {
          issues.push(`purchasedCourses[${index}] has invalid format`);
        }
      });
    }
  }
  
  return issues;
}

// Utility function to determine if user needs migration
function needsMigration(user) {
  if (!user.purchasedCourses || user.purchasedCourses.length === 0) {
    return false; // No courses to migrate
  }
  
  const firstCourse = user.purchasedCourses[0];
  
  // Check if it's already in new format
  if (firstCourse.course || (typeof firstCourse === 'object' && firstCourse.purchaseDate)) {
    return false; // Already migrated
  }
  
  // Check if it's in old format (ObjectId or string)
  if (typeof firstCourse === 'string' || mongoose.Types.ObjectId.isValid(firstCourse)) {
    return true; // Needs migration
  }
  
  return false; // Unknown format, skip
}

// Function to migrate all users
async function migrateAllUsers(options = {}) {
  const {
    batchSize = 100,
    dryRun = false,
    createBackupFile = true,
    continueOnError = true
  } = options;
  
  let backupFile = null;
  let migrationStats = {
    total: 0,
    alreadyMigrated: 0,
    needsMigration: 0,
    migrated: 0,
    errors: 0,
    skipped: 0,
    startTime: new Date(),
    endTime: null,
    errors: []
  };
  
  try {
    console.log('🚀 Starting bulk user migration...');
    console.log(`📋 Options: batchSize=${batchSize}, dryRun=${dryRun}, createBackup=${createBackupFile}`);
    
    // Create backup if requested
    if (createBackupFile && !dryRun) {
      backupFile = await createBackup();
    }
    
    // Get total count
    const totalUsers = await TempUser.countDocuments();
    migrationStats.total = totalUsers;
    
    console.log(`\n📊 Found ${totalUsers} users to process`);
    
    if (totalUsers === 0) {
      console.log('❌ No users found to migrate');
      return migrationStats;
    }
    
    // Process users in batches
    let processed = 0;
    
    while (processed < totalUsers) {
      const batch = await TempUser.find({})
        .skip(processed)
        .limit(batchSize)
        .lean();
      
      console.log(`\n📦 Processing batch ${Math.floor(processed / batchSize) + 1} (${processed + 1}-${Math.min(processed + batch.length, totalUsers)} of ${totalUsers})`);
      
      for (const user of batch) {
        try {
          // Validate user data
          const validationIssues = validateUserData(user);
          if (validationIssues.length > 0) {
            console.log(`⚠️  User ${user.email} has validation issues: ${validationIssues.join(', ')}`);
            if (!continueOnError) {
              throw new Error(`Validation failed for user ${user.email}`);
            }
            migrationStats.skipped++;
            continue;
          }
          
          // Check if migration is needed
          if (!needsMigration(user)) {
            console.log(`✅ User ${user.email} already migrated or has no courses`);
            migrationStats.alreadyMigrated++;
            continue;
          }
          
          migrationStats.needsMigration++;
          
          if (dryRun) {
            console.log(`🔍 DRY RUN: Would migrate user ${user.email} with ${user.purchasedCourses.length} courses`);
            continue;
          }
          
          // Transform purchasedCourses
          const transformedCourses = (user.purchasedCourses || []).map(courseId => {
            // Handle case where courseId might be null or undefined
            if (!courseId) {
              console.log(`⚠️  Skipping null/undefined course for user ${user.email}`);
              return null;
            }
            
            return {
              course: courseId,
              purchaseDate: user.createdAt || new Date(),
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
              isExpired: false
            };
          }).filter(course => course !== null); // Remove null courses
          
          // Update user with new structure
          const result = await TempUser.updateOne(
            { _id: user._id },
            { 
              $set: { 
                purchasedCourses: transformedCourses,
                updatedAt: new Date()
              }
            }
          );
          
          if (result.modifiedCount > 0) {
            console.log(`✅ Migrated user ${user.email} (${transformedCourses.length} courses)`);
            migrationStats.migrated++;
          } else {
            console.log(`⚠️  No changes made to user ${user.email}`);
          }
          
        } catch (error) {
          console.error(`❌ Error processing user ${user.email}:`, error.message);
          migrationStats.errors.push({
            email: user.email,
            error: error.message,
            timestamp: new Date()
          });
          migrationStats.errors++;
          
          if (!continueOnError) {
            throw error;
          }
        }
      }
      
      processed += batch.length;
      
      // Progress update
      const progress = ((processed / totalUsers) * 100).toFixed(1);
      console.log(`📈 Progress: ${progress}% (${processed}/${totalUsers})`);
      
      // Small delay to prevent overwhelming the database
      if (processed < totalUsers) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    migrationStats.endTime = new Date();
    const duration = migrationStats.endTime - migrationStats.startTime;
    
    console.log('\n🎉 Migration completed!');
    console.log('\n📊 MIGRATION SUMMARY:');
    console.log(`   Total users processed: ${migrationStats.total}`);
    console.log(`   Already migrated: ${migrationStats.alreadyMigrated}`);
    console.log(`   Needed migration: ${migrationStats.needsMigration}`);
    console.log(`   Successfully migrated: ${migrationStats.migrated}`);
    console.log(`   Errors: ${migrationStats.errors}`);
    console.log(`   Skipped: ${migrationStats.skipped}`);
    console.log(`   Duration: ${Math.round(duration / 1000)}s`);
    
    if (backupFile) {
      console.log(`\n💾 Backup file: ${backupFile}`);
    }
    
    if (migrationStats.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      migrationStats.errors.forEach(error => {
        console.log(`   ${error.email}: ${error.error}`);
      });
    }
    
    return migrationStats;
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    migrationStats.endTime = new Date();
    throw error;
  }
}

// Function to verify migration for all users
async function verifyAllMigration(options = {}) {
  const { sampleSize = 50, showDetails = false } = options;
  
  try {
    console.log('🔍 Verifying migration for all users...');
    
    const totalUsers = await FinalUser.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);
    
    // Get sample of users for detailed verification
    const sampleUsers = await FinalUser.find({})
      .limit(sampleSize)
      .lean();
    
    console.log(`\n🔍 Checking ${sampleUsers.length} users for verification...`);
    
    let verificationStats = {
      total: sampleUsers.length,
      newFormat: 0,
      oldFormat: 0,
      noCourses: 0,
      invalidFormat: 0,
      errors: []
    };
    
    for (const user of sampleUsers) {
      try {
        if (!user.purchasedCourses || user.purchasedCourses.length === 0) {
          verificationStats.noCourses++;
          if (showDetails) {
            console.log(`📝 ${user.email}: No purchased courses`);
          }
          continue;
        }
        
        const firstCourse = user.purchasedCourses[0];
        
        if (firstCourse.course && firstCourse.purchaseDate) {
          verificationStats.newFormat++;
          if (showDetails) {
            console.log(`✅ ${user.email}: New format (${user.purchasedCourses.length} courses)`);
          }
        } else if (typeof firstCourse === 'string' || mongoose.Types.ObjectId.isValid(firstCourse)) {
          verificationStats.oldFormat++;
          if (showDetails) {
            console.log(`⚠️  ${user.email}: Old format (${user.purchasedCourses.length} courses)`);
          }
        } else {
          verificationStats.invalidFormat++;
          if (showDetails) {
            console.log(`❌ ${user.email}: Invalid format`);
          }
        }
        
      } catch (error) {
        verificationStats.errors.push({
          email: user.email,
          error: error.message
        });
      }
    }
    
    console.log('\n📊 VERIFICATION RESULTS:');
    console.log(`   Sample size: ${verificationStats.total}`);
    console.log(`   New format: ${verificationStats.newFormat}`);
    console.log(`   Old format: ${verificationStats.oldFormat}`);
    console.log(`   No courses: ${verificationStats.noCourses}`);
    console.log(`   Invalid format: ${verificationStats.invalidFormat}`);
    console.log(`   Errors: ${verificationStats.errors.length}`);
    
    if (verificationStats.oldFormat > 0) {
      console.log('\n⚠️  Some users still have old format! Migration may be incomplete.');
    } else {
      console.log('\n✅ All sampled users have been successfully migrated!');
    }
    
    return verificationStats;
    
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
}

// Function to rollback all users from backup
async function rollbackFromBackup(backupFilePath) {
  try {
    console.log(`🔄 Starting rollback from backup: ${backupFilePath}`);
    
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilePath}`);
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    console.log(`📦 Loaded backup with ${backupData.length} users`);
    
    let rollbackStats = {
      total: backupData.length,
      restored: 0,
      errors: 0,
      startTime: new Date()
    };
    
    for (const userData of backupData) {
      try {
        await TempUser.updateOne(
          { _id: userData._id },
          { $set: userData },
          { upsert: true }
        );
        rollbackStats.restored++;
        
        if (rollbackStats.restored % 100 === 0) {
          console.log(`📈 Restored ${rollbackStats.restored}/${rollbackStats.total} users`);
        }
        
      } catch (error) {
        console.error(`❌ Error restoring user ${userData.email}:`, error.message);
        rollbackStats.errors++;
      }
    }
    
    rollbackStats.endTime = new Date();
    const duration = rollbackStats.endTime - rollbackStats.startTime;
    
    console.log('\n🎉 Rollback completed!');
    console.log(`   Restored: ${rollbackStats.restored}/${rollbackStats.total}`);
    console.log(`   Errors: ${rollbackStats.errors}`);
    console.log(`   Duration: ${Math.round(duration / 1000)}s`);
    
    return rollbackStats;
    
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}

// Export functions
export {
  migrateAllUsers,
  verifyAllMigration,
  rollbackFromBackup,
  createBackup
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
  
  try {
    switch (command) {
      case 'migrate':
        const dryRun = args.includes('--dry-run');
        const noBacup = args.includes('--no-backup');
        const batchSize = parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]) || 100;
        
        console.log('Starting migration with options:', { dryRun, noBacup, batchSize });
        
        await migrateAllUsers({
          batchSize,
          dryRun,
          createBackupFile: !noBacup,
          continueOnError: true
        });
        break;
        
      case 'verify':
        const sampleSize = parseInt(args.find(arg => arg.startsWith('--sample-size='))?.split('=')[1]) || 50;
        const showDetails = args.includes('--details');
        
        await verifyAllMigration({ sampleSize, showDetails });
        break;
        
      case 'rollback':
        const backupFile = args[1];
        if (!backupFile) {
          console.log('Usage: node bulk-migration.js rollback <backup-file-path>');
          process.exit(1);
        }
        await rollbackFromBackup(backupFile);
        break;
        
      case 'backup':
        await createBackup();
        break;
        
      default:
        console.log('Usage:');
        console.log('  node bulk-migration.js migrate [--dry-run] [--no-backup] [--batch-size=100]');
        console.log('  node bulk-migration.js verify [--sample-size=50] [--details]');
        console.log('  node bulk-migration.js rollback <backup-file-path>');
        console.log('  node bulk-migration.js backup');
        console.log('');
        console.log('Examples:');
        console.log('  node bulk-migration.js migrate --dry-run');
        console.log('  node bulk-migration.js migrate --batch-size=50');
        console.log('  node bulk-migration.js verify --sample-size=100 --details');
        console.log('  node bulk-migration.js rollback ./migration-backups/users-backup-2024-01-01.json');
    }
  } catch (error) {
    console.error('Command failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}