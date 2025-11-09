import { debug, setFailed } from "@actions/core";

export const isArray = (array: any[]) => Array.isArray(array);

export const isEmptyArray = (array: any[]) =>
  isArray(array) && array.length === 0;

export const fail = (message: string) => {
  setFailed(addProjectPrefix(message));
  return null;
};

export const logError = (message: string) => {
  console.error(addProjectPrefix(message));
  return null;
};

export const logDebug = (message: string) => {
  console.debug(addProjectPrefix(message));
  debug(addProjectPrefix(message));
  return null;
};

const addProjectPrefix = (message: string) =>
  `[👷 codeowners-comment-action] ${message}`;
