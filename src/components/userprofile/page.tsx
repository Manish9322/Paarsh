import { useState, useEffect } from "react";
import { User, Phone, Mail, Edit } from "lucide-react";
import { useFetchUserQuery } from "@/services/api";

export default function ProfilePage() {
  const { data: user, isLoading, error } = useFetchUserQuery(undefined);
  console.log("Fetched User Data:", user); // Debugging: Check fetched user data

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    mobile: "",
    email: "",
  });

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

  if (isLoading) return <div className="text-center mt-10 text-lg">Loading user data...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error fetching user data!</div>;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      {/* Full-Screen Transparent Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-75" 
        style={{ backgroundImage: "url('/images/profile/user1.jpg')" }}>
      </div>

      {/* Profile Container */}
      <div className="relative flex flex-col md:flex-row bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden w-full max-w-4xl z-10">
        {/* Left Section - Profile Info */}
        <div className="md:w-1/3 w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-700 to-gray-900 text-white p-8">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-md">
            <User className="text-gray-700" size={60} />
          </div>
          <h2 className="text-2xl font-bold mt-4">Hi, {userData.name}</h2>
        </div>

        {/* Right Section - Profile Form */}
        <div className="md:w-2/3 w-full p-8">
          <div className="flex items-center mb-6">
            <User className="text-gray-500 dark:text-gray-300 mr-3" size={28} />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Hi, {userData.name} 👋</h2>
          </div>

          <div className="space-y-6">
            {/* Name Field */}
            <div className={`flex items-center border-b-2 py-3 transition-all ${
              isEditing ? "border-blue-500" : "border-gray-300 dark:border-gray-600"
            }`}>
              <User className="text-gray-500 dark:text-gray-300 mr-3" size={22} />
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                readOnly={!isEditing}
                className="w-full bg-transparent outline-none text-gray-800 dark:text-white"
              />
            </div>

            {/* Mobile Number Field */}
            <div className={`flex items-center border-b-2 py-3 transition-all ${
              isEditing ? "border-blue-500" : "border-gray-300 dark:border-gray-600"
            }`}>
              <Phone className="text-gray-500 dark:text-gray-300 mr-3" size={22} />
              <input
                type="text"
                name="mobile"
                value={userData.mobile}
                onChange={handleChange}
                readOnly={!isEditing}
                className="w-full bg-transparent outline-none text-gray-800 dark:text-white"
              />
            </div>

            {/* Email Field */}
            <div className={`flex items-center border-b-2 py-3 transition-all ${
              isEditing ? "border-blue-500" : "border-gray-300 dark:border-gray-600"
            }`}>
              <Mail className="text-gray-500 dark:text-gray-300 mr-3" size={22} />
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                readOnly={!isEditing}
                className="w-full bg-transparent outline-none text-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Edit/Save Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="mt-6 flex items-center justify-center w-full bg-gray-700 hover:bg-gray-800 text-white py-3 px-6 rounded-lg transition-all shadow-md"
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
            <Edit className="ml-2" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
