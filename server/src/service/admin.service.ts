import { Repository } from "typeorm";
import AppDataSource from "../config/db.config";
import { UserEntity } from "../entities/user.entity";
import { AuthEntity } from "../entities/auth.entity";
import { VehicleEntity } from "../entities/vehicle.entity";
import { USER_ROLE } from "../constant/enums";

const userRepository = AppDataSource.getRepository(UserEntity);
const authRepository = AppDataSource.getRepository(AuthEntity);
const vehicleRepository = AppDataSource.getRepository(VehicleEntity);

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

  async getAllStores({ search, page = 1, limit = 10 }: { search?: string; page?: number; limit?: number } = {}) {
    try {
      const queryBuilder = userRepository.createQueryBuilder("user")
        .leftJoinAndSelect("user.auth", "auth")
        .where("auth.role = :role", { role: USER_ROLE.STORE });

      // Apply search filter
      if (search) {
        queryBuilder.andWhere("(user.name ILIKE :search OR auth.email ILIKE :search)", 
          { search: `%${search}%` });
      }

      // Get total count for pagination
      const total = await queryBuilder.getCount();

      // Apply pagination
      const stores = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return {
        status: true,
        code: 200,
        data: stores.map(store => ({
          id: store.id,
          storeName: store.name,
          ownerName: store.name, // For now, using name as both store and owner name since we don't have separate fields
          email: store.auth.email,
          phoneNumber: store.phoneNumber,
          role: store.auth.role,
          verified: store.auth.verified,
          panNumber: store.panNumber,
          companyRegistrationDoc: store.companyRegistrationDoc,
          paymentStatus: store.paymentStatus,
          isVerified: store.auth.verified,
          isBlocked: store.auth.isBlocked,
          createdAt: store.createdAt
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

  async verifyStore(storeId: string) {
    try {
      const store = await userRepository.findOne({
        where: { id: parseInt(storeId) },
        relations: ["auth"]
      });

      if (!store) {
        return {
          status: false,
          code: 404,
          message: "Store not found"
        };
      }

      if (store.auth.role !== USER_ROLE.STORE) {
        return {
          status: false,
          code: 400,
          message: "User is not a store"
        };
      }

      store.auth.verified = true;
      await authRepository.save(store.auth);

      return {
        status: true,
        code: 200,
        message: "Store verified successfully"
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

  async blockStore(storeId: string) {
    try {
      const store = await userRepository.findOne({
        where: { id: parseInt(storeId) },
        relations: ["auth"]
      });

      if (!store) {
        return {
          status: false,
          code: 404,
          message: "Store not found"
        };
      }

      if (store.auth.role !== USER_ROLE.STORE) {
        return {
          status: false,
          code: 400,
          message: "User is not a store"
        };
      }

      store.auth.isBlocked = true;
      await authRepository.save(store.auth);

      return {
        status: true,
        code: 200,
        message: "Store blocked successfully"
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

  async unblockStore(storeId: string) {
    try {
      const store = await userRepository.findOne({
        where: { id: parseInt(storeId) },
        relations: ["auth"]
      });

      if (!store) {
        return {
          status: false,
          code: 404,
          message: "Store not found"
        };
      }

      if (store.auth.role !== USER_ROLE.STORE) {
        return {
          status: false,
          code: 400,
          message: "User is not a store"
        };
      }

      store.auth.isBlocked = false;
      await authRepository.save(store.auth);

      return {
        status: true,
        code: 200,
        message: "Store unblocked successfully"
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

      const totalStores = await userRepository.count({
        where: {
          auth: {
            role: USER_ROLE.STORE
          }
        }
      });

      const totalVehicles = await vehicleRepository.count();

      // For revenue, we'd need to implement actual transaction tracking
      const totalRevenue = 0; // Placeholder

      return {
        status: true,
        code: 200,
        data: {
          totalUsers,
          totalStores,
          totalVehicles,
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
        .leftJoinAndSelect("vehicle.uploader", "uploader");

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
          uploader: {
            id: vehicle.uploader.id,
            name: vehicle.uploader.name,
            email: vehicle.uploader.auth?.email
          }
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
  }
};

export default adminService;