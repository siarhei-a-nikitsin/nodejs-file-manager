import { cwd } from "node:process";
import { readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const fsItemTypes = {
  file: "file",
  directory: "directory",
};

export const printCWDTable = async () => {
  const folder = cwd();

  const list = await readdir(folder);

  const promises = [];

  list.forEach((itemName) => {
    promises.push(stat(resolve(folder, itemName)));
  });

  const itemsInfo = await Promise.all(promises);

  const result = list.map((itemName, index) => ({
    Name: itemName,
    Type: itemsInfo[index].isFile() ? fsItemTypes.file : fsItemTypes.directory,
  }));

  result.sort((a, b) => {
    if(a.Type !== b.Type) {
      return a.Type === fsItemTypes.directory ? -1 : 1;
    }

    if (a.Name < b.Name) {
      return -1;
    }

    if (a.Name > b.Name) {
      return 1;
    }

    return 0;
  });
  // result.sort((a) => a.Type === fsItemTypes.directory ? );

  console.table(result);
};
