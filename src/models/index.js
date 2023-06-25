import { argv } from "node:process";
import { homedir } from "node:os";

class Model {
  #userName;
  #currentWorkingDirectory;
  #currentOperation;

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

  #init() {
    const { userName } = this.#parseArgs();

    this.#userName = userName;
    this.#currentWorkingDirectory = homedir();
  }

  constructor() {
    this.#init();
  }

  get userName() {
    return this.#userName;
  }

  get currentWorkingDirectory() {
    return this.#currentWorkingDirectory;
  }

  set currentWorkingDirectory(value) {
    this.#currentWorkingDirectory = value;
  }
}

export default Model;
