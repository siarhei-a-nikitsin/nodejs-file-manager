const commands = {
  // Service operations
  greeting: "greeting",
  exit: ".exit",
  invalidCommand: "invalid-command",
  failedCommand: "failed-command",

  // Nav operations
  folderUp: "folder-up",
  moveToFolder: "move-to-folder",
  showDirectoryContent: "show-directory-content",

  // File operations
  showFileContent: "show-file-content",
  createEmptyFile: "create-empty-file",
  renameFile: "rename-file",
  copyFile: "copy-file",
  moveFile: "move-file",
  deleteFile: "delete-file",

  // OS info operations
  getEOL: "get-eol",
  getCPUS: "get-cpus",
  getHomeDir: "get-homedir",
  getCurrentSystemUserName: "get-cpu-architecture",
  getCpuArchitecture: "",

  // Hash calculation operations
  calculateFileHash: "calculateFileHash",

  // Compress and decompress operations
  compressFile: "compress-file",
  decompressFile: "decompress-file",
};

const commandDescriptorsByCommandKey = {
  // Service operations
  [commands.greeting]: { command: "greeting" },
  [commands.exit]: { command: ".exit" },
  [commands.invalidCommand]: { command: "invalid-command" },
  [commands.failedCommand]: { command: "failed-command" },

  // Nav operations
  [commands.folderUp]: { command: "up" }, // "up" - Go upper from current directory (when you are in the root folder this operation shouldn't change working directory)
  [commands.moveToFolder]: { command: "cd", requiredArgumentsCount: 1 }, // "cd path_to_directory" - Go to dedicated folder from current directory (path_to_directory can be relative or absolute)
  [commands.showDirectoryContent]: { command: "ls" }, // "ls" - Print in console list of all files and folders in current directory.

  // File operations
  [commands.showFileContent]: { command: "cat", requiredArgumentsCount: 1 }, // "cat path_to_file" - Read file and print it's content in console (should be done using Readable stream)
  [commands.createEmptyFile]: { command: "add", requiredArgumentsCount: 1 }, // "add new_file_name" - Create empty file in current working directory
  [commands.renameFile]: { command: "rn", requiredArgumentsCount: 2 }, // "rn path_to_file new_filename" - Rename file (content should remain unchanged)
  [commands.copyFile]: { command: "cp", requiredArgumentsCount: 2 }, // "cp path_to_file path_to_new_directory" - Copy file (should be done using Readable and Writable streams)
  [commands.moveFile]: { command: "mv", requiredArgumentsCount: 2 }, // "mv path_to_file path_to_new_directory" - Move file (same as copy but initial file is deleted, copying part should be done using Readable and Writable streams)
  [commands.deleteFile]: { command: "rm", requiredArgumentsCount: 1 }, // "rm path_to_file" - Delete file:

  // OS info operations
  [commands.getEOL]: { command: "os", flags: ["EOL"] }, // "os --EOL" - Get EOL (default system End-Of-Line) and print it to console
  [commands.getCPUS]: { command: "os", flags: ["cpus"] }, // "os --cpus" - Get host machine CPUs info (overall amount of CPUS plus model and clock rate (in GHz) for each of them) and print it to console
  [commands.getHomeDir]: { command: "os", flags: ["homedir"] }, // "os --homedir" - Get home directory and print it to console
  [commands.getCurrentSystemUserName]: { command: "os", flags: ["username"] }, // "os --username" - Get current system user name (Do not confuse with the username that is set when the application starts) and print it to console
  [commands.getCpuArchitecture]: {
    command: "os",
    flags: ["architecture"],
  }, // "os --architecture" - Get CPU architecture for which Node.js binary has compiled and print it to console

  // Hash calculation operations
  [commands.calculateFileHash]: { command: "hash", requiredArgumentsCount: 1 }, // "hash path_to_file" - Calculate hash for file and print it into console

  // Compress and decompress operations
  [commands.compressFile]: { command: "compress", requiredArgumentsCount: 2 }, // "compress path_to_file path_to_destination" - Compress file (using Brotli algorithm, should be done using Streams API)
  [commands.decompressFile]: {
    command: "decompress",
    requiredArgumentsCount: 2,
  }, // "decompress path_to_file path_to_destination" - Decompress file (using Brotli algorithm, should be done using Streams API)
};

const commandDescriptorByCommand = Object.keys(
  commandDescriptorsByCommandKey
).reduce((result, commandDescriptorKey) => {
  const commandDescriptor =
    commandDescriptorsByCommandKey[commandDescriptorKey];

  const { command } = commandDescriptor;

  if (command in result) {
    let prevCommands = result[command];

    prevCommands = Array.isArray(prevCommands) ? prevCommands : [prevCommands];

    result[command] = [...prevCommands, commandDescriptor];
  } else {
    result[command] = commandDescriptor;
  }

  return result;
}, {});

const commandKeyByCommandDescriptor = Object.keys(
  commandDescriptorsByCommandKey
).reduce((result, commandKey) => {
  result.set(commandDescriptorsByCommandKey[commandKey], commandKey);

  return result;
}, new Map());

export {
  commands,
  commandDescriptorsByCommandKey,
  commandDescriptorByCommand,
  commandKeyByCommandDescriptor,
};
