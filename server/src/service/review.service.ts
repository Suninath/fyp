import { Request } from "express";
import AppDataSource from "../config/db.config";
import { ReviewEntity } from "../entities/review.entity";
import { BookingEntity, BOOKING_STATUS } from "../entities/booking.entity";
import { VehicleEntity } from "../entities/vehicle.entity";
import { UserEntity } from "../entities/user.entity";

const reviewRepository = AppDataSource.getRepository(ReviewEntity);
const bookingRepository = AppDataSource.getRepository(BookingEntity);
const vehicleRepository = AppDataSource.getRepository(VehicleEntity);

const reviewService = {
  /**
   * Create a review for a completed booking
   */
  async createReview(req: Request) {
    try {
      const userId = (req as any).user?.id;
      const { bookingId, rating, comment, title } = req.body;

      if (!bookingId || !rating) {
        return {
          status: false,
          code: 400,
          message: "Booking ID and rating are required",
        };
      }

      if (rating < 1 || rating > 5) {
        return {
          status: false,
          code: 400,
          message: "Rating must be between 1 and 5",
        };
      }

      // Find the booking
      const booking = await bookingRepository.findOne({
        where: { id: bookingId, user: { id: userId } },
        relations: ["vehicle", "user"],
      });

      if (!booking) {
        return {
          status: false,
          code: 404,
          message: "Booking not found or you don't have access to it",
        };
      }

      // Check if booking is completed
      if (booking.status !== BOOKING_STATUS.COMPLETED) {
        return {
          status: false,
          code: 400,
          message: "You can only review completed bookings",
        };
      }

      // Check if review already exists for this booking
      const existingReview = await reviewRepository.findOne({
        where: { booking: { id: bookingId } },
      });

      if (existingReview) {
        return {
          status: false,
          code: 400,
          message: "You have already reviewed this booking",
        };
      }

      // Create the review
      const review = reviewRepository.create({
        reviewer: { id: userId } as UserEntity,
        reviewerId: userId,
        vehicle: { id: booking.vehicle.id } as VehicleEntity,
        vehicleId: booking.vehicle.id,
        booking: { id: bookingId } as BookingEntity,
        bookingId: bookingId,
        rating,
        comment: comment || null,
        title: title || null,
      });

      const savedReview = await reviewRepository.save(review);

      // Fetch full review with relations
      const fullReview = await reviewRepository.findOne({
        where: { id: savedReview.id },
        relations: ["reviewer", "vehicle", "booking"],
      });

      return {
        status: true,
        code: 201,
        message: "Review submitted successfully",
        data: fullReview,
      };
    } catch (error) {
      console.error("Create review error:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  /**
   * Get all reviews for a vehicle
   */
  async getVehicleReviews(req: Request) {
    try {
      const { vehicleId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const pageNum = Number(page);
      const limitNum = Number(limit);

      const vehicle = await vehicleRepository.findOne({
        where: { id: parseInt(vehicleId) },
      });

      if (!vehicle) {
        return {
          status: false,
          code: 404,
          message: "Vehicle not found",
        };
      }

      const [reviews, total] = await reviewRepository.findAndCount({
        where: { vehicle: { id: parseInt(vehicleId) } },
        relations: ["reviewer"],
        order: { createdAt: "DESC" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      });

      // Calculate average rating
      const allReviews = await reviewRepository.find({
        where: { vehicle: { id: parseInt(vehicleId) } },
        select: ["rating"],
      });

      const averageRating =
        allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          : 0;

      // Rating distribution
      const ratingDistribution = {
        1: allReviews.filter((r) => r.rating === 1).length,
        2: allReviews.filter((r) => r.rating === 2).length,
        3: allReviews.filter((r) => r.rating === 3).length,
        4: allReviews.filter((r) => r.rating === 4).length,
        5: allReviews.filter((r) => r.rating === 5).length,
      };

      return {
        status: true,
        code: 200,
        message: "Reviews retrieved successfully",
        data: {
          reviews: reviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            reviewer: {
              id: review.reviewer?.id,
              name: review.reviewer?.name,
            },
            createdAt: review.createdAt,
          })),
          summary: {
            totalReviews: total,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution,
          },
        },
        pagination: {
          currentPage: pageNum,
          perpage: limitNum,
          totalPages: Math.ceil(total / limitNum),
          count: total,
        },
      };
    } catch (error) {
      console.error("Get vehicle reviews error:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  /**
   * Get review for a specific booking (if exists)
   */
  async getBookingReview(req: Request) {
    try {
      const userId = (req as any).user?.id;
      const { bookingId } = req.params;

      const booking = await bookingRepository.findOne({
        where: { id: parseInt(bookingId), user: { id: userId } },
      });

      if (!booking) {
        return {
          status: false,
          code: 404,
          message: "Booking not found",
        };
      }

      const review = await reviewRepository.findOne({
        where: { booking: { id: parseInt(bookingId) } },
        relations: ["reviewer", "vehicle"],
      });

      return {
        status: true,
        code: 200,
        message: review ? "Review found" : "No review for this booking yet",
        data: review
          ? {
              id: review.id,
              rating: review.rating,
              title: review.title,
              comment: review.comment,
              createdAt: review.createdAt,
            }
          : null,
      };
    } catch (error) {
      console.error("Get booking review error:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  /**
   * Update a review (user can update their own review)
   */
  async updateReview(req: Request) {
    try {
      const userId = (req as any).user?.id;
      const { reviewId } = req.params;
      const { rating, comment, title } = req.body;

      const review = await reviewRepository.findOne({
        where: { id: parseInt(reviewId), reviewer: { id: userId } },
      });

      if (!review) {
        return {
          status: false,
          code: 404,
          message: "Review not found or you don't have permission to update it",
        };
      }

      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return {
            status: false,
            code: 400,
            message: "Rating must be between 1 and 5",
          };
        }
        review.rating = rating;
      }

      if (comment !== undefined) {
        review.comment = comment;
      }

      if (title !== undefined) {
        review.title = title;
      }

      await reviewRepository.save(review);

      return {
        status: true,
        code: 200,
        message: "Review updated successfully",
        data: review,
      };
    } catch (error) {
      console.error("Update review error:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  /**
   * Delete a review (user can delete their own review)
   */
  async deleteReview(req: Request) {
    try {
      const userId = (req as any).user?.id;
      const { reviewId } = req.params;

      const review = await reviewRepository.findOne({
        where: { id: parseInt(reviewId), reviewer: { id: userId } },
      });

      if (!review) {
        return {
          status: false,
          code: 404,
          message: "Review not found or you don't have permission to delete it",
        };
      }

      await reviewRepository.remove(review);

      return {
        status: true,
        code: 200,
        message: "Review deleted successfully",
      };
    } catch (error) {
      console.error("Delete review error:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  /**
   * Get user's reviews
   */
  async getUserReviews(req: Request) {
    try {
      const userId = (req as any).user?.id;
      const { page = 1, limit = 10 } = req.query;
      const pageNum = Number(page);
      const limitNum = Number(limit);

      const [reviews, total] = await reviewRepository.findAndCount({
        where: { reviewer: { id: userId } },
        relations: ["vehicle", "booking"],
        order: { createdAt: "DESC" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      });

      return {
        status: true,
        code: 200,
        message: "Reviews retrieved successfully",
        data: reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          vehicle: {
            id: review.vehicle?.id,
            name: review.vehicle?.name,
            make: review.vehicle?.make,
            model: review.vehicle?.model,
            images: review.vehicle?.images,
          },
          bookingId: review.bookingId,
          createdAt: review.createdAt,
        })),
        pagination: {
          currentPage: pageNum,
          perpage: limitNum,
          totalPages: Math.ceil(total / limitNum),
          count: total,
        },
      };
    } catch (error) {
      console.error("Get user reviews error:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  /**
   * Check if user can review a booking
   */
  async canReviewBooking(req: Request) {
    try {
      const userId = (req as any).user?.id;
      const { bookingId } = req.params;

      const booking = await bookingRepository.findOne({
        where: { id: parseInt(bookingId), user: { id: userId } },
        relations: ["vehicle"],
      });

      if (!booking) {
        return {
          status: true,
          code: 200,
          data: { canReview: false, reason: "Booking not found" },
        };
      }

      if (booking.status !== BOOKING_STATUS.COMPLETED) {
        return {
          status: true,
          code: 200,
          data: { canReview: false, reason: "Booking is not completed yet" },
        };
      }

      const existingReview = await reviewRepository.findOne({
        where: { booking: { id: parseInt(bookingId) } },
      });

      if (existingReview) {
        return {
          status: true,
          code: 200,
          data: {
            canReview: false,
            reason: "Already reviewed",
            reviewId: existingReview.id,
          },
        };
      }

      return {
        status: true,
        code: 200,
        data: {
          canReview: true,
          booking: {
            id: booking.id,
            vehicle: {
              id: booking.vehicle.id,
              name: booking.vehicle.name,
              make: booking.vehicle.make,
              model: booking.vehicle.model,
              images: booking.vehicle.images,
            },
            startDate: booking.startDate,
            endDate: booking.endDate,
          },
        },
      };
    } catch (error) {
      console.error("Can review booking error:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },
};

export default reviewService;
