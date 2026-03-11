import { Repository } from "typeorm";
import AppDataSource from "../config/db.config";
import { UserEntity } from "../entities/user.entity";
import { AuthEntity } from "../entities/auth.entity";
import { VehicleEntity } from "../entities/vehicle.entity";
import { DocumentEntity, VERIFICATION_STATUS } from "../entities/document.entity";
import { BookingEntity, BOOKING_STATUS } from "../entities/booking.entity";
import { USER_ROLE } from "../constant/enums";

const userRepository = AppDataSource.getRepository(UserEntity);
const authRepository = AppDataSource.getRepository(AuthEntity);
const vehicleRepository = AppDataSource.getRepository(VehicleEntity);
const documentRepository = AppDataSource.getRepository(DocumentEntity);
const bookingRepository = AppDataSource.getRepository(BookingEntity);

const adminService = {
  async getAllUsers({ search, page = 1, limit = 10 }: { search?: string; page?: number; limit?: number } = {}) {
    try {
      const queryBuilder = userRepository.createQueryBuilder("user")
        .leftJoinAndSelect("user.auth", "auth")
        .where("auth.role = :role", { role: USER_ROLE.USER });

      // Apply search filter
      if (search) {
        queryBuilder.andWhere("(user.name ILIKE :search OR auth.email ILIKE :search)", 
          { search: `%${search}%` });
      }

      // Get total count for pagination
      const total = await queryBuilder.getCount();

      // Apply pagination
      const users = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return {
        status: true,
        code: 200,
        data: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.auth.email,
          phoneNumber: user.phoneNumber,
          role: user.auth.role,
          verified: user.auth.verified,
          isBlocked: user.auth.isBlocked,
          createdAt: user.createdAt
        })),
        pagination: {
          currentPage: page,
          perpage: limit,
          totalPages: Math.ceil(total / limit),
          count: total
        }
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async blockUser(userId: string) {
    try {
      const user = await userRepository.findOne({
        where: { id: parseInt(userId) },
        relations: ["auth"]
      });

      if (!user) {
        return {
          status: false,
          code: 404,
          message: "User not found"
        };
      }

      // Block the user by setting isBlocked to true
      user.auth.isBlocked = true;
      await authRepository.save(user.auth);

      return {
        status: true,
        code: 200,
        message: "User blocked successfully"
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async unblockUser(userId: string) {
    try {
      const user = await userRepository.findOne({
        where: { id: parseInt(userId) },
        relations: ["auth"]
      });

      if (!user) {
        return {
          status: false,
          code: 404,
          message: "User not found"
        };
      }

      user.auth.isBlocked = false;
      await authRepository.save(user.auth);

      return {
        status: true,
        code: 200,
        message: "User unblocked successfully"
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async getDashboardStats() {
    try {
      const totalUsers = await userRepository.count({
        where: {
          auth: {
            role: USER_ROLE.USER
          }
        }
      });

      // User verification stats
      const verifiedUsers = await authRepository.count({
        where: {
          role: USER_ROLE.USER,
          accountVerified: true
        }
      });

      const pendingVerificationUsers = await authRepository.count({
        where: {
          role: USER_ROLE.USER,
          accountVerified: false,
          verificationRejected: false
        }
      });

      const rejectedVerificationUsers = await authRepository.count({
        where: {
          role: USER_ROLE.USER,
          verificationRejected: true
        }
      });

      // Document stats
      const pendingDocuments = await documentRepository.count({
        where: {
          verificationStatus: VERIFICATION_STATUS.PENDING
        }
      });

      const approvedDocuments = await documentRepository.count({
        where: {
          verificationStatus: VERIFICATION_STATUS.APPROVED
        }
      });

      const rejectedDocuments = await documentRepository.count({
        where: {
          verificationStatus: VERIFICATION_STATUS.REJECTED
        }
      });

      const totalVehicles = await vehicleRepository.count();

      // Booking stats
      const totalBookings = await bookingRepository.count();
      
      const pendingBookings = await bookingRepository.count({
        where: {
          status: BOOKING_STATUS.PENDING
        }
      });

      const confirmedBookings = await bookingRepository.count({
        where: {
          status: BOOKING_STATUS.CONFIRMED
        }
      });

      const cancelledBookings = await bookingRepository.count({
        where: {
          status: BOOKING_STATUS.CANCELLED
        }
      });

      const completedBookings = await bookingRepository.count({
        where: {
          status: BOOKING_STATUS.COMPLETED
        }
      });

      // For revenue, we'd need to implement actual transaction tracking
      const totalRevenue = 0; // Placeholder

      return {
        status: true,
        code: 200,
        data: {
          totalUsers,
          verifiedUsers,
          pendingVerificationUsers,
          rejectedVerificationUsers,
          pendingDocuments,
          approvedDocuments,
          rejectedDocuments,
          totalVehicles,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          cancelledBookings,
          completedBookings,
          totalRevenue
        }
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async getAllVehicles({ search, brand, color, page = 1, limit = 10 }: { search?: string; brand?: string; color?: string; page?: number; limit?: number }) {
    try {
      const queryBuilder = vehicleRepository.createQueryBuilder("vehicle")
        .leftJoinAndSelect("vehicle.uploader", "uploader")
        .leftJoin("uploader.auth", "uploaderAuth")
        .addSelect(["uploaderAuth.email"]);

      // Apply filters
      if (search) {
        queryBuilder.andWhere("(vehicle.name ILIKE :search OR vehicle.make ILIKE :search OR vehicle.model ILIKE :search)", 
          { search: `%${search}%` });
      }
      if (brand) {
        queryBuilder.andWhere("vehicle.make ILIKE :brand", { brand: `%${brand}%` });
      }
      if (color) {
        queryBuilder.andWhere("vehicle.color ILIKE :color", { color: `%${color}%` });
      }

      // Get total count for pagination
      const total = await queryBuilder.getCount();

      // Apply pagination
      const vehicles = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return {
        status: true,
        code: 200,
        data: vehicles.map(vehicle => ({
          id: vehicle.id,
          name: vehicle.name,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          price: vehicle.price,
          mileage: vehicle.mileage,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          color: vehicle.color,
          location: vehicle.location,
          condition: vehicle.condition,
          description: vehicle.description,
          images: vehicle.images,
          category: vehicle.category,
          isBlocked: vehicle.isBlocked,
          createdAt: vehicle.createdAt,
          uploader: vehicle.uploader ? {
            id: vehicle.uploader.id,
            name: vehicle.uploader.name,
            email: (vehicle.uploader as any).auth?.email
          } : null
        })),
        pagination: {
          currentPage: page,
          perpage: limit,
          totalPages: Math.ceil(total / limit),
          count: total
        }
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async blockVehicle(vehicleId: string) {
    try {
      const vehicle = await vehicleRepository.findOne({
        where: { id: parseInt(vehicleId) }
      });

      if (!vehicle) {
        return {
          status: false,
          code: 404,
          message: "Vehicle not found"
        };
      }

      vehicle.isBlocked = true;
      await vehicleRepository.save(vehicle);

      return {
        status: true,
        code: 200,
        message: "Vehicle blocked successfully"
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async unblockVehicle(vehicleId: string) {
    try {
      const vehicle = await vehicleRepository.findOne({
        where: { id: parseInt(vehicleId) }
      });

      if (!vehicle) {
        return {
          status: false,
          code: 404,
          message: "Vehicle not found"
        };
      }

      vehicle.isBlocked = false;
      await vehicleRepository.save(vehicle);

      return {
        status: true,
        code: 200,
        message: "Vehicle unblocked successfully"
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async deleteVehicle(vehicleId: string) {
    try {
      const vehicle = await vehicleRepository.findOne({
        where: { id: parseInt(vehicleId) }
      });

      if (!vehicle) {
        return {
          status: false,
          code: 404,
          message: "Vehicle not found"
        };
      }

      await vehicleRepository.remove(vehicle);

      return {
        status: true,
        code: 200,
        message: "Vehicle deleted successfully"
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async updateUser(userId: string, updateData: any) {
    try {
      const user = await userRepository.findOne({
        where: { id: parseInt(userId) },
        relations: ["auth"]
      });

      if (!user) {
        return {
          status: false,
          code: 404,
          message: "User not found"
        };
      }

      // Update user fields
      if (updateData.name) user.name = updateData.name;
      if (updateData.phoneNumber) user.phoneNumber = updateData.phoneNumber;
      if (updateData.email) user.auth.email = updateData.email;

      await userRepository.save(user);
      await authRepository.save(user.auth);

      return {
        status: true,
        code: 200,
        message: "User updated successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.auth.email,
          phoneNumber: user.phoneNumber
        }
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async deleteUser(userId: string) {
    try {
      const user = await userRepository.findOne({
        where: { id: parseInt(userId) },
        relations: ["auth"]
      });

      if (!user) {
        return {
          status: false,
          code: 404,
          message: "User not found"
        };
      }

      // Remove auth first (due to foreign key constraint)
      await authRepository.remove(user.auth);
      await userRepository.remove(user);

      return {
        status: true,
        code: 200,
        message: "User deleted successfully"
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  // Get users pending verification (with their documents)
  async getPendingVerificationUsers({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) {
    try {
      const queryBuilder = userRepository.createQueryBuilder("user")
        .leftJoinAndSelect("user.auth", "auth")
        .leftJoinAndSelect("user.documents", "documents")
        .where("auth.role = :role", { role: USER_ROLE.USER })
        .andWhere("auth.accountVerified = :verified", { verified: false });

      // Get total count for pagination
      const total = await queryBuilder.getCount();

      // Apply pagination
      const users = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy("user.createdAt", "DESC")
        .getMany();

      return {
        status: true,
        code: 200,
        data: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.auth.email,
          phoneNumber: user.phoneNumber,
          accountVerified: user.auth.accountVerified,
          verificationRejected: user.auth.verificationRejected,
          rejectionReason: user.auth.rejectionReason,
          createdAt: user.createdAt,
          documents: user.documents?.map(doc => ({
            id: doc.id,
            documentType: doc.documentType,
            documentUrl: doc.documentUrl,
            verificationStatus: doc.verificationStatus,
            rejectionReason: doc.rejectionReason
          })) || []
        })),
        pagination: {
          currentPage: page,
          perpage: limit,
          totalPages: Math.ceil(total / limit),
          count: total
        }
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  // Get users by verification status
  async getUsersByVerificationStatus({ 
    status, 
    search, 
    page = 1, 
    limit = 10 
  }: { 
    status: 'pending' | 'verified' | 'rejected'; 
    search?: string; 
    page?: number; 
    limit?: number 
  }) {
    try {
      const queryBuilder = userRepository.createQueryBuilder("user")
        .leftJoinAndSelect("user.auth", "auth")
        .leftJoinAndSelect("user.documents", "documents")
        .where("auth.role = :role", { role: USER_ROLE.USER });

      // Apply verification status filter
      switch (status) {
        case 'verified':
          queryBuilder.andWhere("auth.accountVerified = :verified", { verified: true });
          break;
        case 'pending':
          queryBuilder.andWhere("auth.accountVerified = :verified", { verified: false })
            .andWhere("auth.verificationRejected = :rejected", { rejected: false });
          break;
        case 'rejected':
          queryBuilder.andWhere("auth.verificationRejected = :rejected", { rejected: true });
          break;
      }

      // Apply search filter
      if (search) {
        queryBuilder.andWhere(
          "(user.name ILIKE :search OR auth.email ILIKE :search OR user.phoneNumber ILIKE :search)",
          { search: `%${search}%` }
        );
      }

      // Get total count for pagination
      const total = await queryBuilder.getCount();

      // Apply pagination
      const users = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy("user.createdAt", "DESC")
        .getMany();

      return {
        status: true,
        code: 200,
        data: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.auth.email,
          phoneNumber: user.phoneNumber,
          accountVerified: user.auth.accountVerified,
          verificationRejected: user.auth.verificationRejected,
          rejectionReason: user.auth.rejectionReason,
          createdAt: user.createdAt,
          documents: user.documents?.map(doc => ({
            id: doc.id,
            documentType: doc.documentType,
            documentUrl: doc.documentUrl,
            verificationStatus: doc.verificationStatus,
            rejectionReason: doc.rejectionReason
          })) || []
        })),
        pagination: {
          currentPage: page,
          perpage: limit,
          totalPages: Math.ceil(total / limit),
          count: total
        }
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  // Manually verify user account
  async verifyUserAccount(userId: string, approved: boolean, rejectionReason?: string) {
    try {
      const user = await userRepository.findOne({
        where: { id: parseInt(userId) },
        relations: ["auth", "documents"]
      });

      if (!user) {
        return {
          status: false,
          code: 404,
          message: "User not found"
        };
      }

      if (!user.auth) {
        return {
          status: false,
          code: 404,
          message: "User auth record not found"
        };
      }

      if (approved) {
        user.auth.accountVerified = true;
        user.auth.verificationRejected = false;
        user.auth.rejectionReason = null as any;

        // Also approve any pending documents when account is verified
        if (user.documents && user.documents.length > 0) {
          const pendingDocs = user.documents.filter(
            doc => doc.verificationStatus === VERIFICATION_STATUS.PENDING
          );
          for (const doc of pendingDocs) {
            doc.verificationStatus = VERIFICATION_STATUS.APPROVED;
            doc.verifiedAt = new Date();
            await documentRepository.save(doc);
          }
          console.log(`✅ Approved ${pendingDocs.length} pending documents for user ${userId}`);
        }
      } else {
        user.auth.accountVerified = false;
        user.auth.verificationRejected = true;
        user.auth.rejectionReason = rejectionReason || "Verification rejected by admin";

        // Also reject any pending documents when account is rejected
        if (user.documents && user.documents.length > 0) {
          const pendingDocs = user.documents.filter(
            doc => doc.verificationStatus === VERIFICATION_STATUS.PENDING
          );
          for (const doc of pendingDocs) {
            doc.verificationStatus = VERIFICATION_STATUS.REJECTED;
            doc.rejectionReason = rejectionReason || "Account verification rejected";
            doc.verifiedAt = new Date();
            await documentRepository.save(doc);
          }
          console.log(`❌ Rejected ${pendingDocs.length} pending documents for user ${userId}`);
        }
      }

      await authRepository.save(user.auth);
      console.log(`✅ User ${userId} verification updated: accountVerified=${user.auth.accountVerified}`);

      return {
        status: true,
        code: 200,
        message: approved ? "User verified successfully" : "User verification rejected",
        data: {
          id: user.id,
          name: user.name,
          accountVerified: user.auth.accountVerified,
          verificationRejected: user.auth.verificationRejected
        }
      };
    } catch (error) {
      console.error("Error in verifyUserAccount:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  }
};

export default adminService;