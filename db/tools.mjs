import pg from 'pg'

const DBHeadConfig = {
  host: process.env.DATABASE_HOST,
  database: 'postgres',
  port: parseInt(process.env.DATABASE_PORT)
}

const DBUserConfig = {
  ...DBHeadConfig,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
}

export const initDB = (databaseName = 'postgres') => (
  new pg.Pool({
    ...DBUserConfig,
    database: databaseName,
  })
)

const transaction = async (pool, trans) => {
  try {
    await trans(pool)
  } catch (e) {
    console.error('Error: ', e.message);
  } finally {
    pool.end();
  }
}

export default {
  init: async () => {
    console.log('Creating user "' + process.env.DATABASE_USER + '"...');

    transaction(new pg.Pool({ ...DBHeadConfig }), async pool => {
      await pool.query('CREATE USER "' + process.env.DATABASE_USER + '" CREATEDB;')
      console.log('User "' + process.env.DATABASE_USER + '" created!');
    });
  },
  uninit: async () => {
    console.log('Deleting user "' + process.env.DATABASE_USER + '"...');

    transaction(new pg.Pool({ ...DBHeadConfig }), async pool => {
      await pool.query('DROP ROLE "' + process.env.DATABASE_USER + '";')
      console.log('User "' + process.env.DATABASE_USER + '" deleted.');
    });
  },
  create: async () => {
    console.log('Creating database "' + process.env.DATABASE_NAME + '"...');

    transaction(initDB(), async db => {
      await db.query('CREATE DATABASE "' + process.env.DATABASE_NAME + '";')
      console.log('Successfully created database "' + process.env.DATABASE_NAME + '"!');
    })
  },
  drop: async () => {
    console.log('Dropping database "' + process.env.DATABASE_NAME + '"...');


    transaction(initDB(), async db => {
      await db.query('DROP DATABASE "' + process.env.DATABASE_NAME + '";');
      console.log('Database "' + process.env.DATABASE_NAME + '" has been dropped.')
    });
  },
  migrate: async () => {
    console.log('Migrating "' + process.env.DATABASE_NAME + '"...');

    transaction(initDB(process.env.DATABASE_NAME), async db => {
      await db.query('CREATE TABLE IF NOT EXISTS "migrations" (ts timestamp, created_at timestamp);');

      const pastMigrations = (await db.query('SELECT EXTRACT(EPOCH from ts) as ts from "migrations"')).rows;

      console.log('Ignoring past migrations: ', pastMigrations.map(m => m.ts));

      // TODO: read files and timestamps from ./migrate/ folder
      // and compare if it has run or not

      const now = new Date().getTime() / 1000 | 0;

      await db.query('CREATE TABLE "users" (\
          id serial,\
          name text,\
          age int\
          )')

      await db.query('INSERT INTO "migrations" (ts, created_at) VALUES (to_timestamp($1), now())', [now])

      // TODO: accumulate new migrations

      const newMigrations = (await db.query('SELECT EXTRACT(EPOCH from ts) as ts from "migrations"')).rows;

      console.log('New migrations: ', newMigrations.map(m => m.ts));

      console.log('Migration complete!');
    });

  }
}