import { config } from './../config/db'
import * as dash from 'rethinkdbdash'

export const r = dash(config)
export default r
