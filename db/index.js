import dbTools from './tools.mjs';

const args = process.argv.slice(2);
const tool = args[0];

if(!tool) {
  console.warn('USAGE: node db [init|uninit|create|drop|migrate|rollback]')
  process.exit(1);
}

dbTools[tool]();