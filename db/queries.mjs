import { initDB } from './tools.mjs';

export default {
  connect: () => {

    const db = initDB(process.env.DATABASE_NAME);

    const tables = { users: true }

    return {
      GET: async table => {
        if (!tables[table]) throw "Table does not exist"
        const results = await db.query('SELECT * FROM ' + table + ' ORDER BY id ASC')
        return { status: 200, data: results.rows };
      },

      getUserById: (request, response) => {
        const id = parseInt(request.params.id)

        db.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
          if (error) {
            throw error
          }
          response.status(200).json(results.rows)
        })
      },

      createUser: (request, response) => {
        const { name, email } = request.body

        db.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email], (error, results) => {
          if (error) {
            throw error
          }
          response.status(201).send(`User added with ID: ${result.insertId}`)
        })
      },

      updateUser: (request, response) => {
        const id = parseInt(request.params.id)
        const { name, email } = request.body

        db.query(
          'UPDATE users SET name = $1, email = $2 WHERE id = $3',
          [name, email, id],
          (error, results) => {
            if (error) {
              throw error
            }
            response.status(200).send(`User modified with ID: ${id}`)
          }
        )
      },

      deleteUser: (request, response) => {
        const id = parseInt(request.params.id)

        db.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
          if (error) {
            throw error
          }
          response.status(200).send(`User deleted with ID: ${id}`)
        })
      },
    }
  }
}
