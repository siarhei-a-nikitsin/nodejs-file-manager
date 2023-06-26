import { createInterface } from "node:readline";
import { stdin, stdout, chdir } from "node:process";
import { homedir } from "node:os";

import CommandExecutor from "./commandExecutor.js";
import { commands } from "./commands/commandDescriptors.js";
import parseCommand from "./utils/parseCommand.js";
import getCommandMetadata from "./utils/getCommandMetadata.js";

class App {
  #commandExecutor = new CommandExecutor();

  run() {
    chdir(homedir());

    const readLine = createInterface({
      input: stdin,
      output: stdout,
    });

    this.#commandExecutor.exec(commands.greeting);

    readLine
      .on("line", (input) => {
        const parsedCommand = parseCommand(input);
        const { isValid, commandKey } = getCommandMetadata(parsedCommand);

        if (isValid) {
          this.#commandExecutor.exec(commandKey, ...parsedCommand.arguments);
        } else {
          this.#commandExecutor.exec(commands.invalidCommand);
        }
      })
      .on("close", () => {
        this.#commandExecutor.exec(commands.exit);
      });
  }
}

export default App;
