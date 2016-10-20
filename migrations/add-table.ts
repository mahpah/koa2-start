'use strict'
import r from '../app/lib/rethink'
import { config } from '../app/config/db'

export function up(next: Function) {
	r.dbCreate(config.db)
		.run(next)
}

export function down(next: Function) {
	r.dbDrop(config.db)
		.run(next)
}
