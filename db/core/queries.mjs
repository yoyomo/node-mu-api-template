import { initDB } from './commands.mjs';

export default {
  connect: (tables) => {

    const db = initDB();

    return table => {
      if (!tables[table]) throw {message: `Table "${table}" does not exist.`}
      return {
        GET: async (query) => {
          let result = { rows: [] };
          if (query && query.id) {
            result = await db.query('SELECT * FROM "' + table + '" WHERE id = $1 LIMIT 1', [query.id])
          } else {
            result = await db.query('SELECT * FROM "' + table + '" ORDER BY id ASC')
          }
          return { status: 200, data: result.rows };
        },
        DELETE: async (query) => {
          const result = await db.query(`DELETE FROM "${table}" WHERE id = $1 RETURNING *`, [query.id]);
          return {status: 200, data: result.rows};
        },
        POST: async (_query, data) => {

          let sql = `INSERT INTO "${table}" (`;
          let sqlValues = ' VALUES ('
          let inputs = [];
          Object.keys(data).map((attr, i) => {
            if(!(attr in tables[table])) throw {message: `Invalid parameter: "${attr}" in table "${table}"`};

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
        PATCH: async(query, data) => {

          let sql = `UPDATE "${table}" SET`;
          let inputs = [];
          Object.keys(data).map((attr, i) => {
            if(!(attr in tables[table])) throw {message: `Invalid parameter: "${attr}" in table "${table}"`};

            if(i > 0){
              sql += ','
            }
            sql += ` ${attr} = $${i+1}`;
            inputs.push(data[attr])
          })
          sql += ` WHERE id = $${inputs.length+1} RETURNING *`;
          inputs.push(query.id);

          const result = await db.query(sql, inputs);
          return { status: 200, data: result.rows };
        },
      }
    }
  }
}
