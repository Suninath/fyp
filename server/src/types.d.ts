import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // or specify the type, e.g., { id: string; email: string; }
    }
  }
}