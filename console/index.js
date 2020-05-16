import repl from 'repl';
import pg from 'pg';
import dbCommands from '../db/core/commands.mjs';
import DB from '../db/core/queries.mjs';

import { models } from '../db/resources/index.mjs';

const db = DB.connect(models);

let console = repl.start({ prompt: '% ' });

console.context.pg = pg;
console.context.dbCommands = dbCommands;
console.context.models = models;
console.context.db = db;

console.setupHistory('./console/.history', () => { });