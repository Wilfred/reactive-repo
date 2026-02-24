import { DataSource } from "typeorm";
import { Rule, TriggerType } from "./entity/Rule";
import { Repository } from "./entity/Repository";

/**
 * Marker embedded in comments created by reactive-repo.
 * Used for loop protection: if we see this in an incoming event,
 * we know it originated from our own action and skip processing.
 */
const BOT_MARKER = "<!-- reactive-repo-bot -->";

/**
 * The bot username whose actions we ignore (set via GITHUB_BOT_USERNAME env).
 * This is a second layer of loop protection beyond the content marker.
 */
function getBotUsername(): string | undefined {
  return process.env.GITHUB_BOT_USERNAME;
}

/** Minimal shape of a GitHub webhook payload for the events we handle. */
interface GitHubWebhookPayload {
  action?: string;
  sender?: { login: string };
  issue?: { number: number; body?: string };
  pull_request?: { number: number; body?: string };
  comment?: { body: string };
  label?: { name: string };
}

interface WebhookResult {
  skipped: boolean;
  reason?: string;
  actionsExecuted: string[];
}

/**
 * Process an incoming GitHub webhook event.
 *
 * Loop protection is applied at two levels:
 *  1. Actor check — if the event sender matches the configured bot username,
 *     the event is ignored entirely.
 *  2. Content marker — if the event body/comment contains our BOT_MARKER,
 *     the event is ignored.
 */
export async function handleWebhook(
  ds: DataSource,
  repo: Repository,
  eventType: string,
  payload: GitHubWebhookPayload,
): Promise<WebhookResult> {
  // --- Loop protection: check actor ---
  const sender: string | undefined = payload.sender?.login;
  const botUsername = getBotUsername();
  if (botUsername && sender && sender.toLowerCase() === botUsername.toLowerCase()) {
    return { skipped: true, reason: "Event triggered by bot user (loop protection)", actionsExecuted: [] };
  }

  // --- Loop protection: check content marker ---
  const bodyFields: (string | undefined)[] = [
    payload.comment?.body,
    payload.issue?.body,
    payload.pull_request?.body,
  ];
  for (const body of bodyFields) {
    if (typeof body === "string" && body.includes(BOT_MARKER)) {
      return { skipped: true, reason: "Event contains bot marker (loop protection)", actionsExecuted: [] };
    }
  }

  // --- Determine the trigger type from the GitHub event ---
  const trigger = mapEventToTrigger(eventType, payload);
  if (!trigger) {
    return { skipped: true, reason: `Unrecognized event: ${eventType}/${payload.action}`, actionsExecuted: [] };
  }

  // --- Load matching rules ---
  const ruleRepo = ds.getRepository(Rule);
  const rules = await ruleRepo.find({
    where: { repositoryId: repo.id, triggerType: trigger.type, enabled: true },
  });

  const executed: string[] = [];

  for (const rule of rules) {
    // If the rule has a trigger filter value, check it matches
    if (rule.triggerValue && trigger.value && rule.triggerValue !== trigger.value) {
      continue;
    }

    const description = executeAction(repo, rule, trigger);
    executed.push(description);
  }

  return { skipped: false, actionsExecuted: executed };
}

interface TriggerInfo {
  type: TriggerType;
  value?: string;
  issueNumber?: number;
}

function mapEventToTrigger(
  eventType: string,
  payload: GitHubWebhookPayload,
): TriggerInfo | null {
  switch (eventType) {
    case "issues":
      switch (payload.action) {
        case "opened":
          return { type: "issue_opened", issueNumber: payload.issue?.number };
        case "closed":
          return { type: "issue_closed", issueNumber: payload.issue?.number };
        case "labeled":
          return {
            type: "issue_labeled",
            value: payload.label?.name,
            issueNumber: payload.issue?.number,
          };
        default:
          return null;
      }

    case "pull_request":
      switch (payload.action) {
        case "opened":
          return { type: "pull_request_opened", issueNumber: payload.pull_request?.number };
        case "closed":
          return { type: "pull_request_closed", issueNumber: payload.pull_request?.number };
        default:
          return null;
      }

    case "issue_comment":
      if (payload.action === "created") {
        return { type: "issue_comment_created", issueNumber: payload.issue?.number };
      }
      return null;

    default:
      return null;
  }
}

/**
 * Execute an action for a matched rule.
 *
 * In a production deployment this would call the GitHub API.
 * For now we log the action and return a description of what would happen.
 * The comment text includes BOT_MARKER for loop protection.
 */
function executeAction(
  repo: Repository,
  rule: Rule,
  trigger: TriggerInfo,
): string {
  const target = `${repo.owner}/${repo.name}#${trigger.issueNumber ?? "?"}`;

  switch (rule.actionType) {
    case "add_comment": {
      const text = `${BOT_MARKER}\n${rule.actionValue}`;
      const desc = `POST /repos/${repo.owner}/${repo.name}/issues/${trigger.issueNumber}/comments — body: ${text}`;
      console.log(`[reactive-repo] ACTION add_comment on ${target}: ${rule.actionValue}`);
      return desc;
    }
    case "add_label": {
      const desc = `POST /repos/${repo.owner}/${repo.name}/issues/${trigger.issueNumber}/labels — label: ${rule.actionValue}`;
      console.log(`[reactive-repo] ACTION add_label on ${target}: ${rule.actionValue}`);
      return desc;
    }
    case "close_issue": {
      const desc = `PATCH /repos/${repo.owner}/${repo.name}/issues/${trigger.issueNumber} — state: closed`;
      console.log(`[reactive-repo] ACTION close_issue on ${target}`);
      return desc;
    }
    case "assign_user": {
      const desc = `POST /repos/${repo.owner}/${repo.name}/issues/${trigger.issueNumber}/assignees — user: ${rule.actionValue}`;
      console.log(`[reactive-repo] ACTION assign_user on ${target}: ${rule.actionValue}`);
      return desc;
    }
    default:
      return `Unknown action: ${rule.actionType}`;
  }
}
