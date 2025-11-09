import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { fail, isArray, isEmptyArray, logDebug, logError } from "./utils";

const getChangedFiles = async () => {
  const { payload } = context;
  if (!payload) return fail("payload not found.");

  const { pull_request } = payload;
  if (!pull_request)
    return fail(
      "pull_request not found. This action must be run on a pull_request event."
    );

  const token = getInput("token");
  if (!token)
    return fail(
      "token input not found. A token must be passed as input to this action."
    );

  const octokit = getOctokit(token);
  if (!octokit) return fail("octokit client not found.");

  const { repo: repository } = context;
  if (!repository) return fail("repository not found.");

  const { owner, repo } = repository;
  if (!owner) return fail("owner not found.");
  if (!repo) return fail("repo not found.");

  const { number: pull_number } = pull_request;
  if (!pull_number) return fail("pull request number not found.");

  // Returns up to 3000 files.
  const { data: changedFiles } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number,
  });
  if (!changedFiles) return fail("Changed files data not found.");
  if (!isArray(changedFiles)) return fail("changedFiles is not an array.");
  if (isEmptyArray(changedFiles))
    return fail("changedFiles is an empty array.");

  const changedFilenames = changedFiles.map(({ filename }) => filename);
  if (changedFilenames.some((changedFilename) => changedFilename == null))
    return fail("changedFilenames contains invalid values.");

  return changedFilenames;
};

const main = async () => {
  const changedFiles = await getChangedFiles();
  if (!changedFiles) return logError("No changed files found.");

  logDebug(`Detected changed files:\n-> ${changedFiles.join("\n-> ")}`);
};

main();
