import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createBrotliCompress, createBrotliDecompress } from "node:zlib";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export const calculateHash = async (filePath) => {
  const hash = createHash("sha256");

  // TODO: read by chunks
  const fileContent = await readFile(filePath, { encoding: "utf-8" });

  hash.update(fileContent);

  return hash.digest("hex");
};

// // test
// console.log(
//   await calculateHash(resolve(__dirname, "files/fileToCalculateHashFor.txt"))
// );

export const compress = async (sourceFilePath, destinationFilePath) => {
  const fileReadStream = createReadStream(sourceFilePath);
  const fileWriteStream = createWriteStream(destinationFilePath);

  const brotliCompress = createBrotliCompress();

  return pipeline(fileReadStream, brotliCompress, fileWriteStream);
};

// // test
// await compress(
//   resolve(__dirname, "files", "fileToCompress.txt"),
//   resolve(__dirname, "files", "fileToCompress.txt.br")
// );

export const decompress = async (sourceFilePath, destinationFilePath) => {
  const fileReadStream = createReadStream(sourceFilePath);
  const fileWriteStream = createWriteStream(destinationFilePath);

  const brotliDecompress = createBrotliDecompress();

  return pipeline(fileReadStream, brotliDecompress, fileWriteStream);
};

// // test
// await decompress(
//   resolve(__dirname, "files", "fileToCompress.txt.br"),
//   resolve(__dirname, "files", "fileToCompress.txt")
// );
