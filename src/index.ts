import {
  getChangedFiles,
  getComment,
  getOwnersPerFile,
  logDebug,
  logError,
} from "./utils.ts";

const main = async () => {
  const changedFiles = await getChangedFiles();
  if (!changedFiles) return logError("No changed files found.");
  logDebug(`Detected changed files:\n-> ${changedFiles.join("\n-> ")}`);

  const ownersPerFile = getOwnersPerFile(changedFiles);
  if (!ownersPerFile) return logError("No owners found.");
  logDebug(
    `Detected owners per file:\n-> ${JSON.stringify(
      Object.fromEntries(ownersPerFile)
    )}`
  );

  const comment = getComment(ownersPerFile);
  if (!comment) return logError("No comment found.");
  logDebug(
    `Comment to be posted:\n-> ${comment}`
  );
};

main();
