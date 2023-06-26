import { EOL, cpus, homedir, userInfo, arch } from "node:os";

export const getEOL = () => EOL;

export const getCpuInfo = () => {
  const data = cpus();

  return {
    cpusAmount: data.length,
    cpus: data.map(({ model, speed }) => ({
      model,
      speed: `${speed / 1000}GHz`,
    })),
  };
};

export const getHomedir = () => homedir();

const getSystemUser = () => userInfo();

export const getSystemUserName = () => getSystemUser().username;

export const getArchitecture = () => arch();
