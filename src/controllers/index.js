import { createInterface } from "node:readline";
import { stdin, stdout, chdir } from "node:process";
import { homedir } from "node:os";

import Model from "../models/index.js";
import View from "../views/index.js";
import { commands } from "../commands/commandDescriptors.js";
import parseCommand from "../utils/parseCommand.js";
import getCommandMetadata from "../utils/getCommandMetadata.js";

class CommandController {
  #model = new Model();
  #view = new View(this.#model);

  async run() {
    chdir(homedir());

    const readLine = createInterface({
      input: stdin,
      output: stdout,
    });

    this.#view.update(commands.greeting);

    readLine
      .on("line", (input) => {
        const parsedCommand = parseCommand(input);
        const { isValid, commandKey } = getCommandMetadata(parsedCommand);

        if (isValid) {
          this.#view.update(commandKey, ...parsedCommand.arguments);
        } else {
          this.#view.update(commands.invalidCommand);
        }
      })
      .on("close", () => {
        this.#view.update(commands.exit);
      });
  }
}

export default CommandController;
