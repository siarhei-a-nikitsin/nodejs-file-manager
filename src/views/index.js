import { cwd, exit } from "node:process";
import { resolve } from "node:path";

import { commands } from "../commands/commandDescriptors.js";

import {
  readFile,
  createEmptyFile,
  renameFile,
  copyFile,
  removeFile,
  moveFile,
  calculateHash,
  compressFile,
  decompressFile,
} from "../services/fsService.js";
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

  #handleFailedCommand = () => {
    log(errorMessages.failedOperation);
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
  #showFileContent = async (filePath) => {
    const content = await readFile(resolve(cwd(), filePath));

    log(content);
  };

  #createEmptyFile = async (fileName) => {
    await createEmptyFile(resolve(cwd(), fileName));
  };

  #renameFile = async (filePath, newFileName) => {
    await renameFile(filePath, newFileName);
  };

  #copyFile = async (filePath, destinationFolderPath) => {
    await copyFile(
      resolve(cwd(), filePath),
      resolve(cwd(), destinationFolderPath)
    );
  };

  #moveFile = async (filePath, destinationFolderPath) => {
    await moveFile(
      resolve(cwd(), filePath),
      resolve(cwd(), destinationFolderPath)
    );
  };

  #deleteFile = async (filePath) => {
    await removeFile(resolve(cwd(), filePath));
  };

  #calculateFileHash = async (filePath) => {
    const fileHash = await calculateHash(resolve(cwd(), filePath));

    log(fileHash);
  };

  #compressFile = async (filePath, destinationFolderPath) => {
    await compressFile(filePath, destinationFolderPath);
  };

  #decompressFile = async (filePath, destinationFolderPath) => {
    await decompressFile(filePath, destinationFolderPath);
  };

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

  get #handlerMap() {
    return new Map([
      [commands.greeting, this.#handleGreeting],
      [commands.invalidCommand, this.#handleInvalidCommand],
      [commands.failedCommand, this.#handleFailedCommand],
      [commands.exit, this.#handleExit],
      // Nav
      [commands.folderUp, this.#folderUp],
      [commands.moveToFolder, this.#goToFolder],
      [commands.showDirectoryContent, this.#showDirectoryContent],
      // File management
      [commands.showFileContent, this.#showFileContent],
      [commands.createEmptyFile, this.#createEmptyFile],
      [commands.renameFile, this.#renameFile],
      [commands.copyFile, this.#copyFile],
      [commands.moveFile, this.#moveFile],
      [commands.deleteFile, this.#deleteFile],
      [commands.calculateFileHash, this.#calculateFileHash],
      [commands.compressFile, this.#compressFile],
      [commands.decompressFile, this.#decompressFile],
      // OS info
      [commands.getEOL, this.#getOsEOL],
      [commands.getCPUS, this.#getOsCpus],
      [commands.getHomeDir, this.#getOsHomeDir],
      [commands.getCurrentSystemUserName, this.#getOsCurrentSystemUserName],
      [commands.getCpuArchitecture, this.#getOsCpuArchitecture],
    ]);
  }

  update = async (command, ...args) => {
    const handler = this.#handlerMap.get(command);

    if (handler) {
      try {
        await handler(...args);
      } catch (error) {
        // log(error); // for debug

        log(errorMessages.failedOperation);
      }
    }

    if (command !== commands.exit) {
      this.#printCurrentWorkingDirectory();
    }
  };
}

export default View;
