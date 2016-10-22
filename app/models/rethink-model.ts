import r from '../lib/rethink'

export const rethinkModelFactory = (tableName) => {
	return class RethinkModel {
		protected static tableName: string = tableName
		id: string

		static validate(input: any): RethinkModel | undefined {
			return input as RethinkModel
		}

		static async remove(id) {
			let result = await r.table(RethinkModel.tableName)
				.get(id)
				.delete()
				.run()
			return result ? result.deleted === 1 : false
		}

		static async get(id) {
			let result = await r.table(RethinkModel.tableName)
				.get(id)
				.run()
			if (result) {
				return new RethinkModel(result)
			}

			return undefined
		}

		// TODO: ban this unsafe method
		static async find(crit: Object) {
			let result = await r.table(RethinkModel.tableName)
				.filter(crit)
				.run()

			if (result) {
				return result.map(item => new RethinkModel({
					username: item.username,
					id: item.id,
				}))
			}

			return undefined
		}

		constructor(params?) {
			if (typeof params === 'object') {
				Object.assign(this, params)
			}
		}

		async save() {
			let data = RethinkModel.validate(this)
			let result: any
			if (!data) {
				return undefined
			}

			if (this.id) {
				result = await r.table(RethinkModel.tableName)
					.get(this.id)
					.update(data)
					.run()
			} else {
				result = await r.table(RethinkModel.tableName)
					.insert(data)
					.run()
				console.log('base', result)
				if (result && result.inserted === 1) {
					this.id = result.generated_keys[0]
				}
			}

			return result
		}
	}
}
