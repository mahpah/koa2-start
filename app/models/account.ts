import r from '../lib/rethink'
import * as bcrypt from 'bcrypt-as-promised'
export const TableName = 'accounts'

export class Account {
	id: string
	username: string
	name: string
	private _newPassword: boolean
	private _password: string

	static async findByUsername(username) {
		let result = await r.table(TableName)
			.filter({ username })
			.run()

		if (result && result.length === 1) {
			return new Account(result[0])
		}

		return undefined
	}

	static async remove(id) {
		let result = await r.table(TableName)
			.get(id)
			.delete()
			.run()
		return result ? result.deleted === 1 : false
	}

	static async get(id) {
		let result = await r.table(TableName)
			.get(id)
			.run()
		if (result) {
			return new Account(result)
		}

		return undefined
	}

	// TODO: ban this unsafe method
	static async find(crit: Object) {
		let result = await r.table(TableName)
			.filter(crit)
			.run()

		if (result) {
			return result.map(item => new Account({
				username: item.username,
				id: item.id,
			}))
		}

		return undefined
	}

	constructor(params?: any) {
		if (params && typeof params === 'object') {
			Object.assign(this, params)
		}
	}

	async save() {
		await this._hashPassword()
		let data = this._validate()
		let result: any
		if (!data) {
			return undefined
		}

		if (this.id) {
			result = await r.table(TableName)
				.get(this.id)
				.update(data)
				.run()
		} else {
			result = await r.table(TableName)
				.insert(data)
				.run()
			if (result && result.inserted === 1) {
				this.id = result.generated_keys[0]
			}
		}

		return result
	}

	_validate() {
		const schema = {
			username: 'string',
			password: 'string',
		}

		let isValid = true
		let sanitized = {}

		Object.keys(schema).forEach(key => {
			let type: any = schema[key]
			if (!this[key] || typeof this[key] !== type) {
				isValid = false
			} else {
				sanitized[key] = this[key]
			}
		})

		if (isValid) {
			return sanitized
		}

		return undefined
	}

	/**
	 * mark new password when set password.
	 * Use this trick in order to prevent hash function to be called
	 * everytime user is saved
	 */
	get password() {
		return this._password
	}

	set password(value) {
		this._password = value
		this._newPassword = true
	}

	async isPassword(value) {
		try {
			return await bcrypt.compare(value, this.password)
		} catch (e) {
			if (e instanceof bcrypt.MISMATCH_ERROR) {
				return false
			}

			throw e
		}
	}

	private async _hashPassword() {
		if (this._newPassword) {
			let salt = await bcrypt.genSalt(10)
			this.password = await bcrypt.hash(this.password, salt)
			this._newPassword = false
		}
	}
}

