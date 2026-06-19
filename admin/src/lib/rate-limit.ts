const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, maxRequests = 5, windowMs = 900000): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);
  if (!record || now > record.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) return false;
  record.count++;
  return true;
}

// Cleanup old entries every 15 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipRequestCounts.entries()) {
      if (now > record.resetAt) ipRequestCounts.delete(ip);
    }
  }, 900000);
}
