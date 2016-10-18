import { config } from './../config/db.js';
import dash from 'rethinkdbdash';

export const r = dash(config);
export default r;
