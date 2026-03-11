import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Star, X, Send, Loader2 } from "lucide-react";
import { createReview, updateReview, clearReviewState } from "../../rtk/slice/reviewSlice";
import { Button } from "../ui/button";
import { SucessToast, ErrorToast } from "../common/toast";

const ReviewForm = ({ 
  bookingId, 
  vehicleInfo, 
  existingReview = null, 
  onClose, 
  onSuccess 
}) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.review);
  
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [comment, setComment] = useState(existingReview?.comment || "");

  useEffect(() => {
    return () => {
      dispatch(clearReviewState());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      ErrorToast({ message: "Please select a rating" });
      return;
    }

    try {
      let result;
      if (existingReview) {
        result = await dispatch(
          updateReview({
            reviewId: existingReview.id,
            rating,
            comment: comment.trim() || null,
            title: title.trim() || null,
          })
        );
      } else {
        result = await dispatch(
          createReview({
            bookingId,
            rating,
            comment: comment.trim() || null,
            title: title.trim() || null,
          })
        );
      }

      if (result.payload?.status) {
        SucessToast({ 
          message: existingReview 
            ? "Review updated successfully!" 
            : "Thank you for your review!" 
        });
        onSuccess?.();
        onClose?.();
      } else {
        ErrorToast({ 
          message: result.payload?.message || "Failed to submit review" 
        });
      }
    } catch (error) {
      ErrorToast({ message: "An error occurred while submitting the review" });
    }
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Select rating";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {existingReview ? "Edit Your Review" : "Write a Review"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Vehicle Info */}
        {vehicleInfo && (
          <div className="px-6 py-4 bg-gray-50 border-b flex items-center gap-4">
            {vehicleInfo.images?.[0] && (
              <img
                src={vehicleInfo.images[0]}
                alt={vehicleInfo.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-800">{vehicleInfo.name}</h3>
              <p className="text-sm text-gray-600">
                {vehicleInfo.make} {vehicleInfo.model}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating *
            </label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {getRatingLabel(hoverRating || rating)}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this vehicle..."
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent outline-none transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 characters</p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple text-white hover:bg-purple/90"
              disabled={loading || rating === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {existingReview ? "Update Review" : "Submit Review"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
