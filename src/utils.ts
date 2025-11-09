import { debug, error, setFailed } from "@actions/core";

export const isArray = (array: any[]) => Array.isArray(array);

export const isEmptyArray = (array: any[]) =>
  isArray(array) && array.length === 0;

export const fail = (message: string) => {
  setFailed(addProjectPrefix(message));
  return null;
};

export const logError = (message: string) => {
  error(addProjectPrefix(message));
  return null;
};

export const logDebug = (message: string) => {
  debug(addProjectPrefix(message));
  return null;
};

const addProjectPrefix = (message: string) =>
  `[👷 codeowners-comment-action] ${message}`;
