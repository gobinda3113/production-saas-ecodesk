import type { ErrorHandler } from "hono";
import { ZodError } from "zod";

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[${c.req.method}] ${c.req.path}:`, err);

  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          requestId: crypto.randomUUID(),
          fieldErrors: err.flatten().fieldErrors,
        },
      },
      400
    );
  }

  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
        requestId: crypto.randomUUID(),
      },
    },
    500
  );
};
