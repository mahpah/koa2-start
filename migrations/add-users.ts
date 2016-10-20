'use strict'
const TableName = 'accounts'
import r from '../app/lib/rethink'

export function up(next: Function) {
	r.tableCreate(TableName)
		.run(next)
}

export function down(next: Function) {
	r.tableDrop(TableName)
		.run(next)
}
