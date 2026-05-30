import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Star, User, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { getVehicleReviews } from "../../rtk/slice/reviewSlice";
import { Button } from "../ui/button";

const VehicleReviews = ({ vehicleId }) => {
  const dispatch = useDispatch();
  const { vehicleReviews, reviewSummary, loading, pagination } = useSelector(
    (state) => state.review
  );
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (vehicleId) {
      dispatch(getVehicleReviews({ vehicleId, page, limit: showAll ? 20 : 5 }));
    }
  }, [dispatch, vehicleId, page, showAll]);

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  if (loading && vehicleReviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Reviews</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg" />
          <div className="h-32 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-purple" />
        Customer Reviews
      </h2>

      {reviewSummary && reviewSummary.totalReviews > 0 ? (
        <>
          {/* Summary Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Average Rating */}
              <div className="text-center md:border-r md:pr-6">
                <div className="text-5xl font-bold text-gray-800">
                  {reviewSummary.averageRating}
                </div>
                <div className="flex justify-center mt-2">
                  {renderStars(Math.round(reviewSummary.averageRating))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Based on {reviewSummary.totalReviews} review
                  {reviewSummary.totalReviews !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm w-12 text-gray-600 flex items-center gap-1">
                      {rating} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </span>
                    {renderRatingBar(
                      reviewSummary.ratingDistribution[rating],
                      reviewSummary.totalReviews
                    )}
                    <span className="text-sm w-8 text-gray-500">
                      {reviewSummary.ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {vehicleReviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {review.reviewer?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {review.title && (
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {review.title}
                  </h4>
                )}

                {review.comment && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Show More / Less */}
          {reviewSummary.totalReviews > 5 && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="gap-2"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All {reviewSummary.totalReviews} Reviews
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Pagination for all reviews */}
          {showAll && pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm text-gray-600">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page === pagination.totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600 mb-1">
            No Reviews Yet
          </h3>
          <p className="text-sm text-gray-500">
            Be the first to review this vehicle after your rental!
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleReviews;
