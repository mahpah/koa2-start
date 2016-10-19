'use strict';
const TableName = 'accounts';
import r from '../app/lib/rethink';

export function up(next) {
  r.tableCreate(TableName)
    .run(next);
}

export function down(next) {
  r.tableDrop(TableName)
    .run(next);
}
