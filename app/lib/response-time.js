export const responseTime = (header = 'K-ResponseTime') =>
  async (ctx, next) => {
    const start = Date.now();
    await next();
    const end = Date.now();
    ctx.set(header, end - start);
  };
