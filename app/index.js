import Koa from 'koa';

const app = new Koa();

const responseTime = (header = 'K-ResponseTime') =>
  async (ctx, next) => {
    const start = Date.now();
    await next();
    const end = Date.now();
    ctx.set(header, end - start);
  };

app.use(responseTime());

app.use(async (ctx) => {
  ctx.body = 'Hello';
});

export default app;
