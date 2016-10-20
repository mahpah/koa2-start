import * as Router from 'koa-router'
import { authenticate } from './api/authenticate'

let appRoute = new Router()
authenticate(appRoute)

export default appRoute.routes.bind(appRoute)
