import { setFailed as g, info as m, setOutput as h, getInput as y } from "@actions/core";
import { context as d, getOctokit as F } from "@actions/github";
const p = (n) => Array.isArray(n), k = (n) => p(n) && n.length === 0, t = (n) => (g(n), null), b = (n) => (console.error(n), null), A = async () => {
  const { payload: n } = d;
  if (!n) return t("payload not found.");
  const { pull_request: r } = n;
  if (!r)
    return t(
      "pull_request not found. This action must be run on a pull_request event."
    );
  const s = y("token");
  if (!s)
    return t(
      "token input not found. A token must be passed as input to this action."
    );
  const i = F(s);
  if (!i) return t("octokit client not found.");
  const { repo: u } = d;
  if (!u) return t("repository not found.");
  const { owner: a, repo: l } = u;
  if (!a) return t("owner not found.");
  if (!l) return t("repo not found.");
  const { number: c } = r;
  if (!c) return t("pull request number not found.");
  const { data: e } = await i.rest.pulls.listFiles({
    owner: a,
    repo: l,
    pull_number: c
  });
  if (!e) return t("Changed files data not found.");
  if (!p(e)) return t("changedFiles is not an array.");
  if (k(e))
    return t("changedFiles is an empty array.");
  const f = e.map(({ filename: o }) => o);
  return f.some((o) => o == null) ? t("changedFilenames contains invalid values.") : f;
}, _ = async () => {
  const n = await A();
  if (!n) return b("No changed files found.");
  m(`Changed files: ${n.join(", ")}`), h("changed_files", n.join(", "));
};
_();
