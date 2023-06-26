import { dirname } from "node:path";

export const goUp = (currentWorkingDirectory) =>
  dirname(currentWorkingDirectory);

export const goToFolder = (currentWorkingDirectory, folderPath) => {
  let newCurrentWorkingDirectory = currentWorkingDirectory;

  // if invalid folder path - throw error

  return newCurrentWorkingDirectory;
};
