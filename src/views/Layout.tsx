import React from "react";

export function Layout(props: { title: string; children?: React.ReactNode }): React.ReactElement {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title}</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 2rem auto;
            padding: 0 1rem;
            background: #f6f8fa;
            color: #24292f;
          }
          h1 { border-bottom: 1px solid #d0d7de; padding-bottom: 0.5rem; }
          .subtitle { color: #656d76; margin-top: -0.5rem; margin-bottom: 1.5rem; }
          .card {
            background: #fff;
            border: 1px solid #d0d7de;
            border-radius: 6px;
            padding: 1rem 1.25rem;
            margin-bottom: 1.5rem;
          }
          .card h2 { margin-top: 0; font-size: 1.1rem; }
          form { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: end; margin-bottom: 1rem; }
          .rule-form { flex-direction: column; align-items: stretch; }
          .form-row { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
          .form-row label { flex: 1; min-width: 200px; }
          label { display: flex; flex-direction: column; font-size: 0.875rem; font-weight: 600; }
          input[type="text"], select {
            margin-top: 0.25rem;
            padding: 0.4rem 0.75rem;
            border: 1px solid #d0d7de;
            border-radius: 6px;
            font-size: 0.875rem;
            background: #fff;
          }
          select { height: 2.1rem; }
          button {
            padding: 0.4rem 1rem;
            border: 1px solid rgba(27,31,36,0.15);
            border-radius: 6px;
            font-size: 0.875rem;
            cursor: pointer;
          }
          .btn-add { background: #2da44e; color: #fff; }
          .btn-add:hover { background: #218838; }
          .btn-delete { background: #cf222e; color: #fff; }
          .btn-delete:hover { background: #a40e26; }
          .btn-toggle { background: #bf8700; color: #fff; }
          .btn-toggle:hover { background: #9a6700; }
          .btn-rules {
            display: inline-block;
            padding: 0.25rem 0.6rem;
            background: #0969da;
            color: #fff;
            border-radius: 6px;
            text-decoration: none;
            font-size: 0.8rem;
          }
          .btn-rules:hover { background: #0550ae; }
          table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 6px; overflow: hidden; border: 1px solid #d0d7de; }
          th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #d0d7de; }
          th { background: #f6f8fa; font-size: 0.875rem; }
          td { font-size: 0.875rem; }
          td.mono { font-family: monospace; font-size: 0.8rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .action-buttons { white-space: nowrap; }
          .action-buttons form { display: inline; margin: 0; }
          .action-buttons button { margin-right: 0.25rem; }
          .empty { padding: 2rem; text-align: center; color: #656d76; }
          a { color: #0969da; }
          .webhook-info {
            margin-top: 2rem;
            padding: 1rem 1.25rem;
            background: #ddf4ff;
            border: 1px solid #54aeff;
            border-radius: 6px;
          }
          .webhook-info h3 { margin-top: 0; }
          .webhook-url {
            display: block;
            padding: 0.5rem 0.75rem;
            background: #fff;
            border: 1px solid #d0d7de;
            border-radius: 4px;
            font-size: 0.9rem;
          }
          .hint { font-size: 0.8rem; color: #656d76; }
        `}</style>
      </head>
      <body>
        {props.children}
      </body>
    </html>
  );
}
