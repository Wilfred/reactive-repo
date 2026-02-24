import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Repository } from "./Repository";

export type TriggerType =
  | "issue_labeled"
  | "issue_opened"
  | "issue_closed"
  | "pull_request_opened"
  | "pull_request_closed"
  | "issue_comment_created";

export type ActionType =
  | "add_comment"
  | "add_label"
  | "close_issue"
  | "assign_user";

export const TRIGGER_LABELS: Record<TriggerType, string> = {
  issue_labeled: "Label added to issue",
  issue_opened: "Issue opened",
  issue_closed: "Issue closed",
  pull_request_opened: "Pull request opened",
  pull_request_closed: "Pull request closed",
  issue_comment_created: "Comment added to issue",
};

export const ACTION_LABELS: Record<ActionType, string> = {
  add_comment: "Add a comment",
  add_label: "Add a label",
  close_issue: "Close the issue",
  assign_user: "Assign a user",
};

@Entity()
export class Rule {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Repository, { onDelete: "CASCADE" })
  @JoinColumn({ name: "repositoryId" })
  repository!: Repository;

  @Column()
  repositoryId!: number;

  @Column()
  triggerType!: TriggerType;

  /** Optional filter value for the trigger, e.g. a specific label name. */
  @Column({ default: "" })
  triggerValue!: string;

  @Column()
  actionType!: ActionType;

  /** Value for the action, e.g. comment text, label name, or username. */
  @Column({ default: "" })
  actionValue!: string;

  @Column({ default: true })
  enabled!: boolean;
}
