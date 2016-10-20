import { Context } from 'koa'

export const responseTime = (header = 'K-ResponseTime') =>
	async (ctx: Context, next: Function) => {
		const start = Date.now()
		await next()
		const end = Date.now()
		ctx.set(header, (end - start).toString())
	}
