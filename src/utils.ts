import { setFailed } from "@actions/core";

export const isArray = (array: any[]) => Array.isArray(array);

export const isEmptyArray = (array: any[]) =>
  isArray(array) && array.length === 0;

export const fail = (message: string) => {
  setFailed(message);
  return null;
};

export const logError = (message: string) => {
  console.error(message);
  return null;
};
