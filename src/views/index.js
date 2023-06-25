import { exit } from "node:process";

import { commands } from "../commands/commandDescriptors.js";

import {} from "../services/fsService.js";
import { goUp, goToFolder } from "../services/navService.js";
import {
  getEOL,
  getCpus,
  getHomedir,
  getSystemUserName,
  getArchitecture,
} from "../services/osService.js";

const log = console.log;

const errorMessages = {
  invalidOperation: "Invalid input",
  failedOperation: "Operation failed",
};

class View {
  #model;

  constructor(model) {
    this.#model = model;
  }

  // Service operations
  #printCurrentWorkingDirectory = () => {
    log(`You are currently in ${this.#model.currentWorkingDirectory}`);
  };

  #handleGreeting = () => {
    log(`Welcome to the File Manager, ${this.#model.userName}!`);
  };

  #handleExit = () => {
    log(`Thank you for using File Manager, ${this.#model.userName}, goodbye!`);

    process.nextTick(() => exit());
  };

  #handleInvalidCommand = () => {
    log(errorMessages.invalidOperation);
  };

  // Nav operations
  #folderUp = () => {
    const newCurrentWorkingDirectory = goUp(
      this.#model.currentWorkingDirectory
    );

    this.#model.currentWorkingDirectory = newCurrentWorkingDirectory;
  };

  #goToFolder = (folderPath) => {
    const newCurrentWorkingDirectory = goToFolder(
      this.#model.currentWorkingDirectory,
      folderPath
    );

    this.#model.currentWorkingDirectory = newCurrentWorkingDirectory;
  };

  #showDirectoryContent = () => {
    // TODO: implement
  };

  // File operations
  // TODO: implement

  // OS info operations
  #getOsEOL() {
    const printedEOL = JSON.stringify(getEOL());

    log(printedEOL);
  }

  #getOsCpus() {
    log(getCpus());
  }

  #getOsHomeDir() {
    log(getHomedir());
  }

  #getOsCurrentSystemUserName() {
    log(getSystemUserName());
  }

  #getOsCpuArchitecture() {
    log(getArchitecture());
  }

  // Hash calculation operations
  // TODO: implement

  // Compress and decompress operations
  // TODO: implement

  get #handlerMap() {
    return new Map([
      [commands.greeting, this.#handleGreeting],
      [commands.invalidCommand, this.#handleInvalidCommand],
      [commands.exit, this.#handleExit],
      //
      [commands.folderUp, this.#folderUp],
      [commands.moveToFolder, this.#goToFolder],
      [commands.showDirectoryContent, this.#showDirectoryContent],
      //
      // [commands.showFileContent, this.#],
      // [commands.createEmptyFile, this.#],
      // [commands.renameFile, this.#],
      // [commands.copyFile, this.#],
      // [commands.moveFile, this.#],
      // [commands.deleteFile, this.#],
      //
      [commands.getEOL, this.#getOsEOL],
      [commands.getCPUS, this.#getOsCpus],
      [commands.getHomeDir, this.#getOsHomeDir],
      [commands.getCurrentSystemUserName, this.#getOsCurrentSystemUserName],
      [commands.getCpuArchitecture, this.#getOsCpuArchitecture],
      //
      // [commands.calculateFileHash, this.#],
      //
      // [commands.compressFile, this.#],
      // [commands.decompressFile, this.#],
    ]);
  }

  update(command, ...args) {
    const handler = this.#handlerMap.get(command);

    if (handler) {
      try {
        handler(...args);
      } catch (error) {
        log(errorMessages.failedOperation);
      }
    }

    if (command !== commands.exit) {
      this.#printCurrentWorkingDirectory();
    }
  }
}

export default View;
