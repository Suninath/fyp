import { Request } from "express";
import { IsNull } from "typeorm";
import AppDataSource from "../config/db.config";
import { CommentEntity } from "../entities/comment.entity";
import { VehicleEntity } from "../entities/vehicle.entity";
import { UserEntity } from "../entities/user.entity";

const commentRepository = AppDataSource.getRepository(CommentEntity);
const vehicleRepository = AppDataSource.getRepository(VehicleEntity);
const userRepository = AppDataSource.getRepository(UserEntity);

const commentService = {
  async addComment(req: Request) {
    try {
      const user = (req as any).user;
      const { vehicleId, content, parentId } = req.body;

      if (!vehicleId || !content) {
        return { status: false, code: 400, message: "Vehicle ID and content are required" };
      }

      const vehicle = await vehicleRepository.findOneBy({ id: vehicleId });
      if (!vehicle) {
        return { status: false, code: 404, message: "Vehicle not found" };
      }

      let parentComment: CommentEntity | undefined = undefined;
      if (parentId) {
          const found = await commentRepository.findOne({ where: { id: parentId } });
          if (found) parentComment = found;
      }

      const newComment = commentRepository.create({
        content,
        user: { id: user.id } as UserEntity, 
        vehicle: { id: vehicleId } as VehicleEntity,
        parent: parentComment
      });

      const savedComment = await commentRepository.save(newComment);
      
      const fullComment = await commentRepository.findOne({
        where: { id: savedComment.id },
        relations: ["user"]
      });

      return {
        status: true,
        code: 201,
        message: "Comment added successfully",
        data: fullComment,
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  async getCommentsByVehicleId(req: Request) {
    try {
      const { vehicleId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const pageNum = Number(page);
      const limitNum = Number(limit);

      // Get total count of parent comments
      const total = await commentRepository.count({
        where: { vehicle: { id: parseInt(vehicleId) }, parent: IsNull() },
      });

      const comments = await commentRepository.find({
        where: { vehicle: { id: parseInt(vehicleId) }, parent: IsNull() },
        relations: ["user", "replies", "replies.user"],
        order: { createdAt: "DESC" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      });

      // Sort nested replies
      if (comments) {
          comments.forEach(c => {
             if (c.replies) c.replies.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
          });
      }

      return {
        status: true,
        code: 200,
        message: "Comments retrieved successfully",
        data: comments,
        pagination: {
          currentPage: pageNum,
          perpage: limitNum,
          count: total,
          totalPages: Math.ceil(total / limitNum)
        }
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  async replyToComment(req: Request) {
     try {
         const { commentId } = req.params;
         const { reply } = req.body; 
         
         const parent = await commentRepository.findOne({ where: { id: parseInt(commentId) }, relations: ["vehicle"] });
         if (!parent) return { status: false, code: 404, message: "Parent comment not found" };

         req.body.vehicleId = parent.vehicle.id;
         req.body.parentId = parent.id;
         req.body.content = reply; 
         
         return this.addComment(req);
     } catch(e) {
         console.error(e);
         return { status: false, code: 500, message: "Error processing reply" };
     }
  },
};

export default commentService;
