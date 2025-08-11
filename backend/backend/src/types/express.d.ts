import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

// Define our custom User type that matches both Prisma and our auth requirements
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  organization?: string;
  permissions?: string[];
}

// Extend Express Request to include our user type
export interface Request<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  LocalsObj = Record<string, any>
> extends ExpressRequest<P, ResBody, ReqBody, ReqQuery, LocalsObj> {
  user?: AuthUser;
}

// Re-export Response and NextFunction for consistency
export type Response<ResBody = any, LocalsObj = Record<string, any>> = ExpressResponse<ResBody, LocalsObj>;
export type { NextFunction };

// Type for async route handlers
export type AsyncRequestHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  LocalsObj = Record<string, any>
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
  res: Response<ResBody, LocalsObj>,
  next: NextFunction
) => Promise<void>;

// Type for sync route handlers
export type RequestHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  LocalsObj = Record<string, any>
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
  res: Response<ResBody, LocalsObj>,
  next: NextFunction
) => void;
