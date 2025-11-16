import { getChangedFiles, getOwnersPerFile, logDebug, logError } from "./utils.ts";

const main = async () => {
  const changedFiles = await getChangedFiles();
  if (!changedFiles) return logError("No changed files found.");
  logDebug(`Detected changed files:\n-> ${changedFiles.join("\n-> ")}`);

  const ownersPerFile = getOwnersPerFile(changedFiles);
  if (!ownersPerFile) return logError("No owners found.");
  logDebug(`Detected owners per file:\n-> ${JSON.stringify(Object.fromEntries(ownersPerFile))}`);
};

main();
