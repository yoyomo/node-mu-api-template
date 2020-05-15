import pg from 'pg'
import fs from 'fs';
import util from 'util';

const readDirectory = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

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

      const pastMigrations = (await db.query('SELECT EXTRACT(EPOCH from ts)::integer as ts from "migrations"')).rows.map(m => m.ts);

      let newMigrationFiles = [];

      const filenames = await readDirectory('./db/migrate');

      for (let filename of filenames) {
        const timestamp = parseInt(filename.split('-')[0]);

        if (pastMigrations.includes(timestamp)) continue;

        newMigrationFiles.push(filename);

        const sql = await readFile(`./db/migrate/${filename}`, 'utf-8');

        await db.query(sql)

        await db.query('INSERT INTO "migrations" (ts, created_at) VALUES (timezone(\'utc\', to_timestamp($1)), now())', [timestamp])

      }

      console.log('Migrated: ', [''].concat(newMigrationFiles).join('\n\t'));

      console.log('Migration complete!');
    });

  },
  generate: async (options) => {
    transaction(initDB(process.env.DATABASE_NAME), async db => {

      const subcommands = {
        migration: async (migrationName) => {
          if (!migrationName) throw { message: 'USAGE: node db generate migration FILENAME' };

          const now = (await db.query('SELECT EXTRACT(EPOCH from timezone(\'utc\', now()))::integer as ts')).rows[0].ts;

          const migrationFilename = `./db/migrate/${now}-${migrationName}.sql`

          await mkdir('./db/migrate', { recursive: true });
          await writeFile(migrationFilename, '');

          console.log(`Created migration file ${migrationFilename}`);
        }
      }

      const subcommand = options[0];

      if (!subcommands[subcommand]) throw { message: 'USAGE: node db generate [migration] [options]' };

      await subcommands[subcommand](options[1])
    })
  }
}