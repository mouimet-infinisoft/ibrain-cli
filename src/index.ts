import { Command } from "commander";
import { config } from "dotenv";
import { initialization } from "./core/initialization/initialization";
import { chatCommand } from "./commands/chatCommand";
import { chatAPICommand } from "./commands/chatAPICommand";
import figlet from 'figlet';

config();

export const container = initialization();

const program = new Command();
program.version("1.0.0");

// Welcome banner
console.log(figlet.textSync('IBrain CLI', {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default'
}));

program
  .command("chat")
  .description("Chat with iBrain")
  .action(async () => {
    try {
      await chatCommand();
    } catch (e) {
      console.error(e);
    }
  });
program
  .command("api")
  .description("API Chat with iBrain")
  .action(async () => {
    try {
      await chatAPICommand();
    } catch (e) {
      console.error(e);
    }
  });

program.parse(process.argv);
