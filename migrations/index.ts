import * as table from './add-table'
import * as user from './add-users'

let action = process.argv[2]

if (action !== 'up' && action !== 'down') {
	throw 'Unknown action'
}

try {
	table[action](() => {
		user[action](() => {
			console.log('ok')
			process.exit(0)
		})
	})
} catch (e) {
	console.log('Error', e)
}

