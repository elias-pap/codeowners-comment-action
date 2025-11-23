import {
  fail,
  getChangedFiles,
  getComment,
  getOwnersPerFile,
  logDebug,
  parseGithubEnvironment,
  postComment,
} from "./utils.ts";

const main = async () => {
  const githubEnvironment = parseGithubEnvironment();
  if (!githubEnvironment)
    return fail("Github environment could not be parsed.");

  const changedFiles = await getChangedFiles(githubEnvironment);
  if (!changedFiles) return fail("No changed files found.");
  logDebug(`Detected changed files:\n-> ${changedFiles.join("\n-> ")}`);

  const ownersPerFile = getOwnersPerFile(changedFiles);
  if (!ownersPerFile) return fail("No owners found.");
  logDebug(
    `Detected owners per file:\n-> ${JSON.stringify(
      Object.fromEntries(ownersPerFile)
    )}`
  );

  const comment = getComment(ownersPerFile);
  if (!comment) return fail("No comment found.");
  logDebug(`Comment to try to post:\n-> ${comment}`);

  await postComment({ comment, githubEnvironment });
};

main();
