
import CommandController from "./controllers/index.js";

class App {
  #commandController = new CommandController();

  start() {
    this.#commandController.run();
  }
}

export default new App();
