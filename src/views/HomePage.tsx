import { h } from "../jsx";
import { Layout } from "./Layout";
import { Repository } from "../entity/Repository";

export function HomePage(props: { repos: Repository[] }): string {
  return (
    <Layout title="GitHub Repo Tracker">
      <h1>GitHub Repository Tracker</h1>

      <h2>Add a Repository</h2>
      <form method="POST" action="/repos">
        <label>
          Owner
          <input type="text" name="owner" placeholder="e.g. facebook" required />
        </label>
        <label>
          Repository
          <input type="text" name="name" placeholder="e.g. react" required />
        </label>
        <button type="submit" class="btn-add">Add</button>
      </form>

      <h2>Tracked Repositories</h2>
      {props.repos.length === 0 ? (
        <div class="empty">No repositories tracked yet. Add one above!</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Owner</th>
              <th>Repository</th>
              <th>Link</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {props.repos.map((repo) => (
              <tr>
                <td>{repo.owner}</td>
                <td>{repo.name}</td>
                <td>
                  <a
                    href={`https://github.com/${repo.owner}/${repo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repo.owner}/{repo.name}
                  </a>
                </td>
                <td>
                  <form method="POST" action={`/repos/${repo.id}/delete`} style="display:inline">
                    <button type="submit" class="btn-delete">Remove</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
