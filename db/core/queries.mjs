import { initDB } from './commands.mjs';

export default {
  connect: (models) => {

    const db = initDB();

    const queries = model => {
      if (!models[model]) throw {message: `Table "${model}" does not exist.`}
      const generalQueries = {
        GET: async (params) => {
          let result = { rows: [] };
          if (params && params.id) {
            result = await db.query('SELECT * FROM "' + model + '" WHERE id = $1 LIMIT 1', [params.id])
          } else {
            result = await db.query('SELECT * FROM "' + model + '" ORDER BY id ASC')
          }
          return { status: 200, data: result.rows };
        },
        DELETE: async (params) => {
          const result = await db.query(`DELETE FROM "${model}" WHERE id = $1 RETURNING *`, [params.id]);
          return {status: 200, data: result.rows};
        },
        POST: async (_params, data) => {

          let sql = `INSERT INTO "${model}" (`;
          let sqlValues = ' VALUES ('
          let inputs = [];
          Object.keys(data).map((attr, i) => {
            if(!(attr in models[model].model)) throw {message: `Invalid parameter: "${attr}" in table "${model}"`};

            if(i > 0){
              sql += ','
              sqlValues += ','
            }
            sql += ` ${attr}`;
            sqlValues += ` $${i+1}`;
            inputs.push(data[attr])
          });
          sql += ')';
          sqlValues += ')';
          sql += `${sqlValues} RETURNING *`;

          const result = await db.query(sql, inputs);
          return {status: 201, data: result.rows};
        },
        PATCH: async(params, data) => {

          let sql = `UPDATE "${model}" SET updated_at=timezone('utc', now())`;
          let inputs = [];
          Object.keys(data).map((attr, i) => {
            if(!(attr in models[model].model)) throw {message: `Invalid parameter: "${attr}" in table "${model}"`};

            sql += ','
            sql += ` ${attr} = $${i+1}`;
            inputs.push(data[attr])
          })
          sql += ` WHERE id = $${inputs.length+1} RETURNING *`;
          inputs.push(params.id);

          const result = await db.query(sql, inputs);
          return { status: 200, data: result.rows };
        },
      }

      return {
        update: () => models[model].update(db, queries),
        ...generalQueries
      }
    }

    return queries;
  }
}
