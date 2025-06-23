import { CLI } from './cli';

async function main() {
  const cli = new CLI();
  const program = cli.setupCommands();
  
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error('❌ Erro:', (error as Error).message);
    process.exit(1);
  }
}

main();