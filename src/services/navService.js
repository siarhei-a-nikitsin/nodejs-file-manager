import { dirname } from "node:path";

export const goUp = (currentWorkingDirectory) =>
  dirname(currentWorkingDirectory);