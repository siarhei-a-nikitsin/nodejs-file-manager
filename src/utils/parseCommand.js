const FLAG_PREFIX = "--";

const parseCommand = (input) => {
  if (!input) {
    throw new Error("Parse command error: Empty command");
  }

  const parts = input.split(" ").filter((x) => !!x);

  const command = parts[0];
  const args = [];
  const flags = [];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];

    if (part.startsWith(FLAG_PREFIX)) {
      flags.push(part.slice(FLAG_PREFIX.length));
    } else {
      args.push(part);
    }
  }

  return {
    command,
    arguments: args,
    flags,
  };
};

export default parseCommand;
