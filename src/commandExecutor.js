import { cwd, exit, chdir, argv } from "node:process";
import { resolve } from "node:path";

import { commands } from "./commands/commandDescriptors.js";

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
} from "./services/fsService.js";
import { goUp } from "./services/navService.js";
import {
  getEOL,
  getCpuInfo,
  getHomedir,
  getSystemUserName,
  getArchitecture,
} from "./services/osService.js";
import { printCWDTable } from "./utils/getTable.js";
import { Writable } from "node:stream";

const logInfo = console.info;
const log = console.log;
const logError = console.error;

const errorMessages = {
  invalidOperation: "Invalid input",
  failedOperation: "Operation failed",
};

class CommandExecutor {
  #userName;

  #parseArgs() {
    let userName = "Unknown";

    const userNameParamName = "username";

    const allAppParams = argv.slice(2);

    const userNameParam = allAppParams.filter((param) =>
      param.startsWith(`--${userNameParamName}=`)
    )?.[0];

    if (userNameParam) {
      const parsedUserName = userNameParam.split("=")[1];

      if (parsedUserName) {
        userName = parsedUserName;
      }
    }

    return {
      userName,
    };
  }

  constructor() {
    const { userName } = this.#parseArgs();

    this.#userName = userName;
  }

  // Service operations
  #logCWD = () => {
    logInfo(`You are currently in ${cwd()}`);
  };

  #handleGreeting = () => {
    logInfo(`Welcome to the File Manager, ${this.#userName}!`);
  };

  #handleExit = () => {
    logInfo(`Thank you for using File Manager, ${this.#userName}, goodbye!`);

    process.nextTick(() => exit());
  };

  #handleInvalidCommand = () => {
    logError(errorMessages.invalidOperation);
  };

  #handleFailedCommand = () => {
    logError(errorMessages.failedOperation);
  };

  // Nav operations
  #folderUp = () => {
    const newCurrentWorkingDirectory = goUp(cwd());

    chdir(newCurrentWorkingDirectory);
  };

  #goToFolder = (path) => {
    const newPath = resolve(cwd(), path);

    chdir(newPath);
  };

  #showDirectoryContent = async () => {
    await printCWDTable();
  };

  // File operations
  #showFileContent = async (filePath) => {
    await readFile(
      resolve(cwd(), filePath),
      // fix issue when pass just stdout instead
      new Writable({
        decodeStrings: false,
        write(chunk, _, cb) {
          log(chunk);

          cb();
        },
      })
    );

    console.log(getEOL());
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
    const { cpusAmount, cpus } = getCpuInfo();

    log(`Overall amount of CPUs: ${cpusAmount}`);

    console.table(cpus);
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

  exec = async (command, ...args) => {
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
      this.#logCWD();
    }
  };
}

export default CommandExecutor;
