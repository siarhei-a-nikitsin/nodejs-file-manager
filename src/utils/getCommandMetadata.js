import {
  commandDescriptorByCommand,
  commandKeyByCommandDescriptor,
} from "../commands/commandDescriptors.js";

const getCommandMetadata = (parsedCommand) => {
  const { command, arguments: args, flags } = parsedCommand;

  const commandDescriptor = commandDescriptorByCommand[command];

  let commandKey = "";
  let isValid = true;

  if (commandDescriptor) {
    const flagsSet = new Set(flags);

    if (Array.isArray(commandDescriptor)) {
      const commandDesc = commandDescriptor.find(
        (descriptor) =>
          descriptor.flags.every((flag) => flagsSet.has(flag)) &&
          (!descriptor.requiredArgumentsCount ||
            args.length >= descriptor.requiredArgumentsCount)
      );

      if (!commandDesc) {
        isValid = false;
      } else {
        commandKey = commandKeyByCommandDescriptor.get(commandDesc);
      }
    } else {
      isValid =
        (!commandDescriptor.flags ||
          commandDescriptor.flags.every((flag) => flagsSet.has(flag))) &&
        (!commandDescriptor.requiredArgumentsCount ||
          args.length >= commandDescriptor.requiredArgumentsCount);

      if (isValid) {
        commandKey = commandKeyByCommandDescriptor.get(commandDescriptor);
      }
    }
  } else {
    isValid = false;
  }

  return {
    commandKey,
    isValid,
  };
};

export default getCommandMetadata;
