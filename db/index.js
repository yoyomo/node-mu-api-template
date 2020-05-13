import dbCommands from './core/commands.mjs';

const args = process.argv.slice(2);
const command = args[0];

if(!command) {
  console.warn('USAGE: node db [init|uninit|create|drop|migrate|rollback]')
  process.exit(1);
}

dbCommands[command]();