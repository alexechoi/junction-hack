"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  lastLoggedIn: Date | { toDate?: () => Date };
  lastLoggedInIp: string;
  termsAccepted: boolean;
  marketingAccepted: boolean;
  createdAt: Date | { toDate?: () => Date };
}

export default function DashboardPage() {
  const { user, logout, getUserData } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchUserData = async () => {
      const data = await getUserData(user.uid);
      setUserData(data);
      setLoading(false);
    };

    fetchUserData();
  }, [user, router, getUserData]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Welcome back!
                </h2>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                  {userData?.firstName && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Name:</span>{" "}
                      {userData.firstName} {userData.lastName}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">User ID:</span> {user?.uid}
                  </p>
                  {userData?.createdAt && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Member since:</span>{" "}
                      {(() => {
                        const dateValue =
                          userData.createdAt instanceof Date
                            ? userData.createdAt
                            : (
                                userData.createdAt as { toDate?: () => Date }
                              ).toDate?.();
                        return dateValue
                          ? new Date(dateValue).toLocaleDateString()
                          : "";
                      })()}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
