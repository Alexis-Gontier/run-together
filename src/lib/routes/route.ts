import { type MiddlewareFunction, createZodRoute } from "next-zod-route";
import { auth } from "@/lib/auth/auth";
import type { User as BetterAuthUser } from "better-auth/types";

/**
 * Extended User type with Better Auth plugins fields
 */
type User = BetterAuthUser & {
  username?: string | null;
  displayUsername?: string | null;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
};

/**
 * Custom error class for route handlers--
 * Allows throwing errors with custom HTTP status codes
 */
export class RouteError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "RouteError";
    this.status = status;
  }
}

/**
 * Base route creator with custom error handling
 * Handles RouteError instances with their specified status codes
 * Returns generic 500 error for unhandled errors to avoid information leakage
 */
export const route = createZodRoute({
  handleServerError: (error: Error) => {
    // Log error for debugging (in production, use proper logging service)
    console.error("[Route Error]", error);

    // Handle custom RouteError with specific status codes
    if (error instanceof RouteError) {
      return new Response(
        JSON.stringify({
          message: error.message,
          status: error.status
        }),
        {
          status: error.status || 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Default error response (avoid exposing internal details)
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        status: 500
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  },
});

/**
 * Authentication middleware
 * Validates user session and adds user to context
 * Throws 401 Unauthorized if no valid session found
 */
export const authMiddleware: MiddlewareFunction<{}, { user: User }> = async ({ request, next }) => {
  try {
    // Get session from Better Auth using request headers
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is authenticated
    if (!session?.user) {
      throw new RouteError("Unauthorized - No valid session found", 401);
    }

    const user = session.user as User;

    // Continue with user in context
    return await next({
      ctx: { user },
    });
  } catch (error) {
    // Re-throw RouteError or wrap other errors
    if (error instanceof RouteError) {
      throw error;
    }
    throw new RouteError("Authentication failed", 401);
  }
};

/**
 * Pre-configured authenticated route
 * Automatically includes authentication middleware
 * Usage: authRoute.handler((req, ctx) => { ... })
 */
export const authRoute = route.use(authMiddleware);
