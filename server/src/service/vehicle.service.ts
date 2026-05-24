import { Request } from "express";
import AppDataSource from "../config/db.config";
import { VehicleEntity, VEHICLE_CATEGORY } from "../entities/vehicle.entity";
import { VehicleViewEntity } from "../entities/vehicle_view.entity";
import { BookingEntity, BOOKING_STATUS } from "../entities/booking.entity";
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
const MAX_VEHICLES_PER_DAY = 2;
const MAX_VEHICLES_PER_MONTH = 5;
const COOLDOWN_MINUTES = 30;
const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;
const MONTH_WINDOW_DAYS = 30;
const MONTH_WINDOW_MS = MONTH_WINDOW_DAYS * 24 * 60 * 60 * 1000;

type RateLimitType = "cooldown" | "daily" | "monthly";

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

const getRequestIpAddress = (req: Request) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0] || req.ip || req.socket?.remoteAddress || "unknown";
  }

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
};

const cleanupUploadedFiles = async (req: Request) => {
  const files = (req as any).files as Express.Multer.File[] | undefined;
  if (!files?.length) return;

  for (const file of files) {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error("Failed to clean up uploaded file after rate limit rejection:", error);
    }
  }
};

const getNextMidnight = (date: Date) => {
  const nextMidnight = new Date(date);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight;
};

const buildRateLimitError = async ({
  req,
  limitType,
  message,
  currentCount,
  limit,
  resetAt,
}: {
  req: Request;
  limitType: RateLimitType;
  message: string;
  currentCount: number;
  limit: number;
  resetAt: Date;
}) => {
  const retryAfter = Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / 1000));

  console.warn(
    JSON.stringify({
      event: "vehicle_rate_limit_rejected",
      userId: getAuthenticatedUserId(req),
      attemptAt: new Date().toISOString(),
      ipAddress: getRequestIpAddress(req),
      limitType,
      currentCount,
      limit,
      resetAt: resetAt.toISOString(),
      retryAfter,
    }),
  );

  await cleanupUploadedFiles(req);

  return {
    success: false,
    status: false,
    code: 429,
    errorCode: "RATE_LIMIT_EXCEEDED",
    limitType,
    message,
    currentCount,
    limit,
    resetAt: resetAt.toISOString(),
    retryAfter,
  };
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

      if (!isAdmin) {
        const mostRecentVehicle = await vehicleRepository.findOne({
          where: {
            uploader: {
              id: uploader.id,
            },
          },
          order: {
            createdAt: "DESC",
          },
        });

        if (mostRecentVehicle?.createdAt) {
          const cooldownResetAt = new Date(mostRecentVehicle.createdAt.getTime() + COOLDOWN_MS);
          if (cooldownResetAt.getTime() > now.getTime()) {
            return await buildRateLimitError({
              req,
              limitType: "cooldown",
              message: `Please wait ${Math.ceil((cooldownResetAt.getTime() - now.getTime()) / 60000)} minutes before creating another listing.`,
              currentCount: 1,
              limit: 1,
              resetAt: cooldownResetAt,
            });
          }
        }

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        const dailyVehicleCount = await vehicleRepository.count({
          where: {
            uploader: {
              id: uploader.id,
            },
            createdAt: Between(startOfToday, endOfToday),
          },
        });

        if (dailyVehicleCount >= MAX_VEHICLES_PER_DAY) {
          const dailyResetAt = getNextMidnight(now);
          return await buildRateLimitError({
            req,
            limitType: "daily",
            message: `You can create a maximum of ${MAX_VEHICLES_PER_DAY} vehicle listings per day. Your limit resets at midnight.`,
            currentCount: dailyVehicleCount,
            limit: MAX_VEHICLES_PER_DAY,
            resetAt: dailyResetAt,
          });
        }

        const monthWindowStart = new Date(now.getTime() - MONTH_WINDOW_MS);
        const monthlyVehicleCount = await vehicleRepository.count({
          where: {
            uploader: {
              id: uploader.id,
            },
            createdAt: Between(monthWindowStart, now),
          },
        });

        if (monthlyVehicleCount >= MAX_VEHICLES_PER_MONTH) {
          const oldestVehicleInWindow = await vehicleRepository.findOne({
            where: {
              uploader: {
                id: uploader.id,
              },
              createdAt: Between(monthWindowStart, now),
            },
            order: {
              createdAt: "ASC",
            },
          });

          const monthlyResetAt = oldestVehicleInWindow?.createdAt
            ? new Date(oldestVehicleInWindow.createdAt.getTime() + MONTH_WINDOW_MS)
            : new Date(now.getTime() + MONTH_WINDOW_MS);

          return await buildRateLimitError({
            req,
            limitType: "monthly",
            message: `You can create a maximum of ${MAX_VEHICLES_PER_MONTH} vehicle listings per month. Please wait until your oldest listing rolls out of the 30-day window.`,
            currentCount: monthlyVehicleCount,
            limit: MAX_VEHICLES_PER_MONTH,
            resetAt: monthlyResetAt,
          });
        }
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
        startDate,
        endDate,
        availableNow,
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

      // Pagination will be applied after availability filtering (below)

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

      // If availability filtering or date-range checks are requested, fetch all matching vehicles
      // and compute availabilityStatus for each before applying pagination. Otherwise, use
      // database-level pagination for performance.
      let allVehicles: VehicleEntity[] = [];
      let total = 0;

      const needsAvailabilityChecks = hasValue(startDate) || hasValue(endDate) || String(availableNow) === "true";

      if (needsAvailabilityChecks) {
        allVehicles = await queryBuilder.getMany();
        total = allVehicles.length;
      } else {
        const result = await queryBuilder.getManyAndCount();
        allVehicles = result[0];
        total = result[1];
      }

      // Helper to compute availability for a vehicle
      const computeAvailability = async (vehicle: VehicleEntity) => {
        // only compute for renting category
        if (vehicle.category !== VEHICLE_CATEGORY.RENTING) {
          return { availabilityStatus: "available" };
        }

        // Use start-of-day boundaries to avoid timezone/time-of-day inversion
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        // load bookings for this vehicle
        const bookings = await bookingRepository.find({
          where: { vehicle: { id: vehicle.id } },
          order: { startDate: "ASC" },
        });

        const confirmedBookings = bookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED);

        // Debug logging to trace availability computation
        try {
          console.log('--- Computing status for vehicle:', vehicle?.name, vehicle?.id);
          console.log('Today start (local):', startOfToday.toISOString());
          console.log('Today end (local):', endOfToday.toISOString());
          console.log('Loaded bookings count:', bookings.length);
          console.log('Confirmed bookings:', confirmedBookings.map((b) => ({ id: (b as any).id, startDate: b.startDate, endDate: b.endDate, status: b.status })));
        } catch (logErr) {
          console.warn('Failed to log availability debug info:', logErr);
        }

        // If caller passed a date range, evaluate conflicts against that range
        if (hasValue(startDate) && hasValue(endDate)) {
          const userStart = new Date(String(startDate));
          const userEnd = new Date(String(endDate));
          const conflicts = confirmedBookings.filter((b) => {
            const bs = new Date(b.startDate);
            const be = new Date(b.endDate);
            // overlap if userStart <= be && userEnd >= bs
            return userStart <= be && userEnd >= bs;
          });

          try {
            console.log('Date-range check for vehicle', vehicle?.id, 'userStart:', userStart.toISOString(), 'userEnd:', userEnd.toISOString(), 'conflicts:', conflicts.length);
          } catch (logErr) {}

          const status = conflicts.length > 0 ? "booked" : "available";
          try { console.log('Final availabilityStatus assigned for vehicle', vehicle?.id, status); } catch (e) {}
          return { availabilityStatus: status };
        }

        // No date range: compute for today using startOfToday boundary
        const activeBookings = confirmedBookings.filter((b) => {
          const bs = new Date(b.startDate);
          const be = new Date(b.endDate);
          // active today if bs <= endOfToday && be >= startOfToday
          return bs <= endOfToday && be >= startOfToday;
        });

        try {
          console.log('Active bookings count for vehicle', vehicle?.id, activeBookings.length);
        } catch (logErr) {}

        if (activeBookings.length > 0) {
          // compute bookedUntil as latest end date among active bookings
          const bookedUntil = new Date(Math.max(...activeBookings.map((b) => new Date(b.endDate).getTime())));
          try {
            console.log('Vehicle', vehicle?.id, '-> booked until', bookedUntil.toISOString());
            console.log('Final availabilityStatus assigned for vehicle', vehicle?.id, 'booked');
          } catch (logErr) {}
          return { availabilityStatus: "booked", bookedUntil };
        }

        const upcoming = confirmedBookings.filter((b) => new Date(b.startDate) > endOfToday);
        if (upcoming.length > 0) {
          const nextStart = new Date(upcoming[0].startDate);
          try {
            console.log('Vehicle', vehicle?.id, '-> next start at', nextStart.toISOString());
            console.log('Final availabilityStatus assigned for vehicle', vehicle?.id, 'reserved');
          } catch (logErr) {}
          return { availabilityStatus: "reserved", nextStartDate: nextStart };
        }

        const finalStatus = "available";
        try { console.log('Final availabilityStatus assigned for vehicle', vehicle?.id, finalStatus); } catch (e) {}

        // If DB vehicle.condition is stale (e.g., still 'reserved') while availability is free,
        // clear the reserved flag so frontend that still reads `condition` doesn't show wrong badge.
        try {
          if (vehicle.condition === "reserved") {
            vehicle.condition = undefined;
            await vehicleRepository.save(vehicle);
            console.log('Cleared stale vehicle.condition for vehicle', vehicle?.id);
          }
        } catch (vehErr) {
          console.error('Failed to clear stale vehicle.condition for', vehicle?.id, vehErr);
        }

        return { availabilityStatus: finalStatus };
      };

      // Compute availability for matching vehicles (only page slice when pagination requested without availability checks)
      const vehiclesToCompute = needsAvailabilityChecks ? allVehicles : allVehicles;
      const vehiclesWithStatus = [] as any[];

      for (const vehicle of vehiclesToCompute) {
        const avail = await computeAvailability(vehicle);
        vehiclesWithStatus.push({ vehicle, ...avail });
      }

      // If "availableNow" filter requested, filter out non-available vehicles
      let filtered = vehiclesWithStatus;
      if (String(availableNow) === "true") {
        filtered = vehiclesWithStatus.filter((v) => v.availabilityStatus === "available");
      }

      // Apply pagination on filtered results
      const parsedPage = parseIntegerParam(page) ?? 1;
      const parsedLimit = parseIntegerParam(limit) ?? 10;
      const offset = (parsedPage - 1) * parsedLimit;
      const paged = filtered.slice(offset, offset + parsedLimit);
      return {
        status: true,
        code: 200,
        message: "Vehicles retrieved successfully",
        data: {
          vehicles: paged.map(({ vehicle, availabilityStatus, nextStartDate, bookedUntil }) => ({
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
            availabilityStatus,
            nextStartDate,
            bookedUntil,
          })),
          pagination: {
            currentPage: parsedPage,
            perpage: parsedLimit,
            count: filtered.length,
            totalPages: Math.ceil(filtered.length / parsedLimit),
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
