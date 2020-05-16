import {Model} from './model.mjs';

export const usersModel = {
  users: {
    model: {
      ...Model,
      name: '', age: 0
    },
    update: (db, queries) => ({
      GET: {
        namesWithJ: async () => {
          console.log('All users', await queries('users').GET());
          const result = await db.query('SELECT * FROM "users" WHERE name LIKE \'%J%\'')
          return { status: 200, data: result.rows }
        }
      }
    })
  }
}