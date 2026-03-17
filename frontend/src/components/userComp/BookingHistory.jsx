import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserBookings, cancelBooking, initiatePayment } from "../../rtk/slice/bookingSlice";
import { canReviewBooking, getBookingReview } from "../../rtk/slice/reviewSlice";
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Car, 
  Eye,
  Fuel,
  Gauge,
  Palette,
  Settings,
  FileText,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Tag,
  Star,
  MessageSquare,
  Pencil
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { SucessToast, ErrorToast } from "../common/toast";
import ReviewForm from "./ReviewForm";

const BookingHistory = ({ filter = "all" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading, error, pagination } = useSelector(
    (state) => state.booking
  );
  const [page, setPage] = React.useState(1);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewedBookings, setReviewedBookings] = useState(new Set());
  const [bookingReviews, setBookingReviews] = useState({});

  useEffect(() => {
    dispatch(getUserBookings({ page, limit: 100 }));
  }, [page, dispatch]);

  // Check review eligibility for completed bookings
  useEffect(() => {
    const checkReviewStatus = async () => {
      const completedBookings = bookings?.filter(b => b.status === "Completed") || [];
      for (const booking of completedBookings) {
        const result = await dispatch(canReviewBooking(booking.id));
        if (result.payload?.data?.canReview === false && 
            result.payload?.data?.reason === "Already reviewed") {
          setReviewedBookings(prev => new Set([...prev, booking.id]));

          const reviewResult = await dispatch(getBookingReview(booking.id));
          if (reviewResult.payload?.data) {
            setBookingReviews((prev) => ({
              ...prev,
              [booking.id]: reviewResult.payload.data,
            }));
          }
        }
      }
    };
    if (bookings?.length > 0) {
      checkReviewStatus();
    }
  }, [bookings, dispatch]);

  // Filter bookings based on the filter prop
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (filter === "all") return bookings;
    return bookings.filter(b => b.status.toLowerCase() === filter.toLowerCase());
  }, [bookings, filter]);

  const toggleExpand = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBookingForReview(booking);
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    if (selectedBookingForReview?.id) {
      setReviewedBookings(prev => new Set([...prev, selectedBookingForReview.id]));
      dispatch(getBookingReview(selectedBookingForReview.id)).then((result) => {
        if (result.payload?.data) {
          setBookingReviews((prev) => ({
            ...prev,
            [selectedBookingForReview.id]: result.payload.data,
          }));
        }
      });
    }
    setReviewModalOpen(false);
    setSelectedBookingForReview(null);
  };

  const renderReviewStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const result = await dispatch(cancelBooking(bookingId));
      if (result.payload?.status) {
        SucessToast({ message: "Booking cancelled successfully" });
        dispatch(getUserBookings({ page, limit: 10 }));
      } else {
        ErrorToast({ message: result.payload?.message || "Failed to cancel booking" });
      }
    }
  };

  const handleCompletePayment = async (booking, method = "eSewa") => {
    // Check if booking start date has passed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(booking.startDate);
    startDate.setHours(0, 0, 0, 0);

    if (startDate < today) {
      ErrorToast({ message: "Cannot complete payment - booking start date has already passed" });
      return;
    }

    try {
      const result = await dispatch(initiatePayment({ bookingId: booking.id, method }));
      
      console.log("Payment initiation result:", result.payload);
      
      if (result.payload?.status && result.payload?.data?.paymentGateway) {
        const gateway = result.payload.data.paymentGateway;
        
        if (method === "eSewa") {
          // Build and submit eSewa form
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = gateway.esewaUrl;
          
          // Add all required fields
          const fields = {
            amount: gateway.amount,
            tax_amount: gateway.tax_amount,
            product_service_charge: gateway.product_service_charge,
            product_delivery_charge: gateway.product_delivery_charge,
            total_amount: gateway.total_amount,
            transaction_uuid: gateway.transaction_uuid,
            product_code: gateway.product_code,
            success_url: gateway.success_url,
            failure_url: gateway.failure_url,
            signed_field_names: gateway.signed_field_names,
            signature: gateway.signature,
          };
          
          Object.entries(fields).forEach(([name, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
          });
          
          document.body.appendChild(form);
          form.submit();
        } else if (method === "Khalti") {
          // Khalti payment - backend has already initiated payment with Khalti API
          // Just redirect to the payment URL returned by backend
          if (gateway.payment_url) {
            console.log("Redirecting to Khalti payment:", gateway.payment_url);
            window.location.href = gateway.payment_url;
          } else {
            console.error("No payment_url in Khalti response:", gateway);
            ErrorToast({ message: "Failed to initiate Khalti payment - no payment URL" });
          }
        }
      } else if (result.payload?.data?.paymentUrl) {
        // Direct URL redirect
        window.location.href = result.payload.data.paymentUrl;
      } else {
        ErrorToast({ message: result.payload?.message || "Failed to initiate payment" });
      }
    } catch (error) {
      console.error("Payment error:", error);
      ErrorToast({ message: "Failed to initiate payment" });
    }
  };

  // Helper to check if booking date has expired
  const isBookingExpired = (booking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(booking.startDate);
    startDate.setHours(0, 0, 0, 0);
    return startDate < today;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "Cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "Pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  if (loading && !bookings.length) {
    return <div className="text-center py-8">Loading bookings...</div>;
  }

  if (!filteredBookings.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          {filter === "all" ? "No Bookings Yet" : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Bookings`}
        </h3>
        <p className="text-gray-500">
          {filter === "all" 
            ? "Start by booking your first vehicle today!" 
            : `You don't have any ${filter.toLowerCase()} bookings.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {filteredBookings.map((booking) => (
        <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
          {/* Vehicle Image Section */}
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 relative">
              {booking.vehicle?.images && booking.vehicle.images.length > 0 ? (
                <img
                  src={booking.vehicle.images[0]}
                  alt={booking.vehicle.name}
                  className="w-full h-56 md:h-full object-cover"
                />
              ) : (
                <div className="w-full h-56 md:h-full bg-gray-100 flex items-center justify-center">
                  <Car className="w-16 h-16 text-gray-300" />
                </div>
              )}
              {/* Status Badge on Image */}
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                {booking.status}
              </div>
              {/* Booking ID Badge */}
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-xs rounded-md">
                Booking #{booking.id}
              </div>
            </div>

            <div className="md:w-2/3 p-6">
              {/* Header with Vehicle Info */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {booking.vehicle?.name || 'Vehicle'}
                  </h3>
                  <p className="text-gray-600">
                    {booking.vehicle?.make} {booking.vehicle?.model} {booking.vehicle?.year ? `(${booking.vehicle.year})` : ''}
                  </p>
                  {booking.vehicle?.category && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {booking.vehicle.category}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Booked on</p>
                  <p className="font-medium text-sm">{new Date(booking.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Quick Vehicle Specs */}
              <div className="flex flex-wrap gap-3 mb-4">
                {booking.vehicle?.color && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    <Palette className="w-4 h-4" />
                    <span>{booking.vehicle.color}</span>
                  </div>
                )}
                {booking.vehicle?.fuelType && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    <Fuel className="w-4 h-4" />
                    <span>{booking.vehicle.fuelType}</span>
                  </div>
                )}
                {booking.vehicle?.transmission && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    <Settings className="w-4 h-4" />
                    <span>{booking.vehicle.transmission}</span>
                  </div>
                )}
                {booking.vehicle?.mileage && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    <Gauge className="w-4 h-4" />
                    <span>{booking.vehicle.mileage.toLocaleString()} km</span>
                  </div>
                )}
              </div>

            {/* Booking Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-purple/5 rounded-lg p-3 border border-purple/10">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-purple" /> Start Date
                </p>
                <p className="font-semibold text-sm">
                  {new Date(booking.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>

              <div className="bg-blue/5 rounded-lg p-3 border border-blue/10">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-blue" /> End Date
                </p>
                <p className="font-semibold text-sm">
                  {new Date(booking.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>

              <div className="bg-amber/5 rounded-lg p-3 border border-amber/10">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber" /> Duration
                </p>
                <p className="font-semibold text-sm">{booking.numberOfDays} {booking.numberOfDays === 1 ? 'day' : 'days'}</p>
              </div>

              <div className="bg-green/5 rounded-lg p-3 border border-green/10">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-green" /> Pickup
                </p>
                <p className="font-semibold text-sm truncate" title={booking.location}>{booking.location}</p>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 text-sm">Daily Rate:</span>
                <span className="font-medium">Rs. {Number(booking.dailyRate).toLocaleString('en-IN')}/day</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 text-sm">Subtotal ({booking.numberOfDays} days):</span>
                <span className="font-medium">Rs. {Number(booking.totalAmount).toLocaleString('en-IN')}</span>
              </div>
              {booking.discount > 0 && (
                <div className="flex justify-between items-center mb-2 text-green">
                  <span className="text-sm">Discount:</span>
                  <span>-Rs. {Number(booking.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="font-bold">Total Amount:</span>
                <span className="text-xl font-bold text-green">
                  Rs. {Number(booking.finalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="flex items-center justify-between p-3 bg-blue/5 rounded-lg border border-blue/10 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue" />
                <span className="text-sm font-medium">Payment Status:</span>
              </div>
              <Badge className={`${booking.paymentStatus === 'Completed' ? 'bg-green' : booking.paymentStatus === 'Pending' ? 'bg-amber' : 'bg-red'} text-white`}>
                {booking.paymentStatus}
              </Badge>
            </div>

            {/* Booking Notes */}
            {booking.notes && (
              <div className="p-3 bg-amber/5 rounded-lg border border-amber/10 mb-4">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-amber" /> Your Notes:
                </p>
                <p className="text-sm text-gray-700">{booking.notes}</p>
              </div>
            )}

            {booking.adminRemarks && (
              <div className="p-3 bg-red/5 rounded-lg border border-red/10 mb-4">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-red" /> Admin Remark:
                </p>
                <p className="text-sm text-gray-700">{booking.adminRemarks}</p>
              </div>
            )}

            {/* Expand/Collapse Vehicle Details */}
            <button
              onClick={() => toggleExpand(booking.id)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-purple hover:bg-purple/5 rounded-lg transition-colors mb-4"
            >
              {expandedBooking === booking.id ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Vehicle Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Full Vehicle Details
                </>
              )}
            </button>

            {/* Expanded Vehicle Details */}
            {expandedBooking === booking.id && (
              <div className="border-t pt-4 mb-4 space-y-4 animate-in slide-in-from-top-2">
                {/* Vehicle Images Gallery */}
                {booking.vehicle?.images && booking.vehicle.images.length > 1 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Vehicle Gallery</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {booking.vehicle.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${booking.vehicle.name} - ${idx + 1}`}
                          className="w-24 h-24 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Vehicle Specifications */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Vehicle Specifications</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Make</p>
                      <p className="font-medium">{booking.vehicle?.make || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Model</p>
                      <p className="font-medium">{booking.vehicle?.model || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Year</p>
                      <p className="font-medium">{booking.vehicle?.year || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Color</p>
                      <p className="font-medium">{booking.vehicle?.color || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Fuel Type</p>
                      <p className="font-medium">{booking.vehicle?.fuelType || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Transmission</p>
                      <p className="font-medium">{booking.vehicle?.transmission || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Mileage</p>
                      <p className="font-medium">{booking.vehicle?.mileage ? `${booking.vehicle.mileage.toLocaleString()} km` : 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Condition</p>
                      <p className="font-medium">{booking.vehicle?.condition || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Vehicle Location</p>
                      <p className="font-medium">{booking.vehicle?.location || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Description */}
                {booking.vehicle?.description && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Vehicle Description</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {booking.vehicle.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {/* View Vehicle Button - Always visible */}
              <Button
                onClick={() => navigate(`/vehicle/${booking.vehicle?.id}`)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Vehicle Page
              </Button>

              {booking.status === "Pending" && (
                <>
                  {isBookingExpired(booking) ? (
                    <div className="flex-1 text-center text-amber py-2 font-medium bg-amber/10 rounded-lg border border-amber/20">
                      ⚠ Booking Expired - Start date has passed
                    </div>
                  ) : (
                    <div className="flex-1 flex gap-2">
                      <Button 
                        onClick={() => handleCompletePayment(booking, "eSewa")}
                        className="flex-1 bg-green text-white hover:bg-green/90"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay with eSewa
                      </Button>
                      <Button 
                        onClick={() => handleCompletePayment(booking, "Khalti")}
                        className="flex-1 bg-purple text-white hover:bg-purple/90"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay with Khalti
                      </Button>
                    </div>
                  )}
                  <Button
                    onClick={() => handleCancelBooking(booking.id)}
                    variant="outline"
                    className="border-red text-red hover:bg-red/10"
                  >
                    Cancel Booking
                  </Button>
                </>
              )}
              {booking.status === "Confirmed" && (
                <div className="flex-1 text-center text-green py-2 font-medium bg-green/10 rounded-lg">
                  ✓ Booking Confirmed - Ready for pickup
                </div>
              )}
              {booking.status === "Completed" && (
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 text-center text-blue py-2 font-medium bg-blue/10 rounded-lg">
                    ✓ Booking Completed
                  </div>
                  {reviewedBookings.has(booking.id) ? (
                    <Button
                      onClick={() => handleOpenReviewModal(booking)}
                      variant="outline"
                      className="border-green text-green hover:bg-green/10"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Review
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleOpenReviewModal(booking)}
                      className="bg-purple text-white hover:bg-purple/90"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Write Review
                    </Button>
                  )}
                </div>
              )}
              {booking.status === "Cancelled" && (
                <div className="flex-1 text-center text-gray-500 py-2 bg-gray-100 rounded-lg">
                  <p>This booking has been cancelled</p>
                  {booking.adminRemarks && (
                    <p className="text-sm text-red mt-1">Remark: {booking.adminRemarks}</p>
                  )}
                </div>
              )}
            </div>

            {bookingReviews[booking.id] && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Your Feedback</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted on {new Date(bookingReviews[booking.id].createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {renderReviewStars(bookingReviews[booking.id].rating || 0)}
                </div>

                {bookingReviews[booking.id].title && (
                  <p className="font-medium text-gray-800 mb-1">
                    {bookingReviews[booking.id].title}
                  </p>
                )}

                {bookingReviews[booking.id].comment && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {bookingReviews[booking.id].comment}
                  </p>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <Button
                  key={p}
                  onClick={() => setPage(p)}
                  variant={page === p ? "default" : "outline"}
                >
                  {p}
                </Button>
              )
            )}
          </div>
          <Button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page === pagination.totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedBookingForReview && (
        <ReviewForm
          bookingId={selectedBookingForReview.id}
          vehicleInfo={selectedBookingForReview.vehicle}
          existingReview={bookingReviews[selectedBookingForReview.id] || null}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedBookingForReview(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default BookingHistory;
