import React, { useState } from "react";

const ProfileTab = () => {
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@cyberrakshak.ai",
    role: "Security Analyst",
    department: "Cyber Defense",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords({ ...passwords, [field]: value });
  };

  return (
    <div className="space-y-10 animate-fade-up">

      {/* USER INFO */}
      <div>
        <h2 className="text-lg font-semibold mb-4">User Information</h2>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Name */}
          <div>
            <label className="font-medium text-sm opacity-70">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileChange("name", e.target.value)}
              className="mt-1 w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
            />
          </div>

          {/* Email */}
          <div>
            <label className="font-medium text-sm opacity-70">Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange("email", e.target.value)}
              className="mt-1 w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
            />
          </div>

          {/* Role */}
          <div>
            <label className="font-medium text-sm opacity-70">Role</label>
            <input
              type="text"
              value={profile.role}
              onChange={(e) => handleProfileChange("role", e.target.value)}
              className="mt-1 w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
            />
          </div>

          {/* Department */}
          <div>
            <label className="font-medium text-sm opacity-70">Department</label>
            <input
              type="text"
              value={profile.department}
              onChange={(e) => handleProfileChange("department", e.target.value)}
              className="mt-1 w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
            />
          </div>

        </div>

        <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
          Save Changes
        </button>
      </div>


      {/* CHANGE PASSWORD */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Current Password */}
          <div>
            <label className="font-medium text-sm opacity-70">Current Password</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => handlePasswordChange("current", e.target.value)}
              className="mt-1 w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="font-medium text-sm opacity-70">New Password</label>
            <input
              type="password"
              value={passwords.newPass}
              onChange={(e) => handlePasswordChange("newPass", e.target.value)}
              className="mt-1 w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="font-medium text-sm opacity-70">Confirm Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => handlePasswordChange("confirm", e.target.value)}
              className="mt-1 w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
            />
          </div>

        </div>

        <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
          Update Password
        </button>
      </div>

    </div>
  );
};

export default ProfileTab;