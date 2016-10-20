import * as Koa from 'koa'
import { Context } from 'koa'
import { responseTime } from './lib/response-time'
import routes from './routes'
import * as parser from 'koa-bodyparser'

const app = new Koa()
app.use(responseTime())
app.use(parser())
app.use(routes())

app.use(async (ctx: Context) => {
	ctx.body = 'Hello'
})

export default app
