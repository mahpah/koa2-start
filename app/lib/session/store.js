import dash from 'rethinkdbdash';
const DBName = 'sessiondb';
const TableName = 'session';
const TokenFieldName = 'token';
const r = dash({ db: DBName });

export const add = async (token, session) => {
  session[TokenFieldName] = token;
  return await r.table(TableName)
    .insert(session)
    .run();
};

export const findByToken = async (token) => {
  let result = await r.table(TableName)
    .filter({
      [TokenFieldName]: token,
    })
    .run();

  if (result && result.length === 1) {
    return result[0];
  }

  return undefined;
};

export const update = async (token, session) => {
  let result = await r.table(TableName)
    .filter({
      [TokenFieldName]: token,
    })
    .update(session)
    .run();

  return result;
};

export const remove = async (token) =>
  await r.table(TableName)
    .filter({
      [TokenFieldName]: token,
    })
    .delete()
    .run();


export const tryMigrate = async () => {
  try {
    await r.dbCreate(DBName).run();
    await r.tableCreate(TableName).run();
    await r.table(TableName).indexCreate(TokenFieldName).run();
  } catch (e) {
    /* eslint-disable */
    console.log('ERROR: migrate database error');
    console.log(e);
    console.log('==============================');
    /* eslint-enable */
  }
};
