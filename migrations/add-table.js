'use strict';
import r from '../app/lib/rethink';
import { config } from '../app/config/db';

export function up(next) {
  r.dbCreate(config.db)
    .run(next);
}

export function down(next) {
  r.dbDrop(config.db)
    .run(next);
}
