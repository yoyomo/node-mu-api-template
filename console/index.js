import repl from 'repl';
import pg from 'pg';
import dbCommands from '../db/core/commands.mjs';
import db from '../db/core/queries.mjs';

import { tables } from '../db/resources.mjs';

const query = db.connect(tables);

const main = async () => {
  let console = repl.start({ prompt: '% ' });

  console.context.pg = pg;
  console.context.dbCommands = dbCommands;
  console.context.tables = tables;
  console.context.query = query;

  console.setupHistory('./console/.history', () => {});
}

main();