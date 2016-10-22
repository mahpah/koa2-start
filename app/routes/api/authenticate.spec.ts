import 'babel-polyfill'
import * as request from 'supertest'
import app from '../../'
import { Account } from '../../models/account'
import { expect } from 'chai'

let server = app.listen(5000)

/**
 * Assume user models is completed.
 */

describe('Api authenticaion', () => {
	let userId
	let username = 'kristin'
	let password = 'secret'

	before(async () => {
		let user = new Account({ username, password })
		await user.save()
		userId = user.id
	})

	after(async () => {
		await Account.remove(userId)
	})

	describe('Generate access token', () => {
		it('should provide user access token', async () => {
			await request.agent(server)
				.post('/authenticate')
				.set('Accept', 'application/json')
				.send({
					username,
					password,
				})
				.expect(200)
				.expect(({ body }) => {
					expect(body.access_token).to.exist
					expect(body.username).to.exist
					expect(body.username).to.equal(username)
					expect(body.id).to.exist
				})
		})

		it('should not authenticate user with wrong password', async () => {
			await request.agent(server)
				.post('/authenticate')
				.set('Accept', 'application/json')
				.send({
					username,
					// eslint-disable-next-line
					password: password + 'asrts',
				})
				.expect({
					message: 'Wrong username or password',
				})
		})
	})

	describe('Using access token', () => {
		let token
		let returnAccountId

		before(async () => {
			await request.agent(server)
				.post('/authenticate')
				.set('Accept', 'application/json')
				.send({
					username,
					password,
				})
				.expect(200)
				.expect(({ body }) => {
					expect(body.access_token).to.exist
					token = body.access_token
					returnAccountId = body.id
				})
		})

		it('should verify access token', async () => {
			await request.agent(server)
				.get('/me')
				.set('Authorization', `Bearer ${token}`)
				.set('Content-Type', 'application/json')
				.expect(200)
				.expect(({ body }) => {
					expect(body.username).to.equal(username)
					expect(body.id).to.equal(returnAccountId)
				})
		})

		it('should not verify malformed access token', async () => {
			await request.agent(server)
				.get('/me')
				.set('Authorization', `Bearer adfa${token}asdf`)
				.set('Content-Type', 'application/json')
				.expect(401)
				.expect(({ body }) => {
					expect(body.message).to.equal('Invalid token')
				})
		})

		it('should not verify malformed request header', async () => {
			await request.agent(server)
				.get('/me')
				.set('Authorization', `aaaa ${token}asdf`)
				.set('Content-Type', 'application/json')
				.expect(401)
		})

		it('should refresh access token', async () => {
			await request.agent(server)
				.get(`/refresh_token?access_token=${token}`)
				.set('Content-type', 'application/json')
				.expect(200)
				.expect(({ body }) => {
					expect(body.access_token).to.exist
					expect(body.username).to.equal(username)
					expect(body.id).to.equal(returnAccountId)
				})
		})
	})
})
