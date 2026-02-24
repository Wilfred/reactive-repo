# Reactive Repo

**If this, then that — for GitHub repositories.**

Reactive Repo lets you define automation rules for your GitHub repositories. When something happens (a *trigger*), Reactive Repo performs an *action* in response.

## Examples

| Trigger | Action |
|---|---|
| Label `bug` added to an issue | Add comment "Thanks for reporting! We'll triage this soon." |
| Issue opened | Add label `needs-triage` |
| Pull request opened | Assign user `reviewer-bot` |
| Issue closed | Add comment "Resolved — closing." |

## Features

- **Triggers** — React to GitHub events: issue opened/closed/labeled, PR opened/closed, comment created.
- **Actions** — Respond automatically: add a comment, add a label, close an issue, or assign a user.
- **Web UI** — A browser-based interface for managing repositories and defining rules (no config files needed).
- **Loop protection** — Actions performed by Reactive Repo never trigger other rules, preventing infinite loops.

## Triggers

| Trigger | Description |
|---|---|
| `issue_labeled` | A label was added to an issue. Optionally filter by label name. |
| `issue_opened` | An issue was opened. |
| `issue_closed` | An issue was closed. |
| `pull_request_opened` | A pull request was opened. |
| `pull_request_closed` | A pull request was closed or merged. |
| `issue_comment_created` | A comment was added to an issue. |

## Actions

| Action | Value |
|---|---|
| `add_comment` | The comment text to post. |
| `add_label` | The label name to add. |
| `close_issue` | *(no value needed)* |
| `assign_user` | The GitHub username to assign. |

## Setup

```bash
npm install
npm run build
npm start
```

The server starts on port 3000 (override with the `PORT` environment variable).

### Adding a repository

1. Open `http://localhost:3000` in your browser.
2. Enter the repository owner and name, then click **Add**.
3. Click **Manage Rules** to define triggers and actions.

### Connecting GitHub webhooks

Each tracked repository has a unique webhook URL shown on its rules page:

```
POST https://<your-host>/webhooks/<repo-id>
```

In your GitHub repository settings, add a webhook pointing to that URL with:
- **Content type:** `application/json`
- **Events:** Select the events that match your triggers (issues, pull requests, issue comments).

## Loop Protection

Reactive Repo prevents infinite loops with two mechanisms:

1. **Bot user detection** — Set the `GITHUB_BOT_USERNAME` environment variable to the GitHub account used by Reactive Repo. Any webhook event triggered by that user is ignored.
2. **Content marker** — Comments created by Reactive Repo include a hidden HTML marker (`<!-- reactive-repo-bot -->`). If an incoming event's body contains this marker, it is skipped.

These two layers ensure that actions performed by Reactive Repo never cascade into further rule executions.

## Tech Stack

- **TypeScript** + **Express** — Server and API
- **React** (server-side rendered) — Web UI
- **TypeORM** + **better-sqlite3** — Database
- **GitHub Webhooks** — Event ingestion
