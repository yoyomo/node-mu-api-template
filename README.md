# MU-API
Model Update API template for Nodejs

Modular API using postgresql and nodejs. What I love about rails's easy database setup and development, now in Nodejs. So, there is no need to even use `psql` with these sets of commands. Everything should be as simple and clean as `node db create`.

## Getting started

```bash
git clone git@github.com:yoyomo/node-mu-api-template.git mu-api
cd mu-api
```

And then `npm start` or, `npm run dev`.

### Requirements
- Postgresql: 
```bash
brew install postgresql
brew services start postgresql
```

- Node

### Basics
The Api basically works by using:
```js
import db from './db/core/queries.mjs';

const query = db.connect(tables);

response = await query(table)[method](url.query, data);

```

where `tables` is just an object that represents all the tables in the database, `table` is the table's name, `method` the request's method, `url.query` is the parsed query from the url, and `data` is any incoming json data.

A more clear example lies in `index.mjs`

### Build the API
Environment variables in your `mu-api.env` file should reflect the ones defined in `mu-api.env.example`. In order for the following commands to work.
Or just run `source mu-api.env.example ` for now.

```bash
node db init # creates a user in pg
node db create # creates a dabatase
node db migrate # runs a migration for directories under db/migrate/[timestamp]-*/up.sql
node db seed # runs the seeds file under ./db/seed.sql
```

#### Generate Migrations
```bash
node db generate migration create_notes
```
or better yet,
```bash
node db generate model notes
```

and then edit the generated SQL file under `db/migrate` and the resource file under `./db/resources/notes.mjs`. Now `node db migrate` should do something!

#### Undo's
```bash
node db rollback # undos last migration under db/migrate/[timestamp]-*/down.sql
node db drop # drops database
node db uninit # deletes user
```

### Console
A custom console that has access to the database functions is available through:
```bash
npm run console
```
