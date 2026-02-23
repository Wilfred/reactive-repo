type Child = string | number | boolean | null | undefined | Child[];

type Props = Record<string, unknown> | null;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function flatten(arr: Child[]): (string | number | boolean | null | undefined)[] {
  const result: (string | number | boolean | null | undefined)[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

function renderChildren(children: Child[]): string {
  return flatten(children)
    .map((c) => {
      if (c == null || c === false || c === true) return "";
      return String(c);
    })
    .join("");
}

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "source", "track", "wbr",
]);

export function h(
  tag: string | ((props: Props) => string),
  props: Props,
  ...children: Child[]
): string {
  if (typeof tag === "function") {
    return tag({ ...props, children });
  }

  let html = `<${tag}`;
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key === "children") continue;
      if (value === true) {
        html += ` ${key}`;
      } else if (value !== false && value != null) {
        html += ` ${key}="${escapeHtml(String(value))}"`;
      }
    }
  }

  if (VOID_ELEMENTS.has(tag)) {
    html += " />";
  } else {
    html += `>${renderChildren(children)}</${tag}>`;
  }

  return html;
}

export function Fragment(_props: Props, ...children: Child[]): string {
  return renderChildren(children);
}
