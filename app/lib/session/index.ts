import * as uuid from 'node-uuid'
import * as store from './store'

export const session = () => {
	let cookieName = 'koa.sid'
	let cookieOptions = {
		httpOnly: true,
		path: '/',
		overwrite: true,
		signed: true,
		maxAge: 864e5,
	}
	let isMigrated = false

	const loadToken = async (ctx) => {
		let token = ctx.cookies.get(cookieName)
		if (token) {
			ctx.session = await store.findByToken(token)
		}

		ctx.session = ctx.session || {}
		return token
	}

	const saveSession = async (ctx, token) => {
		let isNew = false
		if (!token) {
			isNew = true
			token = uuid.v1()
		}

		ctx.cookies.set(cookieName, token, cookieOptions)
		if (ctx.session) {
			if (isNew) {
				await store.add(token, ctx.session)
			} else {
				await store.update(token, ctx.session)
			}
		}

		if (!ctx.session) {
			await store.remove(token)
		}
	}

	return async (ctx, next) => {
		if (!isMigrated) {
			await store.tryMigrate()
			isMigrated = true
		}

		let token = await loadToken(ctx)
		await next()
		await saveSession(ctx, token)
	}
}
