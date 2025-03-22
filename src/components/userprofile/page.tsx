"use client";
import { useState, useEffect } from "react";
import { User, Phone, Mail, Edit, Camera, Calendar, MapPin, Briefcase, Save, X, Shield } from "lucide-react";
import { useFetchUserQuery } from "@/services/api";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { data: user, isLoading, error } = useFetchUserQuery(undefined);
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState({
    name: "",
    mobile: "",
    email: "",
    // Additional fields
    dob: "",
    address: "",
    occupation: "",
    bio: "",
  });

  const users = user?.data;

  useEffect(() => {
    if (users) {
      setUserData({
        name: users?.name || "",
        mobile: users?.mobile || "",
        email: users?.email || "",
        // Set default values for additional fields
        dob: users?.dob || "1990-01-01",
        address: users?.address || "Mumbai, India",
        occupation: users?.occupation || "Student",
        bio: users?.bio || "I am passionate about learning new skills and technologies.",
      });
    }
  }, [users]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Here you would typically call an API to update the user data
    setIsEditing(false);
    // Show success message
  };

  const handleCancel = () => {
    // Reset to original values
    if (users) {
      setUserData({
        name: users?.name || "",
        mobile: users?.mobile || "",
        email: users?.email || "",
        dob: users?.dob || "1990-01-01",
        address: users?.address || "Mumbai, India",
        occupation: users?.occupation || "Student",
        bio: users?.bio || "I am passionate about learning new skills and technologies.",
      });
    }
    setIsEditing(false);
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  // Skeleton loader component
  const ProfileSkeleton = () => (
    <div className="w-full mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left sidebar skeleton */}
        <div className="md:w-1/3 bg-gradient-to-b from-blue-500 to-blue-700">
          <div className="p-8 flex flex-col items-center">
            <div className="w-28 h-28 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded-md mt-4 animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded-md mt-2 animate-pulse"></div>
            <div className="mt-6 w-full">
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse mb-3"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Main content skeleton */}
        <div className="md:w-2/3 p-8">
          <div className="h-8 w-48 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse mb-6"></div>
          
          <div className="space-y-6">
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
            <div className="h-24 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) return <ProfileSkeleton />;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Profile</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We couldnt load your profile information. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <motion.div 
          variants={item}
          className="md:w-1/3 bg-gradient-to-b from-blue-500 to-blue-700 text-white"
        >
          <div className="p-8 flex flex-col items-center">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-md">
                <User className="text-blue-700" size={60} />
              </div>
              <button className="absolute bottom-0 right-0 bg-white text-blue-600 p-2 rounded-full shadow-md hover:bg-blue-50 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            
            <h1 className="text-2xl font-bold mt-4">{userData.name}</h1>
            <p className="text-blue-200 text-sm">{userData.occupation}</p>
            
            {/* Navigation Tabs */}
            <div className="mt-8 w-full space-y-2">
              <button 
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center transition-colors ${
                  activeTab === "profile" 
                    ? "bg-white/20 font-medium" 
                    : "hover:bg-white/10"
                }`}
              >
                <User size={18} className="mr-3" />
                Profile Information
              </button>
              <button 
                onClick={() => setActiveTab("security")}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center transition-colors ${
                  activeTab === "security" 
                    ? "bg-white/20 font-medium" 
                    : "hover:bg-white/10"
                }`}
              >
                <Shield size={18} className="mr-3" />
                Security Settings
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Main Content */}
        <motion.div variants={item} className="md:w-2/3 p-8">
          {/* Header with Edit Button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {activeTab === "profile" ? "Profile Information" : "Security Settings"}
            </h1>
            {activeTab === "profile" && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            )}
            {activeTab === "profile" && isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Save size={16} />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          {/* Profile Tab Content */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Name Field */}
              <div className={`rounded-lg border ${
                isEditing ? "border-blue-300 dark:border-blue-700" : "border-gray-200 dark:border-gray-700"
              } overflow-hidden transition-colors`}>
                <div className="flex items-center p-4">
                  <User className="text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" size={20} />
                  <div className="flex-grow">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`w-full bg-transparent outline-none text-gray-800 dark:text-white ${
                        isEditing ? "border-b border-blue-300 dark:border-blue-700 pb-1" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Email Field */}
              <div className={`rounded-lg border ${
                isEditing ? "border-blue-300 dark:border-blue-700" : "border-gray-200 dark:border-gray-700"
              } overflow-hidden transition-colors`}>
                <div className="flex items-center p-4">
                  <Mail className="text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" size={20} />
                  <div className="flex-grow">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`w-full bg-transparent outline-none text-gray-800 dark:text-white ${
                        isEditing ? "border-b border-blue-300 dark:border-blue-700 pb-1" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Phone Field */}
              <div className={`rounded-lg border ${
                isEditing ? "border-blue-300 dark:border-blue-700" : "border-gray-200 dark:border-gray-700"
              } overflow-hidden transition-colors`}>
                <div className="flex items-center p-4">
                  <Phone className="text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" size={20} />
                  <div className="flex-grow">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="mobile"
                      value={userData.mobile}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`w-full bg-transparent outline-none text-gray-800 dark:text-white ${
                        isEditing ? "border-b border-blue-300 dark:border-blue-700 pb-1" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Date of Birth Field */}
              <div className={`rounded-lg border ${
                isEditing ? "border-blue-300 dark:border-blue-700" : "border-gray-200 dark:border-gray-700"
              } overflow-hidden transition-colors`}>
                <div className="flex items-center p-4">
                  <Calendar className="text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" size={20} />
                  <div className="flex-grow">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={userData.dob}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`w-full bg-transparent outline-none text-gray-800 dark:text-white ${
                        isEditing ? "border-b border-blue-300 dark:border-blue-700 pb-1" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Address Field */}
              <div className={`rounded-lg border ${
                isEditing ? "border-blue-300 dark:border-blue-700" : "border-gray-200 dark:border-gray-700"
              } overflow-hidden transition-colors`}>
                <div className="flex items-center p-4">
                  <MapPin className="text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" size={20} />
                  <div className="flex-grow">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={userData.address}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`w-full bg-transparent outline-none text-gray-800 dark:text-white ${
                        isEditing ? "border-b border-blue-300 dark:border-blue-700 pb-1" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Occupation Field */}
              <div className={`rounded-lg border ${
                isEditing ? "border-blue-300 dark:border-blue-700" : "border-gray-200 dark:border-gray-700"
              } overflow-hidden transition-colors`}>
                <div className="flex items-center p-4">
                  <Briefcase className="text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" size={20} />
                  <div className="flex-grow">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={userData.occupation}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      className={`w-full bg-transparent outline-none text-gray-800 dark:text-white ${
                        isEditing ? "border-b border-blue-300 dark:border-blue-700 pb-1" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Bio Field */}
              <div className={`rounded-lg border ${
                isEditing ? "border-blue-300 dark:border-blue-700" : "border-gray-200 dark:border-gray-700"
              } overflow-hidden transition-colors`}>
                <div className="flex p-4">
                  <User className="text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0 mt-1" size={20} />
                  <div className="flex-grow">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Bio</label>
                    <textarea
                      name="bio"
                      value={userData.bio}
                      onChange={handleChange}
                      readOnly={!isEditing}
                      rows={3}
                      className={`w-full bg-transparent outline-none text-gray-800 dark:text-white ${
                        isEditing ? "border-b border-blue-300 dark:border-blue-700 pb-1" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Security Tab Content */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Security settings allow you to manage your password and account security preferences.
                </p>
              </div>
              
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">Change Password</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Its a good idea to use a strong password that you dont use elsewhere
                  </p>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Change Password
                  </button>
                </div>
              </div>
              
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>
              
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">Active Sessions</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Manage your active sessions and sign out from other devices
                  </p>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    Sign Out All Devices
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
