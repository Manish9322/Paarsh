"use client";
import { useState, useEffect } from "react";
import { User, Phone, Mail, Edit, Camera, Save, X, Shield, Lock } from "lucide-react";
import { useChangePasswordMutation, useFetchUserQuery, useUpdateUserMutation } from "@/services/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { data: user, isLoading, error } = useFetchUserQuery(undefined);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState({
    name: "",
    mobile: "",
    email: "",
  });
  // New state for password modal and fields
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    previousPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [_CHANGEPASSORD] = useChangePasswordMutation()

  const users = user?.data;

  useEffect(() => {
    if (users) {
      setUserData({
        name: users?.name || "",
        mobile: users?.mobile || "",
        email: users?.email || "",
      });
    }
  }, [users]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError(""); // Clear error on input change
  };

  const handleSave = async () => {
    try {
      if (!users?._id) {
        toast.error("User ID not found");
        return;
      }

      const response = await updateUser({
        id: users._id,
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
      }).unwrap();

      if (response?.success) {
        toast.success("Profile updated successfully", {
          position: "bottom-right",
          duration: 3000,
        });
        setIsEditing(false);
      } else {
        toast.error(response?.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error?.status === 401) {
        toast.error("Please login again to update your profile");
      } else if (error?.status === 403) {
        toast.error("You are not authorized to update this profile");
      } else {
        toast.error(error?.data?.message || "Failed to update profile. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    if (users) {
      setUserData({
        name: users?.name || "",
        mobile: users?.mobile || "",
        email: users?.email || "",
      });
    }
    setIsEditing(false);
  };

const handlePasswordSubmit = async (e) => {
  e.preventDefault();
  setPasswordError("");

  // Basic validation
  if (
    !passwordData.previousPassword ||
    !passwordData.newPassword ||
    !passwordData.confirmPassword
  ) {
    toast.error("All Fields are required", {
          position: "bottom-right"
      });
    return;
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    toast.error("New password and confirm password do not match", {
          position: "bottom-right"
      });
    return;
  }

  if (passwordData.newPassword.length < 8) {
    toast.error("New password must be at least 8 characters long", {
          position: "bottom-right"
      });
    return;
  }

  try {
    setIsChangingPassword(true);

    const result = await _CHANGEPASSORD({
      email: users.email,
      userId: users._id,
      previousPassword: passwordData.previousPassword,
      newPassword: passwordData.newPassword,
    }).unwrap(); // <-- unwrap to get the actual response data

    if (result.success) {
      toast.success("Password updated successfully", {
          position: "bottom-right"
      });

      setIsPasswordModalOpen(false);
      setPasswordData({
        previousPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      setPasswordError(result.message || "Failed to update password");
    }
  } catch (error) {
    console.error("Error changing password:", error);
    setPasswordError(error?.data?.message || "An error occurred. Please try again.");
  } finally {
    setIsChangingPassword(false);
  }
};


  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setPasswordData({
      previousPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
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

  // Modal animation
  const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.2 } },
  };

  // Skeleton loader component
  const ProfileSkeleton = () => (
    <div className="w-full mx-auto bg-white dark:bg-gray-800 rounded-md shadow-md overflow-hidden">
      <div className="flex flex-col md:flex-row">
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
        <div className="md:w-2/3 p-8">
          <div className="h-8 w-48 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse mb-6"></div>
          <div className="space-y-6">
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
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
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-md text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-md flex items-center justify-center">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Profile</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We couldn't load your profile information. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full mx-auto bg-white dark:bg-gray-800 rounded-md shadow-md overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          {/* Left Sidebar */}
          <motion.div 
            variants={item}
            className="md:w-1/3 bg-gradient-to-b from-blue-500 to-blue-700 text-white"
          >
            <div className="p-8 flex flex-col items-center">
              <div className="relative">
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-md">
                  <User className="text-blue-700" size={60} />
                </div>
                <button className="absolute bottom-0 right-0 bg-white text-blue-600 p-2 rounded-full shadow-md hover:bg-blue-50 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <h1 className="text-2xl font-bold mt-4">{userData.name}</h1>
              <p className="text-blue-200 text-sm">{userData.email}</p>
              <div className="mt-8 w-full space-y-2">
                <button 
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center transition-colors ${
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
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center transition-colors ${
                    activeTab === "security" 
                      ? "bg-white/20 font-medium" 
                      : "hover:bg-white/10"
                  }`}
                >
                  <Shield size={18} className="mr-3" />
                  Security Settings
                </button>
                <Link 
                  href="/delete-account"
                  className="w-full text-left px-4 py-2 rounded-md flex items-center text-white hover:bg-white/10 transition-colors"
                >
                  <User size={18} className="mr-3" />
                  Delete Account
                </Link>
              </div>
            </div>
          </motion.div>
          
          {/* Main Content */}
          <motion.div variants={item} className="md:w-2/3 p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {activeTab === "profile" ? "Profile Information" : "Security Settings"}
              </h1>
              {activeTab === "profile" && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              )}
              {activeTab === "profile" && isEditing && (
                <div className="flex gap-2">
                  \

                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                  >
                    <Save size={16} />
                    {isUpdating ? "Saving..." : "Save"}
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
                <div className={`rounded-md border ${
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
                <div className={`rounded-md border ${
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
                <div className={`rounded-md border ${
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
              </div>
            )}
            
            {/* Security Tab Content */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Security settings allow you to manage your password and account security preferences.
                  </p>
                </div>
                <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 dark:text-white mb-2">Change Password</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      It's a good idea to use a strong password that you don't use elsewhere
                    </p>
                    <button
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
                <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 dark:text-white mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>
                <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 dark:text-white mb-2">Active Sessions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Manage your active sessions and sign out from other devices
                    </p>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                      Sign Out All Devices
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Change Password</h2>
              <button
                onClick={handlePasswordModalClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    name="previousPassword"
                    value={passwordData.previousPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark�text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handlePasswordModalClose}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                >
                  {isChangingPassword ? "Saving..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </>
  );
}