# GitHub — a complete course

## How to use this course

This course takes you from your first repository to running a team on GitHub: collaboration, review, automation with Actions, and keeping the code and its dependencies safe. It describes GitHub as it works in late 2026; settings move in the interface from time to time, so the course names features rather than menu paths.

**Who it is for.** Developers who have used Git on their own and want to work well with others on GitHub, and team leads who set up repositories, rules and pipelines. Basic Git (commit, branch, merge) is enough to start.

**How it is organised.** Eight parts in two blocks:

| Block | Parts | What you can do after it |
|---|---|---|
| Working together | 1 Repositories · 2 Issues and Projects · 3 Pull requests · 4 Organisations and process | Run a project where changes are proposed, reviewed and tracked |
| Automation and safety | 5 Branch protection and rulesets · 6 Actions · 7 Securing workflows · 8 The supply chain | Guarantee quality on `main`, automate tests and deploys, and keep secrets and dependencies under control |

Each part ends with what to remember. The exercises at the end give one task per part, with answers.

**With Luma.** The *🐙 GitHub* test in Luma's *Informatique* group follows the same eight parts at four levels (Débutant to Expert), with 128 written questions. Read a part, then take the test on it: the review of mistakes points back to the part you need.

**What you need.** A GitHub account, Git installed, and ideally the GitHub CLI (`gh`). A personal repository is enough for Parts 1 to 3 and 5 to 8; Part 4 is easier with a free organization.

## Part 1 — Repositories

A repository is a project's files plus their whole history. GitHub hosts the repository and adds everything around it: issues, pull requests, Actions, security features and permissions.

### Commits, branches and history

A **commit** is a snapshot of the whole tree of files, with an author, a date, a message and a link to its parent commit. Git identifies each commit by a hash (its SHA) computed from all of that, so changing anything in an old commit changes every descendant's SHA. That is why rewriting published history is disruptive: everyone else still has the old commits.

A **branch** is just a movable name pointing at a commit. Creating one is instant, so work happens on short-lived branches and reaches `main` through a pull request. A **tag** is a name that does not move, used for versions (`v1.4.0`); a GitHub **release** is a page built on a tag, with notes and downloadable files.

### Clone, fork and remotes

- `git clone` copies a repository and its history to your machine.
- A **fork** is a copy on GitHub, under your account. You fork a project you cannot write to, push a branch to your fork, and open a pull request back to the original.

By convention, in a clone of your fork, `origin` is your fork and `upstream` is the original:

```sh
git clone git@github.com:you/project.git
cd project
git remote add upstream git@github.com:acme/project.git
git fetch upstream
git switch -c fix-typo upstream/main
```

The Sync fork button, or `gh repo sync`, brings your fork's `main` up to date. Keep your own commits off your fork's `main`, so syncing never conflicts.

### The files every repository should have

| File | Purpose |
|---|---|
| `README.md` | What the project is, how to install and use it |
| `LICENSE` | Who may use the code and how; without one, nobody may legally reuse it |
| `.gitignore` | Files Git must not track: build output, dependencies, `.env` |
| `CONTRIBUTING.md` | How to propose a change: setup, tests, style, pull requests |
| `SECURITY.md` | How to report a vulnerability privately |
| `CODE_OF_CONDUCT.md` | How people are expected to behave |

An organization can provide defaults for the community files in a repository named `.github`. A **template repository** gives new repositories its files with a fresh history.

### Rewriting history safely

On your own branch, `git rebase` and `git commit --amend` rewrite commits; the remote then needs a forced push. Use the careful form:

```sh
git push --force-with-lease
```

It refuses if someone else pushed in the meantime, instead of erasing their commits. Never rewrite a shared branch.

A secret committed by mistake stays in history even after a new commit deletes it. Revoke the credential first; then, if needed, rewrite history with `git filter-repo`, force-push every branch and tag, and have collaborators clone again.

### Large files, signatures and big repositories

- **Git LFS** stores large binaries outside Git, leaving small pointers in the repository; GitHub refuses files over 100 MB in plain Git.
- **Signed commits** (GPG, SSH or S/MIME keys) get a Verified badge: the author field alone proves nothing.
- **Shallow and partial clones** make CI fast: `actions/checkout` fetches only the commit being built unless you set `fetch-depth: 0`.

**What to remember.** A commit is an immutable snapshot named by a hash; branches are cheap names; forks are server-side copies; never rewrite shared history, and treat any committed secret as leaked.

## Part 2 — Issues and Projects

Issues are the project's to-do list; Projects plan across many of them; Discussions host the conversations that are not work yet.

### Issues

An issue has a title, a description, labels, assignees, an optional milestone and a conversation. A few habits make them useful:

- **Labels** sort and filter: `bug`, `docs`, `good first issue`, `help wanted`. The last two are shown to newcomers.
- **Mentions** (`@lea`, `@acme/backend`) notify people and subscribe them.
- **Closing keywords** in a pull request (`Fixes #42`, `Closes #42`, `Resolves #42`) link the issue and close it when the pull request is merged into the default branch.
- A good bug report gives steps to reproduce, expected and actual behaviour, and the version.

### Templates and forms

Files in `.github/ISSUE_TEMPLATE/` shape new issues. Issue forms are YAML with real fields:

```yaml
name: Bug report
description: Something does not work
labels: [bug]
body:
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
    validations:
      required: true
  - type: input
    id: version
    attributes:
      label: Version
```

A `config.yml` in the same folder can turn off blank issues and point questions to Discussions.

### Projects

A Project is a table, board or roadmap over issues and pull requests from any repositories of its owner. Items are the real issues, with extra fields: Status, Priority, Iteration, Estimate. Built-in workflows add items automatically and set Status when an item is added, closed or merged; anything more specific can be scripted with the GraphQL API.

**Sub-issues** turn a feature into a parent with child issues, even across repositories, and **issue types** (bug, feature, task), defined by the organization, complement labels.

### Search and triage

Search qualifiers combine: `is:issue is:open label:bug no:assignee` lists unowned bugs. Saved as a Project view, such a query becomes the triage list. Iterations do not move unfinished items on their own: moving them is a planning decision.

### Moderation

Maintainers can lock a conversation, hide off-topic or abusive comments, transfer an issue to another repository of the same owner, and set temporary interaction limits on a public repository flooded with spam. A code of conduct gives the rules to point to.

**What to remember.** One issue, one piece of work; labels and forms make triage fast; Projects plan across repositories with fields and views; Discussions keep the issue list actionable.

## Part 3 — Pull requests

A pull request proposes merging one branch (head) into another (base), shows the diff, runs the checks and gathers the review.

### Opening and reviewing

- Open early as a **draft** to get feedback on direction; mark it ready when it is.
- Keep it **small and focused**: a few hundred lines get a real review, thousands get a skim. Separate refactors and reformatting from behaviour changes.
- Describe **why** and **how to test**, and link the issue.

A review is Comment, Approve or Request changes. Reviewers can write **suggested changes** that the author commits with one click. An author cannot approve their own pull request.

### The three merge methods

| Method | Result on the base branch | Good for |
|---|---|---|
| Create a merge commit | Every commit of the branch, plus a merge commit | Keeping the exact history of the branch |
| Squash and merge | One commit per pull request | A clean history where each commit is a reviewed change |
| Rebase and merge | Each commit replayed, no merge commit | A linear history with the individual commits |

Squash merging makes reverting and backporting easy (one commit per change) and helps `git bisect`, since every commit on `main` passed the checks.

### CODEOWNERS

A `CODEOWNERS` file (in `.github/`, the root or `docs/`) maps paths to owners:

```text
*            @acme/maintainers
*.js         @acme/web
/api/        @acme/backend
/docs/       @acme/writers @lea
```

Owners are requested for review automatically; with branch protection's code owner review, one owner's approval per touched path is required. For each file only the **last matching line** counts: `/api/server.js` above belongs to `@acme/backend` alone. Put general patterns first, specific ones after. Owners need write access; the file grants none.

### Conflicts, reverts and backports

A conflict means both branches changed the same lines; merge or rebase the base into your branch, resolve, and push. To undo a merged pull request, use the **Revert** button: it opens a new pull request with a commit that undoes it, which goes through review like any change. To bring a fix to a maintained release branch, cherry-pick it onto a branch from that release and open a backport pull request.

### Merge queues, auto-merge and stacks

- A **merge queue** tests each pull request together with those ahead of it on the latest base, and merges only what passes. Required workflows must also run `on: merge_group`.
- **Auto-merge** merges as soon as every requirement is met.
- **Stacked pull requests** split a large change into a chain, each based on the previous branch, so each step is reviewed on its own.

**What to remember.** Small pull requests with a clear why; squash for a history of reviewed changes; the last matching `CODEOWNERS` line wins; revert through a pull request, never by rewriting `main`.

## Part 4 — Organisations and process

### Accounts, organisations and roles

People keep personal accounts and join **organizations**, which own repositories, so nothing is lost when someone leaves. Access to a repository comes from five roles:

| Role | Adds |
|---|---|
| Read | View, clone, open issues, comment |
| Triage | Manage issues and pull requests: labels, assignees, closing |
| Write | Push, merge pull requests |
| Maintain | Manage the repository's settings, except destructive ones |
| Admin | Everything, including access, deletion and security settings |

Give access through **teams** (`@acme/backend`), not person by person: membership then drives every repository at once. Child teams inherit their parent's access. The organization's **base permission** applies to every member on every repository; outside collaborators see only the repositories they are added to. Enterprises add SAML single sign-on, SCIM provisioning, custom repository roles and an audit log.

### Branching models

| Model | Shape | Fits |
|---|---|---|
| GitHub flow | `main` plus short feature branches, merged after review, then deployed | Web services deployed continuously |
| Trunk-based development | Very short branches merged at least daily, unfinished work behind feature flags | Teams practising continuous deployment |
| Git flow | `develop`, release and hotfix branches beside `main` | Software shipped in versions, with maintained releases |

Release trains combine trunk-based work with a fixed schedule: a release branch is cut on the date, and what is not ready waits for the next train.

### Versions and commit messages

**Semantic versioning** reads MAJOR.MINOR.PATCH: a breaking change bumps the major, a compatible feature the minor, a compatible fix the patch; from `2.3.1`, a new feature gives `2.4.0`. **Conventional Commits** write `type(scope): description`, such as `fix(parser): handle empty input` or `feat!: drop Node 18`, so tools can derive the next version and the changelog.

### A healthy review culture

- Review is part of the work: agree on a first response within a working day.
- Request review from a team rather than one person; `CODEOWNERS` spreads the load.
- Comment on the code, not the person; separate must-fix from suggestions.
- **Inner source**: let any team read and propose changes to another team's repositories, with good READMEs and contribution guides.

**What to remember.** Organizations own the code, teams carry the access, roles follow least privilege; pick a branching model that matches how you ship; version and describe changes so machines and people can read them.

## Part 5 — Branch protection and rulesets

Rules turn good habits into guarantees on the branches that matter.

### What to require on `main`

- **A pull request before merging**, with at least one approval, and code owner review where owners exist.
- **Dismiss stale approvals** when new commits are pushed, and require approval of the most recent push, so nobody merges unreviewed code.
- **Required status checks**: named checks (for example `test`) must pass. Requiring the branch to be **up to date** makes the checks run on what the merge will produce; a merge queue gives the same guarantee without manual updates.
- **Linear history** (only squash or rebase merges), **signed commits**, **conversation resolution**.
- **No force-pushes and no deletion.**

### Rulesets

Rulesets are the newer form of rules. Compared with classic branch protection:

- Several rulesets can target the same branch, and they **aggregate**: for a rule present in several, the most restrictive setting applies. An organization ruleset requiring one approval and a repository ruleset requiring two give two.
- They target branches, **tags** and, for private and internal repositories, **pushes** (file paths, extensions, sizes), across many repositories at once.
- A **bypass list** names the roles, teams or apps allowed to skip them; keep it short and prefer apps.
- **Evaluate mode** (on Enterprise plans) reports what would be blocked before enforcing.
- Anyone with read access can see which rules apply.

A tag ruleset on `v*` that only a release app can bypass ensures that version tags come from the release pipeline.

### Making checks trustworthy

A required check is matched by name, so set its **expected source** (for example GitHub Actions) or a look-alike from another app or workflow could satisfy it. Required workflows in rulesets go further: a central workflow that each repository must pass and cannot edit.

### Environments as gates

Deployments use **environments** with their own rules: required reviewers, wait timers, allowed branches or tags, and custom deployment protection rules where an external app approves or rejects the job (for example, no deploys during an incident).

**What to remember.** Require reviewed, checked, up-to-date pull requests on `main`; prefer rulesets, which layer with the strictest setting winning; keep bypass lists tiny; pin the source of required checks.

## Part 6 — Actions

GitHub Actions runs workflows: YAML files in `.github/workflows/`, triggered by events.

### Anatomy of a workflow

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: ${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm test
```

- **Events** (`on:`) start runs: `push`, `pull_request`, `schedule`, `workflow_dispatch` (manual, with inputs), `release`, `merge_group` and many more.
- **Jobs** run on separate, fresh runners, in parallel unless `needs:` orders them.
- **Steps** run in order inside a job and share its workspace; `uses:` runs an action, `run:` runs shell commands.
- A **matrix** runs the job once per combination: two Node versions times two systems is four jobs.

### Passing data and saving time

- **Artifacts** (`actions/upload-artifact`) keep files of a run for download or for later jobs.
- **Caches** (`actions/cache`, or the `cache:` option of setup actions) restore dependencies by a key such as the lockfile's hash; a miss must still work.
- **Outputs**: a step appends `name=value` to the file named by `GITHUB_OUTPUT`; later steps read `steps.<id>.outputs.name`, and other jobs read the job's outputs through `needs`.
- **Schedules** use cron syntax in UTC, run from the default branch, and may start late at busy times.

### Conditions

A step without `if:` runs only if everything before succeeded. The status functions change that:

| Condition | Runs when |
|---|---|
| `success()` (implied) | Every previous step succeeded |
| `failure()` | A previous step failed |
| `always()` | Always, even after cancellation |
| `!cancelled()` | After success or failure, but not after a cancel |

### Reuse and control

- **Reusable workflows** (`on: workflow_call`) are called as whole jobs, with inputs and secrets; **composite actions** bundle steps used inside a job.
- **Concurrency groups** run one at a time; a newer pending run replaces an older pending one, and `cancel-in-progress` also cancels the running one (good for pull requests, risky for deploys).
- **Dynamic matrices**: a first job outputs a JSON array, read with `fromJSON` by the next job's matrix.
- **Self-hosted runners** suit special hardware or private networks, but must be kept clean and never serve public repositories.

### Traps worth knowing

- Events caused by the `GITHUB_TOKEN` (a push, a tag) do not start new workflow runs, to avoid loops; use a GitHub App token when a workflow must trigger another.
- Scheduled workflows in public repositories are disabled after 60 days without activity.
- A matrix is limited to 256 jobs, and an empty matrix fails.

**What to remember.** Workflows are code in the repository: events start jobs, jobs run steps on fresh runners; cache inputs, keep outputs as artifacts; know what `if:` really means; reuse with reusable workflows and composite actions.

## Part 7 — Securing workflows

A workflow runs code with credentials. Treat it like production.

### Secrets and the token

- Store credentials as **secrets** (repository, environment or organization) and read them as `secrets.NAME`. Never commit them; a committed secret must be revoked.
- Logs mask exact secret values, not transformed ones; never print secrets.
- The **`GITHUB_TOKEN`** is created for each run, limited to the repository, and expires at the end of the job. Set its scopes with `permissions:`; once the key is present, every scope not listed is `none`. Start from `contents: read` and grant more per job.

### Forks, Dependabot and environments

- `pull_request` runs from **forks** get no secrets and a read-only token; first-time contributors' runs can require approval.
- Runs triggered by **Dependabot** are treated the same way and only see Dependabot secrets.
- **Environments** keep production secrets out of every other job: a job that names `environment: production` waits for its required reviewers, and only then receives the environment's secrets.

### OIDC instead of keys

A job with `id-token: write` can ask GitHub for a signed OIDC token describing the run. Google Cloud's Workload Identity Federation (or AWS and Azure equivalents) trusts that issuer and exchanges the token for short-lived credentials. No long-lived key exists to leak. Restrict the trust condition to the repository and environment, through the token's `sub` claim (for example `repo:acme/shop:environment:production`), never to a whole organization.

### Supply chain of the workflow itself

- **Pin third-party actions to a full commit SHA**, with the version in a comment; tags can be moved. In March 2025 the tags of `tj-actions/changed-files` were moved to a commit that dumped secrets into logs; SHA-pinned workflows were unaffected. Let Dependabot update the SHAs.
- **Script injection**: values such as an issue title are pasted into the script before it runs. Pass them through an environment variable:

```yaml
- name: Greet
  env:
    TITLE: ${{ github.event.issue.title }}
  run: echo "New issue: $TITLE"
```

- **`pull_request_target`** runs with the base repository's secrets; never check out and build the pull request's code in it.
- **Caches** created on the default branch are visible to all branches; keep low-trust jobs from writing caches that release builds restore.
- **Artifact attestations** (`actions/attest-build-provenance`) sign where and how a file was built; `gh attestation verify` checks it.

**What to remember.** Least-privilege token, secrets only where needed, OIDC instead of keys with a narrow trust condition, actions pinned by SHA, untrusted text through environment variables, and no untrusted code in privileged triggers.

## Part 8 — The supply chain: Dependabot, code scanning, secret scanning

### Dependabot

- **Alerts**: the dependency graph (from manifests and lockfiles) is matched against the GitHub Advisory Database.
- **Security updates**: pull requests that move a vulnerable dependency to the first fixed version.
- **Version updates**: pull requests that keep dependencies current, configured in `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      minor-and-patch:
        update-types: [minor, patch]
    cooldown:
      default-days: 5
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

Groups bundle related updates into one pull request; `ignore` skips some; `cooldown` waits a few days after a release before proposing it, so a poisoned version has time to be caught (security updates are not delayed). Commit lockfiles so installs are reproducible and indirect dependencies are visible.

Auto-merge is reasonable for patch (and perhaps minor) updates, once the required tests pass: a workflow reads `dependabot/fetch-metadata` and runs `gh pr merge --auto --squash` for those. Major versions deserve a human.

### Code scanning and secret scanning

- **Code scanning with CodeQL** finds vulnerability patterns (injection, path traversal…). Default setup needs no file; advanced setup is a workflow for custom builds and queries. Results appear as alerts on pull requests.
- **Secret scanning** finds credentials in the whole history and notifies many providers; **push protection** blocks a push containing a recognized secret, unless the pusher records a reason to bypass.
- The **dependency review action** shows the dependencies a pull request adds and can fail on known vulnerabilities or disallowed licences.

Public repositories get these features free; private ones on Team and Enterprise plans buy **GitHub Secret Protection** and **GitHub Code Security** separately.

### Inventory and disclosure

- The dependency graph exports an **SBOM** in SPDX format.
- **Private vulnerability reporting** and **repository security advisories** let maintainers prepare a fix in private, request a CVE, and publish; Dependabot then alerts every dependent repository.

### Triage

Severity describes the package, not your use of it. A vulnerable development dependency that never ships is usually lower risk, though one running in CI with secrets can matter. Dismiss with a stated reason, so the decision is recorded.

**What to remember.** Lockfiles, grouped and cooled-down Dependabot updates including Actions, CodeQL and push protection on, dependency review as a required check, and private, coordinated disclosure.

## Exercises

1. Fork a public project, add `upstream`, and create a branch from `upstream/main`. Which remote do you push to?
2. Write an issue form with a required Steps to reproduce field and a Version field. Where does the file go?
3. `CODEOWNERS` has `*.ts @acme/web` and later `/server/ @acme/api`. Who owns `/server/app.ts`, and how would both teams own it?
4. Your team ships a web service several times a day. Which branching model and merge method fit, and why?
5. An organization ruleset requires one approval and a repository ruleset requires two, with a code owner. What applies to a pull request on `main`?
6. Write a workflow that tests on Node 20 and 22 on pull requests and pushes to `main`, with read-only permissions and npm caching.
7. A deploy job uses a JSON service account key stored as a secret. Describe the change to OIDC and the trust condition you would set.
8. Write a `dependabot.yml` that updates npm and GitHub Actions weekly, groups minor and patch updates, and waits five days after releases.

### Answers

1. To `origin`, your fork; the pull request then goes from your fork's branch to upstream's `main`.
2. In `.github/ISSUE_TEMPLATE/`, as a `.yml` file with `body` fields and `validations: required: true` on the steps.
3. `@acme/api`: the last matching line wins. Put both on one line: `/server/ @acme/api @acme/web`.
4. GitHub flow or trunk-based development with squash merges: short branches, a reviewed commit per change on `main`, easy reverts.
5. Two approvals including a code owner: rulesets aggregate and the strictest setting of each rule applies.
6. See the workflow in Part 6: `on: pull_request` and `push` on `main`, `permissions: contents: read`, a matrix on `node`, `cache: npm`.
7. Delete the key; grant `id-token: write` to the job; create a workload identity pool and provider trusting GitHub's issuer; allow only `sub` equal to `repo:<owner>/<repo>:environment:production` to impersonate the deploy service account; use the auth action with the provider instead of the key.
8. See the file in Part 8, with `interval: weekly`, a group of `update-types: [minor, patch]` and `cooldown: default-days: 5`.

## Sources

Reference pages for each part. Features and plans change: check the page before relying on a detail.

| Part | Pages |
|---|---|
| 1 | [About Git](https://docs.github.com/en/get-started/using-git/about-git) · [Git LFS](https://git-lfs.com/) · [git filter-repo](https://github.com/newren/git-filter-repo) |
| 2 | [About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects) · [Transferring an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/transferring-an-issue-to-another-repository) |
| 3 | [About pull request merges](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges) · [About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) |
| 4 | [Repository roles for an organization](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization) · [Semantic Versioning](https://semver.org/) · [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) |
| 5 | [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) · [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) |
| 6 | [GitHub Actions documentation](https://docs.github.com/en/actions) |
| 7 | [Preventing pwn requests](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/) · [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) |
| 8 | [Dependabot options](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file) · [SLSA](https://slsa.dev/) |
