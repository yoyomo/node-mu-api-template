import {Model} from './model.mjs';

export const UsersModel = {
  users: {
    model: {
      ...Model,
      name: '', age: 0
    },
    update: (db) => ({
      GET: {
        namesWithJ: async () => {
          const result = await db.query('SELECT * FROM "users" WHERE name LIKE \'%J%\'')
          return { status: 200, data: result.rows }
        }
      }
    })
  }
}