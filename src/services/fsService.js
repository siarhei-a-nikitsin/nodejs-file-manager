import path, { resolve, dirname } from "node:path";
import {
  readFile as baseReadFile,
  access,
  constants,
  copyFile as baseCopyFile,
  unlink,
  rename,
} from "node:fs/promises";
import {
  createReadStream,
  createWriteStream,
  openSync,
  closeSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { createBrotliCompress, createBrotliDecompress } from "node:zlib";

const isFileExists = async (filePath) => {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
};

const isFolderExists = async (folderPath) => {
  try {
    await access(folderPath);
    return true;
  } catch (err) {
    return false;
  }
};

// TODO: it should be done using Readable stream
export const readFile = async (filePath) => {
  const exists = await isFileExists(filePath);

  if (!exists) {
    throw new Error("File does not exist to read.");
  }

  const fileContent = await baseReadFile(filePath, { encoding: "utf-8" });

  return fileContent;
};

export const createEmptyFile = (filePath) =>
  closeSync(openSync(filePath, "wx"));

export const renameFile = async (filePath, newFileName) => {
  const newFilePath = resolve(dirname(filePath), newFileName);

  const [isWrongFileExists, isProperFileExists] = await Promise.all([
    isFileExists(filePath),
    isFileExists(newFilePath),
  ]);

  if (!isWrongFileExists || isProperFileExists) {
    throw new Error("FS operation failed");
  }

  return rename(filePath, newFilePath);
};

// TODO: it should be done using Readable and Writable streams
export const copyFile = async (filePath, destinationFolderPath) => {
  const [isExists, isDestinationFolderExists] = await Promise.all([
    isFileExists(filePath),
    isFolderExists(destinationFolderPath),
  ]);

  if (!isExists || !isDestinationFolderExists) {
    throw new Error("FS operation failed");
  }

  return baseCopyFile(
    filePath,
    resolve(destinationFolderPath, path.basename(filePath)),
    constants.COPYFILE_EXCL
  );
};

// TODO: copying part should be done using Readable and Writable streams
export const moveFile = async (filePath, destinationFolderPath) => {
  const newFilePath = resolve(destinationFolderPath, path.basename(filePath));

  const [isExists, isDestinationFolderExists, isNewFileExists] =
    await Promise.all([
      isFileExists(filePath),
      isFolderExists(destinationFolderPath),
      isFileExists(newFilePath),
    ]);

  if (!isExists || !isDestinationFolderExists || isNewFileExists) {
    console.log(isExists, isDestinationFolderExists);
    throw new Error("FS operation failed");
  }

  return rename(filePath, newFilePath);
};

export const removeFile = async (filePath) => {
  const exists = await isFileExists(filePath);

  if (!exists) {
    throw new Error("File does not exist to delete.");
  }

  await unlink(filePath);
};

// TODO: using streams
export const calculateHash = async (filePath) => {
  const hash = createHash("sha256");

  const fileContent = await readFile(filePath, { encoding: "utf-8" });

  hash.update(fileContent);

  return hash.digest("hex");
};

export const compressFile = async (sourceFilePath, destinationFolderPath) => {
  const destinationFilePath = resolve(
    destinationFolderPath,
    `${path.basename(sourceFilePath)}.br`
  );

  const [
    isSourceFilePathExists,
    isDestinationFolderPathExists,
    isDestinationFilePathExists,
  ] = await Promise.all([
    isFileExists(sourceFilePath),
    isFolderExists(destinationFolderPath),
    isFileExists(destinationFilePath),
  ]);

  if (
    !isSourceFilePathExists ||
    !isDestinationFolderPathExists ||
    isDestinationFilePathExists
  ) {
    throw new Error("Operation failed.");
  }

  const fileReadStream = createReadStream(sourceFilePath);
  const fileWriteStream = createWriteStream(destinationFilePath);

  const brotliCompress = createBrotliCompress();

  return pipeline(fileReadStream, brotliCompress, fileWriteStream);
};

export const decompressFile = async (sourceFilePath, destinationFolderPath) => {
  const sourceFileName = path.basename(sourceFilePath);

  const destinationFilePath = resolve(
    destinationFolderPath,
    sourceFileName.substring(0, sourceFileName.indexOf(".br"))
  );

  const [
    isSourceFilePathExists,
    isDestinationFolderPathExists,
    isDestinationFilePathExists,
  ] = await Promise.all([
    isFileExists(sourceFilePath),
    isFolderExists(destinationFolderPath),
    isFileExists(destinationFilePath),
  ]);

  if (
    !isSourceFilePathExists ||
    !isDestinationFolderPathExists ||
    isDestinationFilePathExists
  ) {
    throw new Error("Operation failed.");
  }

  const fileReadStream = createReadStream(sourceFilePath);
  const fileWriteStream = createWriteStream(destinationFilePath);

  const brotliDecompress = createBrotliDecompress();

  return pipeline(fileReadStream, brotliDecompress, fileWriteStream);
};
