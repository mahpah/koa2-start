import r from '../lib/rethink'
import * as bcrypt from 'bcrypt-as-promised'
export const TableName = 'accounts'
import { rethinkModelFactory } from './rethink-model'

export class Account extends rethinkModelFactory(TableName) {
	username: string
	name: string
	private _newPassword: boolean
	private _password: string

	static async findByUsername(username) {
		let result = await r.table(Account.tableName)
			.filter({ username })
			.run()

		if (result && result.length === 1) {
			return new Account(result[0])
		}

		return undefined
	}

	static validate(input) {
		const schema = {
			username: 'string',
			password: 'string',
		}

		let isValid = true
		let sanitized = {}

		Object.keys(schema).forEach(key => {
			let type: any = schema[key]
			if (!input[key] || typeof input[key] !== type) {
				isValid = false
			} else {
				sanitized[key] = input[key]
			}
		})

		if (isValid) {
			return sanitized as Account
		}

		return undefined
	}

	constructor(params?: any) {
		super(params)
	}

	async save() {
		await this.hashPassword()
		let data = Account.validate(this)
		let result: any
		if (!data) {
			return undefined
		}

		if (this.id) {
			result = await r.table(Account.tableName)
				.get(this.id)
				.update(data)
				.run()
		} else {
			result = await r.table(Account.tableName)
				.insert(data)
				.run()
			if (result && result.inserted === 1) {
				this.id = result.generated_keys[0]
			}
		}

		return result
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

	private async hashPassword() {
		if (this._newPassword) {
			let salt = await bcrypt.genSalt(10)
			this.password = await bcrypt.hash(this.password, salt)
			this._newPassword = false
		}
	}
}

