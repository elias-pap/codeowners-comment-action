import { getChangedFiles, logDebug, logError } from "./utils";

const main = async () => {
  const changedFiles = await getChangedFiles();
  if (!changedFiles) return logError("No changed files found.");

  logDebug(`Detected changed files:\n-> ${changedFiles.join("\n-> ")}`);
};

main();
