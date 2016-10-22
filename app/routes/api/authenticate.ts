import * as jwt from 'jsonwebtoken'
import { TokenKey } from '../../config/key'
import { Account } from '../../models/account'
import { Context } from 'koa'

const validateAccount = async (username, password) => {
	if (!username || !password) {
		return false
	}

	let user = await Account.findByUsername(username)
	if (!user) {
		return false
	}

	let isUserValid = await user.isPassword(password)
	return isUserValid ? user : false
}

const extractTokenFromHeader = async (ctx, next) => {
	let authorization = ctx.get('authorization')
	if (!authorization.match(/^Bearer\s/)) {
		ctx.status = 401
		return
	}
	let token = authorization.slice(7)
	ctx.state.token = token
	await next()
}

const extractTokenFromQuery = async (ctx, next) => {
	let { access_token: token } = ctx.query
	ctx.state.token = token
	await next()
}

const validateToken = async (ctx: Context, next) => {
	let { token } = ctx.state
	try {
		let payload = jwt.verify(token, TokenKey)
		let { id: userId } = payload
		let account = await Account.get(userId) as Account

		if (!account) {
			ctx.body = {
				message: 'Invalid token',
			}
			ctx.status = 401

			return
		}

		let { id, username } = account
		ctx.state.account = {
			id,
			username,
		}

		await next()
	} catch (e) {
		ctx.status = 401
		if (e instanceof jwt.JsonWebTokenError) {
			ctx.body = {
				message: 'Invalid token',
			}
			return
		}

		if (e instanceof jwt.TokenExpiredError) {
			ctx.body = {
				message: 'Token expired',
			}
			return
		}

		ctx.body = e
		return
	}
}

const generateToken = (account) => {
	let claim = {
		id: account.id,
		username: account.username,
	}

	let body = {
		access_token: jwt.sign(claim, TokenKey, {
			expiresIn: 60 * 60,
		}),
		username: account.username,
		id: account.id,
	}
	return body
}

export const authenticate = (route) => {
	route.all('/authenticate', async (ctx) => {
		let { username, password } = ctx.request.body
		let user = await validateAccount(username, password)

		if (user) {
			ctx.body = generateToken(user)
			return
		}

		ctx.status = 403
		ctx.body = {
			message: 'Wrong username or password',
		}
		return
	})

	route.get(
		'/me',
		extractTokenFromHeader,
		validateToken,
		async (ctx) => {
			ctx.body = ctx.state.account
			return
		}
	)

	route.get(
		'/refresh_token',
		extractTokenFromQuery,
		validateToken,
		(ctx) => {
			let { account } = ctx.state
			ctx.body = generateToken(account)
		}
	)
}
