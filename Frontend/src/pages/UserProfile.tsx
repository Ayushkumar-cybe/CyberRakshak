import React from "react";
import { User } from "lucide-react";

const UserProfile = () => {
  const user = {
    name: "Admin User",
    email: "admin@cyberrakshak.ai",
    role: "Security Analyst",
    department: "Cyber Defense",
    joined: "Jan 12, 2024",
    accountId: "CRK-001-ADM",
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="opacity-70 text-sm">Manage your account details.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex items-center gap-6">

        <div className="p-4 bg-blue-100 dark:bg-slate-700 rounded-full">
          <User className="w-10 h-10 text-blue-600 dark:text-blue-300" />
        </div>

        <div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="opacity-70">{user.email}</p>
          <p className="opacity-70 text-sm mt-1">{user.role} · {user.department}</p>
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 space-y-4">

        {[
          { label: "Full Name", value: user.name },
          { label: "Email Address", value: user.email },
          { label: "Role", value: user.role },
          { label: "Department", value: user.department },
          { label: "Account ID", value: user.accountId },
          { label: "Joined On", value: user.joined },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b last:border-0 dark:border-slate-700"
          >
            <span className="font-medium">{item.label}</span>
            <span className="opacity-70 text-sm">{item.value}</span>
          </div>
        ))}

      </div>

      {/* Edit Profile Button */}
      <a
        href="/settings"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Edit Profile
      </a>

    </div>
  );
};

export default UserProfile;