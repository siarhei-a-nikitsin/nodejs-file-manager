import path, { resolve, dirname } from "node:path";
import { access, constants, unlink, rename, open } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { createBrotliCompress, createBrotliDecompress } from "node:zlib";

const BROTLI_EXTENSION = ".br";

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

export const readFile = async (filePath, outputStream) => {
  const exists = await isFileExists(filePath);

  if (!exists) {
    throw new Error("File does not exist to read.");
  }

  const readStream = createReadStream(filePath, { encoding: "utf-8" });

  return pipeline(readStream, outputStream);
};

export const createEmptyFile = async (filePath) => {
  let fd;

  try {
    fd = await open(filePath, "wx");
  } finally {
    fd?.close();
  }
};

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

export const copyFile = async (filePath, destinationFolderPath) => {
  const destinationFilePath = resolve(
    destinationFolderPath,
    path.basename(filePath)
  );

  const [
    isSourceFileExists,
    isDestinationFolderExists,
    isDestinationFileExists,
  ] = await Promise.all([
    isFileExists(filePath),
    isFolderExists(destinationFolderPath),
    isFileExists(destinationFilePath),
  ]);

  if (
    !isSourceFileExists ||
    !isDestinationFolderExists ||
    isDestinationFileExists
  ) {
    throw new Error("FS operation failed");
  }

  const readStream = createReadStream(filePath);
  const writeStream = createWriteStream(destinationFilePath);

  await pipeline(readStream, writeStream);
};

export const removeFile = async (filePath) => {
  const exists = await isFileExists(filePath);

  if (!exists) {
    throw new Error("File does not exist to delete.");
  }

  await unlink(filePath);
};

export const moveFile = async (filePath, destinationFolderPath) => {
  const newFilePath = resolve(destinationFolderPath, path.basename(filePath));

  const [isExists, isDestinationFolderExists, isNewFileExists] =
    await Promise.all([
      isFileExists(filePath),
      isFolderExists(destinationFolderPath),
      isFileExists(newFilePath),
    ]);

  if (!isExists || !isDestinationFolderExists || isNewFileExists) {
    throw new Error("FS operation failed");
  }

  const readStream = createReadStream(filePath);
  const writeStream = createWriteStream(newFilePath);

  await pipeline(readStream, writeStream);

  await unlink(filePath);

  // it is more effective approach without streams
  // return rename(filePath, newFilePath); // using rename function
};

export const calculateHash = async (filePath) => {
  const hash = createHash("sha256");

  const readStream = createReadStream(filePath);

  await pipeline(readStream, hash);

  return hash.digest("hex");
};

export const compressFile = async (sourceFilePath, destinationFolderPath) => {
  const destinationFilePath = resolve(
    destinationFolderPath,
    `${path.basename(sourceFilePath)}${BROTLI_EXTENSION}`
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
  const sourceFileExtension = path.extname(sourceFileName);

  if (sourceFileExtension !== BROTLI_EXTENSION) {
    throw new Error("File is not a brotli file.");
  }

  const destinationFilePath = resolve(
    destinationFolderPath,
    sourceFileName.substring(0, sourceFileName.indexOf(BROTLI_EXTENSION))
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
