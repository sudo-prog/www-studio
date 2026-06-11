export interface Layer {
  id: string;
  name: string;
  tag: string;
  depth?: number;
}

export function parseHtmlLayers(html: string | null | undefined): Layer[] {
  if (!html) return [];
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const children = Array.from(doc.body.children);
    return children.map((el, i) => {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : "";
      const firstClass = el.classList[0] ? `.${el.classList[0]}` : "";
      const role = el.getAttribute("role") ?? "";
      const text = el.textContent?.trim().slice(0, 20) ?? "";
      const name = id || role || firstClass || `${tag}${text ? ` "${text}"` : ""}`;
      return { id: `layer-${i}`, name, tag, depth: 0 };
    });
  } catch {
    return [{ id: "body", name: "body", tag: "div", depth: 0 }];
  }
}

export function reorderHtml(html: string, layers: Layer[]): string {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const children = Array.from(doc.body.children);
    const htmlMap: Record<string, string> = {};
    children.forEach((el, i) => {
      htmlMap[`layer-${i}`] = el.outerHTML;
    });
    return layers.map((l) => htmlMap[l.id] ?? "").join("\n");
  } catch {
    return html;
  }
}
