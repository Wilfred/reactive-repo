import React from "react";
import { Layout } from "./Layout";
import { Repository } from "../entity/Repository";
import {
  Rule,
  TriggerType,
  ActionType,
  TRIGGER_LABELS,
  ACTION_LABELS,
} from "../entity/Rule";

interface Props {
  repo: Repository;
  rules: Rule[];
}

const triggerTypes: TriggerType[] = [
  "issue_labeled",
  "issue_opened",
  "issue_closed",
  "pull_request_opened",
  "pull_request_closed",
  "issue_comment_created",
];

const actionTypes: ActionType[] = [
  "add_comment",
  "add_label",
  "close_issue",
  "assign_user",
];

export function RulesPage({ repo, rules }: Props): React.ReactElement {
  return (
    <Layout title={`Rules — ${repo.owner}/${repo.name}`}>
      <p>
        <a href="/">&larr; Back to repositories</a>
      </p>

      <h1>
        Rules for {repo.owner}/{repo.name}
      </h1>

      <div className="card">
        <h2>Add a Rule</h2>
        <form method="POST" action={`/repos/${repo.id}/rules`} className="rule-form">
          <div className="form-row">
            <label>
              When (trigger)
              <select name="triggerType">
                {triggerTypes.map((t: TriggerType) => (
                  <option key={t} value={t}>
                    {TRIGGER_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Trigger filter (optional)
              <input
                type="text"
                name="triggerValue"
                placeholder="e.g. label name"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Then (action)
              <select name="actionType">
                {actionTypes.map((a: ActionType) => (
                  <option key={a} value={a}>
                    {ACTION_LABELS[a]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Action value
              <input
                type="text"
                name="actionValue"
                placeholder="e.g. comment text, label name, username"
              />
            </label>
          </div>

          <button type="submit" className="btn-add">
            Create Rule
          </button>
        </form>
      </div>

      <h2>Active Rules</h2>

      {rules.length === 0 ? (
        <div className="empty">No rules yet. Create one above!</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Trigger</th>
              <th>Filter</th>
              <th>Action</th>
              <th>Value</th>
              <th>Enabled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule: Rule) => (
              <tr key={rule.id}>
                <td>{TRIGGER_LABELS[rule.triggerType] ?? rule.triggerType}</td>
                <td>{rule.triggerValue || "—"}</td>
                <td>{ACTION_LABELS[rule.actionType] ?? rule.actionType}</td>
                <td className="mono">{rule.actionValue || "—"}</td>
                <td>{rule.enabled ? "Yes" : "No"}</td>
                <td className="action-buttons">
                  <form
                    method="POST"
                    action={`/repos/${repo.id}/rules/${rule.id}/toggle`}
                    style={{ display: "inline" }}
                  >
                    <button type="submit" className="btn-toggle">
                      {rule.enabled ? "Disable" : "Enable"}
                    </button>
                  </form>
                  <form
                    method="POST"
                    action={`/repos/${repo.id}/rules/${rule.id}/delete`}
                    style={{ display: "inline" }}
                  >
                    <button type="submit" className="btn-delete">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="webhook-info">
        <h3>Webhook URL</h3>
        <p>
          Point your GitHub repository webhook to:
        </p>
        <code className="webhook-url">
          POST {"<your-host>"}/webhooks/{repo.id}
        </code>
        <p className="hint">
          Set content type to <code>application/json</code> and select the
          events that match your triggers.
        </p>
      </div>
    </Layout>
  );
}
