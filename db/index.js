import dbCommands from './core/commands.mjs';

const args = process.argv.slice(2);
const command = args[0];
const params = args.slice(1);

if(!command) {
  console.warn('USAGE: node db [init|uninit|create|drop|migrate|generate|rollback|seed] [options]')
  process.exit(1);
}

dbCommands[command](params);