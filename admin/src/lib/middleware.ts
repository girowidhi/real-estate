// Creates a pipeline of middleware functions for API routes
export function createMiddleware(...middleware: Array<(req: Request) => Response | Promise<Response | null> | null>) {
  return async function handler(req: Request) {
    for (const mw of middleware) {
      const result = await mw(req);
      if (result) return result;
    }
    return null;
  };
}

// CORS headers for admin API
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_ADMIN_URL || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}
