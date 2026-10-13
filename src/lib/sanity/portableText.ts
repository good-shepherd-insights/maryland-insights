import { toHTML } from "@portabletext/to-html";

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export type TocHeading = { id: string; text: string; level: number };

// Pull h2 blocks out of Portable Text for the table of contents.
export function extractHeadings(blocks: any[]): TocHeading[] {
  const out: TocHeading[] = [];
  for (const block of blocks ?? []) {
    if (block?._type !== "block" || block.style !== "h2") continue;
    const text = (block.children ?? [])
      .map((c: any) => c.text ?? "")
      .join("");
    if (!text.trim()) continue;
    out.push({ id: slugifyHeading(text), text: text.trim(), level: 2 });
  }
  return out;
}

// Render Portable Text body to HTML compatible with the existing .prose styles.
export function renderPortableText(blocks: any[]): string {
  return toHTML(blocks ?? [], {
    components: {
      block: {
        h1: ({ children }: any) => `<h1>${children}</h1>`,
        h2: ({ children, value }: any) =>
          `<h2 id="${slugifyHeading(
            (value.children ?? []).map((c: any) => c.text ?? "").join(""),
          )}">${children}</h2>`,
        h3: ({ children }: any) => `<h3>${children}</h3>`,
        h4: ({ children }: any) => `<h4>${children}</h4>`,
        blockquote: ({ children }: any) =>
          `<blockquote>${children}</blockquote>`,
        normal: ({ children }: any) => `<p>${children}</p>`,
      },
      marks: {
        strong: ({ children }: any) => `<strong>${children}</strong>`,
        em: ({ children }: any) => `<em>${children}</em>`,
        code: ({ children }: any) => `<code>${children}</code>`,
        link: ({ children, value }: any) => {
          const href = value?.href ?? "";
          const external = /^https?:\/\//.test(href);
          return `<a href="${href}"${
            external ? ` target="_blank" rel="noopener noreferrer"` : ""
          }>${children}</a>`;
        },
      },
      list: {
        bullet: ({ children }: any) => `<ul>${children}</ul>`,
        number: ({ children }: any) => `<ol>${children}</ol>`,
      },
      listItem: {
        bullet: ({ children }: any) => `<li>${children}</li>`,
        number: ({ children }: any) => `<li>${children}</li>`,
      },
    },
  });
}
