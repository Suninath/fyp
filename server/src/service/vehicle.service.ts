import { Request } from "express";
import AppDataSource from "../config/db.config";
import { VehicleEntity, VEHICLE_CATEGORY } from "../entities/vehicle.entity";
import { UserEntity } from "../entities/user.entity";
import cloudinary from "../config/cloudinary.config";
import fs from "fs";
import path from "path";

const vehicleRepository = AppDataSource.getRepository(VehicleEntity);
const userRepository = AppDataSource.getRepository(UserEntity);

// Helper function to upload images to Cloudinary
const uploadImagesToCloudinary = async (
  files: Express.Multer.File[],
): Promise<string[]> => {
  if (!files || files.length === 0) return [];

  const uploadedUrls: string[] = [];

  for (const file of files) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "autogear/vehicles",
        resource_type: "auto",
        quality: "auto",
      });
      uploadedUrls.push(result.secure_url);
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error(`Failed to upload image: ${file.originalname}`);
    } finally {
      // Delete local file after 5s regardless of success/failure
      setTimeout(() => {
        if (fs.existsSync(file.path)) {
          fs.unlink(file.path, () => {});
        }
      }, 5000);
    }
  }

  return uploadedUrls;
};

const vehicleService = {
  /* ===================== CREATE VEHICLE ===================== */
  async createVehicle(req: Request) {
    try {
      const user = (req as any).user;
      const {
        name,
        make,
        model,
        year,
        price,
        mileage,
        fuelType,
        transmission,
        color,
        location,
        condition,
        description,
        category = VEHICLE_CATEGORY.BUY_SELL,
      } = req.body;

      if (!name || !make || !model || !year || !price) {
        return {
          status: false,
          code: 400,
          message: "Name, make, model, year, and price are required",
        };
      }

      // Verify user exists and is verified
      const uploader = await userRepository.findOne({
        where: { id: user.id },
        relations: ["auth"],
      });

      if (!uploader) {
        return {
          status: false,
          code: 404,
          message: "User not found",
        };
      }

      // Check if user is verified
      if (!uploader.auth?.accountVerified) {
        return {
          status: false,
          code: 403,
          message:
            "Account verification required. Please submit your verification documents for admin approval before selling vehicles.",
        };
      }

      // Upload images to Cloudinary if files are provided
      let uploadedImages: string[] = [];
      const files = (req as any).files as Express.Multer.File[];
      if (files && files.length > 0) {
        uploadedImages = await uploadImagesToCloudinary(files);
      }

      const vehicle = vehicleRepository.create({
        name,
        make,
        model,
        year: parseInt(year),
        price: parseFloat(price),
        mileage: mileage ? parseInt(mileage) : undefined,
        fuelType,
        transmission,
        color,
        location,
        condition,
        description,
        images: uploadedImages.length > 0 ? uploadedImages : [],
        category,
        uploader,
      });

      const savedVehicle = await vehicleRepository.save(vehicle);

      return {
        status: true,
        code: 201,
        message: "Vehicle created successfully",
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== GET USER VEHICLES ===================== */
  async getUserVehicles(req: Request) {
    try {
      const user = (req as any).user;
      const { page = 1, limit = 10, search, category } = req.query;

      const queryBuilder = vehicleRepository
        .createQueryBuilder("vehicle")
        .leftJoinAndSelect("vehicle.uploader", "uploader")
        .where("vehicle.uploader.id = :userId", { userId: user.id })
        .andWhere("vehicle.isBlocked = false");

      // Add search filter
      if (search) {
        queryBuilder.andWhere(
          "(vehicle.name ILIKE :search OR vehicle.make ILIKE :search OR vehicle.model ILIKE :search)",
          { search: `%${search}%` },
        );
      }

      // Add category filter
      if (category) {
        queryBuilder.andWhere("vehicle.category = :category", { category });
      }

      // Add pagination
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      queryBuilder.skip(offset).take(parseInt(limit as string));

      // Order by creation date (newest first)
      queryBuilder.orderBy("vehicle.createdAt", "DESC");

      const [vehicles, total] = await queryBuilder.getManyAndCount();

      return {
        status: true,
        code: 200,
        message: "Vehicles retrieved successfully",
        data: {
          vehicles: vehicles.map((vehicle) => ({
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
            createdAt: vehicle.createdAt,
          })),
          pagination: {
            currentPage: parseInt(page as string),
            perpage: parseInt(limit as string),
            count: total,
            totalPages: Math.ceil(total / parseInt(limit as string)),
          },
        },
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== GET VEHICLE BY ID ===================== */
  async getVehicleById(req: Request) {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const vehicle = await vehicleRepository.findOne({
        where: {
          id: parseInt(id),
          uploader: { id: user.id },
          isBlocked: false,
        },
        relations: ["uploader"],
      });

      if (!vehicle) {
        return {
          status: false,
          code: 404,
          message: "Vehicle not found or access denied",
        };
      }

      return {
        status: true,
        code: 200,
        message: "Vehicle retrieved successfully",
        data: {
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
          createdAt: vehicle.createdAt,
        },
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== GET PUBLIC VEHICLE BY ID ===================== */
  async getPublicVehicleById(req: Request) {
    try {
      const { id } = req.params;

      const vehicle = await vehicleRepository.findOne({
        where: { id: parseInt(id), isBlocked: false },
        relations: ["uploader", "uploader.auth"], // Get uploader info
      });

      if (!vehicle) {
        return {
          status: false,
          code: 404,
          message: "Vehicle not found",
        };
      }

      return {
        status: true,
        code: 200,
        message: "Vehicle retrieved successfully",
        data: {
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
          createdAt: vehicle.createdAt,
          uploader: {
            id: vehicle.uploader.id,
            name: vehicle.uploader.name,
            email: vehicle.uploader.auth?.email, // Optional: share email if public? Maybe just ID and Name.
          },
        },
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== UPDATE VEHICLE ===================== */
  async updateVehicle(req: Request) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const updateData = req.body;

      // Check if vehicle exists and belongs to user
      const vehicle = await vehicleRepository.findOne({
        where: {
          id: parseInt(id),
          uploader: { id: user.id },
          isBlocked: false,
        },
      });

      if (!vehicle) {
        return {
          status: false,
          code: 404,
          message: "Vehicle not found or access denied",
        };
      }

      // Handle image management
      let imagesToUpdate = vehicle.images || [];

      // Parse keepImages if provided (existing images to keep)
      let keepImages: string[] = [];
      if (updateData.keepImages) {
        try {
          keepImages = JSON.parse(updateData.keepImages);
        } catch (e) {
          keepImages = [];
        }
      }

      // If keepImages provided, filter current images to only keep specified ones
      if (keepImages.length > 0) {
        imagesToUpdate = imagesToUpdate.filter((img) =>
          keepImages.includes(img),
        );
      } else if (updateData.keepImages !== undefined) {
        // If keepImages was sent but empty, remove all existing images
        imagesToUpdate = [];
      }

      // Upload new images if files are provided
      const files = (req as any).files as Express.Multer.File[];
      if (files && files.length > 0) {
        const uploadedImages = await uploadImagesToCloudinary(files);
        imagesToUpdate = [...imagesToUpdate, ...uploadedImages];
      }

      // Update vehicle
      const updatedVehicle = await vehicleRepository.save({
        ...vehicle,
        ...updateData,
        year: updateData.year ? parseInt(updateData.year) : vehicle.year,
        price: updateData.price ? parseFloat(updateData.price) : vehicle.price,
        mileage: updateData.mileage
          ? parseInt(updateData.mileage)
          : vehicle.mileage,
        images: imagesToUpdate,
      });

      return {
        status: true,
        code: 200,
        message: "Vehicle updated successfully",
        data: {
          id: updatedVehicle.id,
          name: updatedVehicle.name,
          make: updatedVehicle.make,
          model: updatedVehicle.model,
          year: updatedVehicle.year,
          price: updatedVehicle.price,
          mileage: updatedVehicle.mileage,
          fuelType: updatedVehicle.fuelType,
          transmission: updatedVehicle.transmission,
          color: updatedVehicle.color,
          location: updatedVehicle.location,
          condition: updatedVehicle.condition,
          description: updatedVehicle.description,
          images: updatedVehicle.images,
          category: updatedVehicle.category,
        },
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== DELETE VEHICLE ===================== */
  async deleteVehicle(req: Request) {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      // Check if vehicle exists and belongs to user
      const vehicle = await vehicleRepository.findOne({
        where: {
          id: parseInt(id),
          uploader: { id: user.id },
          isBlocked: false,
        },
      });

      if (!vehicle) {
        return {
          status: false,
          code: 404,
          message: "Vehicle not found or access denied",
        };
      }

      // Delete the vehicle
      await vehicleRepository.remove(vehicle);

      return {
        status: true,
        code: 200,
        message: "Vehicle deleted successfully",
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== GET ALL PUBLIC VEHICLES ===================== */
  async getAllVehicles(req: Request) {
    try {
      const { page = 1, limit = 10, search, category } = req.query;

      const queryBuilder = vehicleRepository
        .createQueryBuilder("vehicle")
        .leftJoinAndSelect("vehicle.uploader", "uploader")
        .where("vehicle.isBlocked = false");

      // Add search filter
      if (search) {
        queryBuilder.andWhere(
          "(vehicle.name ILIKE :search OR vehicle.make ILIKE :search OR vehicle.model ILIKE :search)",
          { search: `%${search}%` },
        );
      }

      // Add category filter
      if (category) {
        queryBuilder.andWhere("vehicle.category = :category", { category });
      }

      // Add pagination
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      queryBuilder.skip(offset).take(parseInt(limit as string));

      // Order by creation date (newest first)
      queryBuilder.orderBy("vehicle.createdAt", "DESC");

      const [vehicles, total] = await queryBuilder.getManyAndCount();

      return {
        status: true,
        code: 200,
        message: "Vehicles retrieved successfully",
        data: {
          vehicles: vehicles.map((vehicle) => ({
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
            createdAt: vehicle.createdAt,
            uploader: {
              name: vehicle.uploader?.name,
              id: vehicle.uploader?.id,
              // Add other uploader safe fields
            },
          })),
          pagination: {
            currentPage: parseInt(page as string),
            perpage: parseInt(limit as string),
            count: total,
            totalPages: Math.ceil(total / parseInt(limit as string)),
          },
        },
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },
};

export default vehicleService;
