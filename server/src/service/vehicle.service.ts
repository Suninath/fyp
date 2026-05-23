import { Request } from "express";
import AppDataSource from "../config/db.config";
import { VehicleEntity, VEHICLE_CATEGORY } from "../entities/vehicle.entity";
import { VehicleViewEntity } from "../entities/vehicle_view.entity";
import { BookingEntity } from "../entities/booking.entity";
import { UserEntity } from "../entities/user.entity";
import { USER_ROLE } from "../constant/enums";
import cloudinary from "../config/cloudinary.config";
import fs from "fs";
import path from "path";
import { Between, Brackets } from "typeorm";

const vehicleRepository = AppDataSource.getRepository(VehicleEntity);
const userRepository = AppDataSource.getRepository(UserEntity);
const vehicleViewRepository = AppDataSource.getRepository(VehicleViewEntity);
const bookingRepository = AppDataSource.getRepository(BookingEntity);
const VEHICLE_CATEGORY_VALUES = Object.values(VEHICLE_CATEGORY);
const VEHICLE_PRICE_MAX = 9_999_999_999.99; // numeric(12,2) max absolute value is < 10^10
const VEHICLE_YEAR_MIN = 1886;
const VEHICLE_YEAR_MAX = new Date().getFullYear() + 1;
const VEHICLE_MILEAGE_MAX = 2_147_483_647; // PostgreSQL int upper bound
const MAX_VEHICLES_PER_USER_PER_DAY = 10;

const parseIntegerParam = (value: unknown): number | null => {
  if (!hasValue(value)) return null;

  const parsedValue = parseInt(String(value), 10);
  return Number.isNaN(parsedValue) ? null : parsedValue;
};

const parseMultiValueParam = (value: unknown): string[] => {
  if (!hasValue(value)) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const isValidVehicleCategory = (category: string): category is VEHICLE_CATEGORY => {
  return VEHICLE_CATEGORY_VALUES.includes(category as VEHICLE_CATEGORY);
};

const hasValue = (value: unknown) => value !== undefined && value !== null && value !== "";

const toNumber = (value: unknown) => Number(value);

const getAuthenticatedUserId = (req: Request): number | null => {
  const maybeUser = (req as any).user;
  if (!maybeUser?.id) return null;

  const parsedUserId = typeof maybeUser.id === "string" ? parseInt(maybeUser.id, 10) : maybeUser.id;
  if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
    return null;
  }

  return parsedUserId;
};

const trackVehicleDetailView = async (req: Request, vehicleId: number) => {
  const maybeUser = (req as any).user;
  const viewerId = getAuthenticatedUserId(req);

  // Track only signed-in regular users viewing public vehicle details.
  if (!viewerId || maybeUser?.role !== USER_ROLE.USER) {
    return;
  }

  const existingView = await vehicleViewRepository.findOne({
    where: {
      viewerId,
      vehicleId,
    },
  });

  if (existingView) {
    existingView.viewCount = Number(existingView.viewCount || 0) + 1;
    existingView.lastViewedAt = new Date();
    await vehicleViewRepository.save(existingView);
    return;
  }

  const newView = vehicleViewRepository.create({
    viewerId,
    vehicleId,
    viewCount: 1,
    lastViewedAt: new Date(),
  });

  await vehicleViewRepository.save(newView);
};

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
      const isAdmin = user?.role === USER_ROLE.ADMIN;
      const {
        name,
        make,
        model,
        year,
        price,
        mileage,
        fuelType,
        transmission,
        bodyType,
        ownerCount,
        color,
        location,
        condition,
        description,
        category,
      } = req.body;

      const listingCategory = category || VEHICLE_CATEGORY.BUY_SELL;

      if (!isValidVehicleCategory(listingCategory)) {
        return {
          status: false,
          code: 400,
          message: "Invalid vehicle category",
        };
      }

      if (listingCategory === VEHICLE_CATEGORY.RENTING && !isAdmin) {
        return {
          status: false,
          code: 403,
          message: "Only admin can create rental vehicle listings",
        };
      }

      if (!name || !make || !model || !year || !price) {
        return {
          status: false,
          code: 400,
          message: "Name, make, model, year, and price are required",
        };
      }

      const parsedYear = toNumber(year);
      if (
        !Number.isInteger(parsedYear) ||
        parsedYear < VEHICLE_YEAR_MIN ||
        parsedYear > VEHICLE_YEAR_MAX
      ) {
        return {
          status: false,
          code: 400,
          message: `Year must be between ${VEHICLE_YEAR_MIN} and ${VEHICLE_YEAR_MAX}`,
        };
      }

      const parsedPrice = toNumber(price);
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        return {
          status: false,
          code: 400,
          message: "Price must be a valid number greater than 0",
        };
      }

      if (parsedPrice > VEHICLE_PRICE_MAX) {
        return {
          status: false,
          code: 400,
          message: `Price must be less than or equal to ${VEHICLE_PRICE_MAX}`,
        };
      }

      let parsedMileage: number | undefined = undefined;
      if (hasValue(mileage)) {
        const mileageNumber = toNumber(mileage);
        if (
          !Number.isInteger(mileageNumber) ||
          mileageNumber < 0 ||
          mileageNumber > VEHICLE_MILEAGE_MAX
        ) {
          return {
            status: false,
            code: 400,
            message: "Mileage must be a whole number between 0 and 2147483647",
          };
        }
        parsedMileage = mileageNumber;
      }

      let parsedOwnerCount: number | undefined = undefined;
      if (hasValue(ownerCount)) {
        const ownerCountNumber = parseIntegerParam(ownerCount);
        if (
          ownerCountNumber === null ||
          ownerCountNumber < 1 ||
          ownerCountNumber > 99
        ) {
          return {
            status: false,
            code: 400,
            message: "Owner count must be a whole number between 1 and 99",
          };
        }
        parsedOwnerCount = ownerCountNumber;
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
      if (!uploader.auth?.accountVerified && !isAdmin) {
        return {
          status: false,
          code: 403,
          message:
            "Account verification required. Please submit your verification documents for admin approval before selling vehicles.",
        };
      }

      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);

      const existingVehicleCount = await vehicleRepository.count({
        where: {
          uploader: {
            id: uploader.id,
          },
          createdAt: Between(startOfToday, endOfToday),
        },
      });

      if (existingVehicleCount >= MAX_VEHICLES_PER_USER_PER_DAY) {
        return {
          status: false,
          code: 400,
          message: `Daily vehicle limit reached. A user can create a maximum of ${MAX_VEHICLES_PER_USER_PER_DAY} vehicles per day.`,
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
        year: parsedYear,
        price: parsedPrice,
        mileage: parsedMileage,
        fuelType,
        transmission,
        bodyType,
        ownerCount: parsedOwnerCount,
        color,
        location,
        condition,
        description,
        images: uploadedImages.length > 0 ? uploadedImages : [],
        category: listingCategory,
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
            bodyType: vehicle.bodyType,
            ownerCount: vehicle.ownerCount,
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

      // Non-blocking analytics write for logged-in users.
      try {
        await trackVehicleDetailView(req, vehicle.id as number);
      } catch (analyticsError) {
        console.error("Failed to track vehicle view:", analyticsError);
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

  /* ===================== UPDATE VEHICLE ===================== */
  async updateVehicle(req: Request) {
    try {
      const user = (req as any).user;
      const isAdmin = user?.role === USER_ROLE.ADMIN;
      const { id } = req.params;
      const updateData = req.body;

      if (updateData.category !== undefined) {
        if (!isValidVehicleCategory(updateData.category)) {
          return {
            status: false,
            code: 400,
            message: "Invalid vehicle category",
          };
        }

        if (updateData.category === VEHICLE_CATEGORY.RENTING && !isAdmin) {
          return {
            status: false,
            code: 403,
            message: "Only admin can create or update rental vehicle listings",
          };
        }
      }

      let parsedUpdateYear: number | undefined;
      if (hasValue(updateData.year)) {
        const yearNumber = toNumber(updateData.year);
        if (
          !Number.isInteger(yearNumber) ||
          yearNumber < VEHICLE_YEAR_MIN ||
          yearNumber > VEHICLE_YEAR_MAX
        ) {
          return {
            status: false,
            code: 400,
            message: `Year must be between ${VEHICLE_YEAR_MIN} and ${VEHICLE_YEAR_MAX}`,
          };
        }
        parsedUpdateYear = yearNumber;
      }

      let parsedUpdatePrice: number | undefined;
      if (hasValue(updateData.price)) {
        const priceNumber = toNumber(updateData.price);
        if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
          return {
            status: false,
            code: 400,
            message: "Price must be a valid number greater than 0",
          };
        }

        if (priceNumber > VEHICLE_PRICE_MAX) {
          return {
            status: false,
            code: 400,
            message: `Price must be less than or equal to ${VEHICLE_PRICE_MAX}`,
          };
        }
        parsedUpdatePrice = priceNumber;
      }

      let parsedUpdateMileage: number | undefined;
      if (hasValue(updateData.mileage)) {
        const mileageNumber = toNumber(updateData.mileage);
        if (
          !Number.isInteger(mileageNumber) ||
          mileageNumber < 0 ||
          mileageNumber > VEHICLE_MILEAGE_MAX
        ) {
          return {
            status: false,
            code: 400,
            message: "Mileage must be a whole number between 0 and 2147483647",
          };
        }
        parsedUpdateMileage = mileageNumber;
      }

      let parsedUpdateOwnerCount: number | undefined;
      if (hasValue(updateData.ownerCount)) {
        const ownerCountNumber = parseIntegerParam(updateData.ownerCount);
        if (
          ownerCountNumber === null ||
          ownerCountNumber < 1 ||
          ownerCountNumber > 99
        ) {
          return {
            status: false,
            code: 400,
            message: "Owner count must be a whole number between 1 and 99",
          };
        }
        parsedUpdateOwnerCount = ownerCountNumber;
      }

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
        year: parsedUpdateYear ?? vehicle.year,
        price: parsedUpdatePrice ?? vehicle.price,
        mileage: parsedUpdateMileage ?? vehicle.mileage,
        ownerCount: parsedUpdateOwnerCount ?? vehicle.ownerCount,
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
          bodyType: updatedVehicle.bodyType,
          ownerCount: updatedVehicle.ownerCount,
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
      const parsedVehicleId = parseInt(id, 10);

      if (!Number.isInteger(parsedVehicleId) || parsedVehicleId <= 0) {
        return {
          status: false,
          code: 400,
          message: "Invalid vehicle id",
        };
      }

      // Check if vehicle exists and belongs to user
      const vehicle = await vehicleRepository.findOne({
        where: {
          id: parsedVehicleId,
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

      const bookingCount = await bookingRepository.count({
        where: { vehicle: { id: parsedVehicleId } },
      });

      if (bookingCount > 0) {
        return {
          status: false,
          code: 409,
          message: "Cannot delete vehicle because it has related bookings. Cancel or remove those bookings first.",
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
      const {
        page = 1,
        limit = 10,
        search,
        category,
        brand,
        fuel,
        minYear,
        maxYear,
        transmission,
        bodyType,
        minKm,
        maxKm,
        ownerCount,
        sort,
        maxMileage,
        minPrice,
        maxPrice,
      } = req.query;

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

      const brandValues = parseMultiValueParam(brand);
      if (brandValues.length > 0) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            brandValues.forEach((value, index) => {
              const parameterName = `brand${index}`;
              if (index === 0) {
                qb.where(`vehicle.make ILIKE :${parameterName}`, { [parameterName]: `%${value}%` });
              } else {
                qb.orWhere(`vehicle.make ILIKE :${parameterName}`, { [parameterName]: `%${value}%` });
              }
            });
          }),
        );
      }

      const fuelValues = parseMultiValueParam(fuel);
      if (fuelValues.length > 0) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            fuelValues.forEach((value, index) => {
              const parameterName = `fuel${index}`;
              if (index === 0) {
                qb.where(`vehicle.fuelType ILIKE :${parameterName}`, { [parameterName]: `%${value}%` });
              } else {
                qb.orWhere(`vehicle.fuelType ILIKE :${parameterName}`, { [parameterName]: `%${value}%` });
              }
            });
          }),
        );
      }

      const transmissionValues = parseMultiValueParam(transmission);
      if (transmissionValues.length > 0) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            transmissionValues.forEach((value, index) => {
              const parameterName = `transmission${index}`;
              if (index === 0) {
                qb.where(`vehicle.transmission ILIKE :${parameterName}`, { [parameterName]: `%${value}%` });
              } else {
                qb.orWhere(`vehicle.transmission ILIKE :${parameterName}`, { [parameterName]: `%${value}%` });
              }
            });
          }),
        );
      }

      if (bodyType) {
        queryBuilder.andWhere("vehicle.bodyType ILIKE :bodyType", {
          bodyType: `%${bodyType}%`,
        });
      }

      // Add year range filters
      const parsedMinYear = parseIntegerParam(minYear);
      if (parsedMinYear !== null) {
        queryBuilder.andWhere("vehicle.year >= :minYear", { minYear: parsedMinYear });
      }

      const parsedMaxYear = parseIntegerParam(maxYear);
      if (parsedMaxYear !== null) {
        queryBuilder.andWhere("vehicle.year <= :maxYear", { maxYear: parsedMaxYear });
      }

      // Add mileage filters
      const parsedMinKm = parseIntegerParam(minKm);
      if (parsedMinKm !== null) {
        queryBuilder.andWhere("vehicle.mileage >= :minKm", { minKm: parsedMinKm });
      }

      const parsedMaxKm = parseIntegerParam(maxKm);
      if (parsedMaxKm !== null) {
        queryBuilder.andWhere("vehicle.mileage <= :maxKm", { maxKm: parsedMaxKm });
      }

      // Preserve existing maxMileage behavior while adding minKm/maxKm
      const parsedMaxMileage = parseIntegerParam(maxMileage);
      if (parsedMaxMileage !== null) {
        queryBuilder.andWhere("vehicle.mileage <= :maxMileage", { maxMileage: parsedMaxMileage });
      }

      if (ownerCount !== undefined && ownerCount !== null && ownerCount !== "") {
        const ownerCountValue = String(ownerCount).trim();
        const ownerCountNumber = parseInt(ownerCountValue, 10);

        if (!Number.isNaN(ownerCountNumber)) {
          if (ownerCountValue.includes("+") || ownerCountNumber >= 4) {
            queryBuilder.andWhere("vehicle.ownerCount >= :ownerCount", { ownerCount: 4 });
          } else {
            queryBuilder.andWhere("vehicle.ownerCount = :ownerCount", { ownerCount: ownerCountNumber });
          }
        }
      }

      // Add price range filters
      const parsedMinPrice = parseIntegerParam(minPrice);
      if (parsedMinPrice !== null) {
        queryBuilder.andWhere("vehicle.price >= :minPrice", { minPrice: parsedMinPrice });
      }

      const parsedMaxPrice = parseIntegerParam(maxPrice);
      if (parsedMaxPrice !== null) {
        queryBuilder.andWhere("vehicle.price <= :maxPrice", { maxPrice: parsedMaxPrice });
      }

      // Add pagination
      const parsedPage = parseIntegerParam(page) ?? 1;
      const parsedLimit = parseIntegerParam(limit) ?? 10;
      const offset = (parsedPage - 1) * parsedLimit;
      queryBuilder.skip(offset).take(parsedLimit);

      // Apply requested sort order, defaulting to newest first
      switch (sort) {
        case "price_asc":
          queryBuilder.orderBy("vehicle.price", "ASC");
          break;
        case "price_desc":
          queryBuilder.orderBy("vehicle.price", "DESC");
          break;
        case "year_asc":
          queryBuilder.orderBy("vehicle.year", "ASC");
          break;
        case "year_desc":
          queryBuilder.orderBy("vehicle.year", "DESC");
          break;
        case "mileage_asc":
          queryBuilder.orderBy("vehicle.mileage", "ASC");
          break;
        case "newest":
        default:
          queryBuilder.orderBy("vehicle.createdAt", "DESC");
          break;
      }

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
            bodyType: vehicle.bodyType,
            ownerCount: vehicle.ownerCount,
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
};

export default vehicleService;
