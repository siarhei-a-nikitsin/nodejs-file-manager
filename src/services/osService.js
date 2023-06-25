import { EOL, cpus, homedir, userInfo, arch } from "node:os";

export const getEOL = () => EOL;

export const getCpus = () => cpus();

export const getHomedir = () => homedir();

const getSystemUser = () => userInfo();

export const getSystemUserName = () => getSystemUser().username;

export const getArchitecture = () => arch();