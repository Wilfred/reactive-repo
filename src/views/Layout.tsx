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
            max-width: 700px;
            margin: 2rem auto;
            padding: 0 1rem;
            background: #f6f8fa;
            color: #24292f;
          }
          h1 { border-bottom: 1px solid #d0d7de; padding-bottom: 0.5rem; }
          form { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: end; margin-bottom: 1.5rem; }
          label { display: flex; flex-direction: column; font-size: 0.875rem; font-weight: 600; }
          input[type="text"] {
            margin-top: 0.25rem;
            padding: 0.4rem 0.75rem;
            border: 1px solid #d0d7de;
            border-radius: 6px;
            font-size: 0.875rem;
          }
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
          table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 6px; overflow: hidden; border: 1px solid #d0d7de; }
          th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #d0d7de; }
          th { background: #f6f8fa; font-size: 0.875rem; }
          td { font-size: 0.875rem; }
          .empty { padding: 2rem; text-align: center; color: #656d76; }
        `}</style>
      </head>
      <body>
        {props.children}
      </body>
    </html>
  );
}
