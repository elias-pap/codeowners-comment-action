import { debug, error, getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import Codeowners from "codeowners";

const isArray = (array: any[]) => Array.isArray(array);

const isEmptyArray = (array: any[]) => isArray(array) && array.length === 0;

const isArrayEmpty = (array: any[]) => array.length === 0;

export const fail = (message: string) => {
  setFailed(addProjectPrefix(message));
  return null;
};

export const logDebug = (message: string) => {
  debug(addProjectPrefix(message));
  return null;
};

const addProjectPrefix = (message: string) =>
  `[👷 codeowners-comment-action] ${message}`;

export const parseGithubEnvironment = () => {
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

  return { octokit, owner, repo, pull_number };
};

export const getChangedFiles = async (
  githubEnvironment: Exclude<ReturnType<typeof parseGithubEnvironment>, null>
) => {
  let { octokit, owner, repo, pull_number } = githubEnvironment;

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

export const getOwnersPerFile = (changedFiles: string[]) => {
  const codeowners = new Codeowners();
  if (!codeowners) return fail("codeowners could not be instantiated.");

  let ownersPerFile = new Map<string, string[]>();
  for (const changedFile of changedFiles) {
    ownersPerFile.set(changedFile, codeowners.getOwner(changedFile));
  }

  return ownersPerFile;
};

const getOwnerLink = (owner: string) => {
  if (!owner.includes("/")) return `https://github.com/${owner}`;
  let [org, ownerTeam] = owner.split("/");
  return `https://github.com/orgs/${org}/teams/${ownerTeam}`;
};

export const getComment = (ownersPerFile: Map<string, string[]>) => {
  if (!ownersPerFile) return fail("ownersPerFile not found.");

  let commentLines: string[] = [];
  commentLines.push("## 🔬 Owners of Changed Files");
  for (const [file, owners] of ownersPerFile) {
    let changedFile = `\`${file}\``;
    let separator = isArrayEmpty(owners) ? " 🔓" : " 🔒 ";
    let changedFileOwners = owners
      .map((owner) => {
        let ownerWithoutAt = owner.slice(1);
        return `[${ownerWithoutAt}](${getOwnerLink(ownerWithoutAt)})`;
      })
      .join(", ");
    let line = `${changedFile}${separator}${changedFileOwners}`;
    commentLines.push(line);
  }

  let comment = commentLines.join("\n");
  return comment;
};

const getCommentMarker = (pull_number: number) => {
  let markerTitle = "codeowners-comment-action-marker";
  let randomString = "sQ3y3cEm7mcooZ2";
  return `<!-- ${markerTitle}-${pull_number}-${randomString} -->`;
};

/**
 * Posts the comment.
 * - If the comment doesn't exist already, it creates a new one.
 * - If the comment already exists, it updates it, unless the new comment is
 *   the same as the existing one.
 */
export const postComment = async ({
  comment,
  githubEnvironment,
}: {
  comment: string;
  githubEnvironment: Exclude<ReturnType<typeof parseGithubEnvironment>, null>;
}) => {
  let { octokit, owner, repo, pull_number } = githubEnvironment;

  const { data: pullRequestComments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: pull_number,
  });
  const commentMarker = getCommentMarker(pull_number);
  if (!commentMarker) return fail("Comment marker could not be created.");

  const existingComments = pullRequestComments.filter(
    (comment) => comment.body && comment.body.includes(commentMarker)
  );
  if (existingComments.length > 1)
    return fail(
      "Multiple codeowners comment action comments found. Only one should exist."
    );

  let commentBody = `${commentMarker}\n${comment}`;
  if (existingComments.length === 1) {
    let { id: comment_id, body } = existingComments[0];
    if (commentBody === body)
      return logDebug(
        "Comment already exists with same text. Skipping update."
      );
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id,
      body: commentBody,
    });
    return;
  }
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: pull_number,
    body: commentBody,
  });
};
