import 'babel-polyfill'
import * as request from 'supertest'
import * as Koa from 'koa'
import { session } from './'

const app = new Koa()

app.keys = ['ahihi']

app.use(session())

app.use(async (ctx) => {
	switch (ctx.request.url) {
		case '/setname':
			ctx.session.userName = 'Ha Pham'
			ctx.body = ctx.session.userName
			return

		case '/getname':
			ctx.body = ctx.session.userName
			return

		case '/clear':
			ctx.session = null
			ctx.status = 204
			return

		default:
			ctx.body = 'Hello'
	}
})

let server = app.listen(5001)

describe('Session middleware', () => {
	describe('Session store can value', () => {
		let agent

		before(() => {
			agent = request.agent(server)
		})

		it('should set name in session object', async () => {
			await agent
				.get('/setname')
				.expect(200)
		})
	})

	describe('Session can retrieve value', () => {
		let agent

		before(async () => {
			agent = request.agent(server)
			await agent
				.get('/setname')
				.expect(200)
		})

		it('should retrieve session value', async() => {
			await agent
				.get('/getname')
				.expect('Ha Pham')
		})
	})

	describe('Session can be clear', () => {
		let agent

		before(async () => {
			agent = request.agent(server)
			await agent
				.get('/setname')
				.expect(200)
		})

		it('should retrieve null session', async() => {
			await agent
				.get('/getname')
				.expect('Ha Pham')

			await agent
				.del('/clear')
				.expect(204)

			await agent
				.get('/getname')
				.expect('')
		})
	})
})
