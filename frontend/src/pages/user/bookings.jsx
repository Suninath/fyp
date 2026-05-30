import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";
import BookingHistory from "../../components/userComp/BookingHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/ui/card";
import { Button } from "../../ui/ui/button";
import { getUserBookings } from "../../rtk/slice/bookingSlice";
import { getUserProfile } from "../../rtk/thunk/authThunk";
import { isUserVerified } from "../../lib/verification";

const UserBookingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { bookings, loading, pagination } = useSelector((state) => state.booking);

  // Fetch all bookings on mount to calculate stats
  useEffect(() => {
    dispatch(getUserBookings({ page: 1, limit: 100 }));
    dispatch(getUserProfile());
  }, [dispatch]);

  // Refresh profile on focus in case verification changed in another tab/session.
  useEffect(() => {
    const handleWindowFocus = () => {
      dispatch(getUserProfile());
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => window.removeEventListener("focus", handleWindowFocus);
  }, [dispatch]);

  // Temporary debug log to verify frontend user shape for verification checks.
  useEffect(() => {
    console.log("[Bookings] user profile", user);
  }, [user]);

  // Calculate stats from bookings

  // Calculate stats from bookings
  const stats = useMemo(() => {
    const totalBookings = bookings?.length || 0;
    const pendingBookings = bookings?.filter(b => b.status === "Pending").length || 0;
    const confirmedBookings = bookings?.filter(b => b.status === "Confirmed").length || 0;
    const completedBookings = bookings?.filter(b => b.status === "Completed").length || 0;
    const cancelledBookings = bookings?.filter(b => b.status === "Cancelled").length || 0;
    
    return { totalBookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Verification Warning Banner */}
        {user && !isUserVerified(user) && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Account Verification Required</h3>
              <p className="text-sm text-yellow-800 mt-1">
                You can view your bookings, but account verification is required to create new bookings. 
                Please submit your verification documents in your profile.
              </p>
              <Button
                onClick={() => window.location.href = '/profile'}
                size="sm"
                className="mt-3 bg-amber text-white hover:bg-amber-600"
              >
                Complete Verification
              </Button>
            </div>
          </div>
        )}

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 text-sm">View and manage all your vehicle bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? "..." : stats.totalBookings}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Bookings</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {loading ? "..." : stats.pendingBookings}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Confirmed Bookings</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {loading ? "..." : stats.confirmedBookings}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="border-b w-full rounded-none mb-6">
              <TabsTrigger value="all" className="border-b-2 border-transparent data-[state=active]:border-blue-600">
                All Bookings
              </TabsTrigger>
              <TabsTrigger value="pending" className="border-b-2 border-transparent data-[state=active]:border-blue-600">
                Pending
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="border-b-2 border-transparent data-[state=active]:border-blue-600">
                Confirmed
              </TabsTrigger>
              <TabsTrigger value="completed" className="border-b-2 border-transparent data-[state=active]:border-blue-600">
                Completed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <BookingHistory filter="all" />
            </TabsContent>

            <TabsContent value="pending">
              <BookingHistory filter="pending" />
            </TabsContent>

            <TabsContent value="confirmed">
              <BookingHistory filter="confirmed" />
            </TabsContent>

            <TabsContent value="completed">
              <BookingHistory filter="completed" />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserBookingsPage;
