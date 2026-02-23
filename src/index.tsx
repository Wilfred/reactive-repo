import "reflect-metadata";
import React from "react";
import ReactDOMServer from "react-dom/server";
import express from "express";
import { DataSource } from "typeorm";
import { Repository } from "./entity/Repository";
import { HomePage } from "./views/HomePage";

const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "repos.db",
  synchronize: true,
  entities: [Repository],
});

async function main() {
  await AppDataSource.initialize();
  const repoRepository = AppDataSource.getRepository(Repository);

  const app = express();
  app.use(express.urlencoded({ extended: true }));

  app.get("/", async (_req, res) => {
    const repos = await repoRepository.find({ order: { id: "DESC" } });
    const html = "<!DOCTYPE html>" + ReactDOMServer.renderToStaticMarkup(<HomePage repos={repos} />);
    res.type("html").send(html);
  });

  app.post("/repos", async (req, res) => {
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

  app.post("/repos/:id/delete", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!isNaN(id)) {
      await repoRepository.delete(id);
    }
    res.redirect("/");
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
