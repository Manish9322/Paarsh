"use client";
import React, { useState } from "react";
import { Camera, Edit, Save } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    bio: "Full-stack developer with a passion for creating amazing web applications.",
    location: "New York, USA",
    phone: "+1 123 456 7890",
    profilePic: "/images/default-avatar.png",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        {/* Profile Picture */}
        <div className="relative flex justify-center">
          <img
            src={selectedImage || user.profilePic}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover"
          />
          <label className="absolute bottom-2 right-2 bg-gray-800 p-2 rounded-full cursor-pointer">
            <Camera className="text-white" size={18} />
            <input type="file" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        {/* User Details */}
        <div className="mt-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                className="border p-1 rounded-md"
              />
            ) : (
              user.name
            )}
          </h2>
          <p className="text-gray-600">{user.email}</p>
        </div>

        {/* Profile Information */}
        <div className="mt-6 space-y-4">
          {/* Bio */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={user.bio}
                onChange={handleInputChange}
                className="border p-2 rounded-md"
              />
            ) : (
              <p className="text-gray-800">{user.bio}</p>
            )}
          </div>

          {/* Location */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Location</label>
            {isEditing ? (
              <input
                type="text"
                name="location"
                value={user.location}
                onChange={handleInputChange}
                className="border p-2 rounded-md"
              />
            ) : (
              <p className="text-gray-800">{user.location}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Phone</label>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={user.phone}
                onChange={handleInputChange}
                className="border p-2 rounded-md"
              />
            ) : (
              <p className="text-gray-800">{user.phone}</p>
            )}
          </div>
        </div>

        {/* Edit / Save Button */}
        <div className="mt-6 flex justify-center">
          {isEditing ? (
            <button
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
              onClick={() => setIsEditing(false)}
            >
              <Save size={18} className="mr-2" />
              Save Changes
            </button>
          ) : (
            <button
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={18} className="mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
