import "reflect-metadata";
import React from "react";
import ReactDOMServer from "react-dom/server";
import express, { Request, Response } from "express";
import { DataSource } from "typeorm";
import { Repository } from "./entity/Repository";
import { Rule, TriggerType, ActionType } from "./entity/Rule";
import { HomePage } from "./views/HomePage";
import { RulesPage } from "./views/RulesPage";
import { handleWebhook } from "./webhook";

const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "repos.db",
  synchronize: true,
  entities: [Repository, Rule],
});

function render(element: React.ReactElement): string {
  return "<!DOCTYPE html>" + ReactDOMServer.renderToStaticMarkup(element);
}

async function main(): Promise<void> {
  await AppDataSource.initialize();
  const repoRepository = AppDataSource.getRepository(Repository);
  const ruleRepository = AppDataSource.getRepository(Rule);

  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // ── Home page ──────────────────────────────────────────────────────
  app.get("/", async (_req: Request, res: Response) => {
    const repos = await repoRepository.find({ order: { id: "DESC" } });
    res.type("html").send(render(<HomePage repos={repos} />));
  });

  // ── Repository CRUD ────────────────────────────────────────────────
  app.post("/repos", async (req: Request, res: Response) => {
    const { owner, name } = req.body as { owner: string; name: string };
    if (owner && name) {
      const repo = repoRepository.create({
        owner: owner.trim(),
        name: name.trim(),
      });
      await repoRepository.save(repo);
    }
    res.redirect("/");
  });

  app.post("/repos/:id/delete", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    if (!isNaN(id)) {
      await repoRepository.delete(id);
    }
    res.redirect("/");
  });

  // ── Rules UI ───────────────────────────────────────────────────────
  app.get("/repos/:id/rules", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const repo = await repoRepository.findOneBy({ id });
    if (!repo) {
      res.status(404).send("Repository not found");
      return;
    }
    const rules = await ruleRepository.find({
      where: { repositoryId: repo.id },
      order: { id: "DESC" },
    });
    res.type("html").send(render(<RulesPage repo={repo} rules={rules} />));
  });

  app.post("/repos/:id/rules", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const repo = await repoRepository.findOneBy({ id });
    if (!repo) {
      res.status(404).send("Repository not found");
      return;
    }
    const { triggerType, triggerValue, actionType, actionValue } = req.body as {
      triggerType: TriggerType;
      triggerValue: string;
      actionType: ActionType;
      actionValue: string;
    };
    const rule = ruleRepository.create({
      repositoryId: repo.id,
      triggerType,
      triggerValue: (triggerValue ?? "").trim(),
      actionType,
      actionValue: (actionValue ?? "").trim(),
      enabled: true,
    });
    await ruleRepository.save(rule);
    res.redirect(`/repos/${repo.id}/rules`);
  });

  app.post("/repos/:repoId/rules/:ruleId/toggle", async (req: Request, res: Response) => {
    const repoId = parseInt(req.params.repoId as string, 10);
    const ruleId = parseInt(req.params.ruleId as string, 10);
    const rule = await ruleRepository.findOneBy({ id: ruleId, repositoryId: repoId });
    if (rule) {
      rule.enabled = !rule.enabled;
      await ruleRepository.save(rule);
    }
    res.redirect(`/repos/${repoId}/rules`);
  });

  app.post("/repos/:repoId/rules/:ruleId/delete", async (req: Request, res: Response) => {
    const repoId = parseInt(req.params.repoId as string, 10);
    const ruleId = parseInt(req.params.ruleId as string, 10);
    await ruleRepository.delete({ id: ruleId, repositoryId: repoId });
    res.redirect(`/repos/${repoId}/rules`);
  });

  // ── Webhook endpoint ───────────────────────────────────────────────
  app.post("/webhooks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const repo = await repoRepository.findOneBy({ id });
    if (!repo) {
      res.status(404).json({ error: "Repository not found" });
      return;
    }

    const eventType = req.headers["x-github-event"] as string | undefined;
    if (!eventType) {
      res.status(400).json({ error: "Missing X-GitHub-Event header" });
      return;
    }

    const result = await handleWebhook(AppDataSource, repo, eventType, req.body);
    res.json(result);
  });

  // ── Start server ───────────────────────────────────────────────────
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Reactive Repo running at http://localhost:${port}`);
  });
}

main().catch((err: unknown) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
