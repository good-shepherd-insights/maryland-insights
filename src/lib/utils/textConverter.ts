import { slug } from "github-slugger";
import { marked } from "marked";
import * as emoji from "node-emoji";

const emojifyShortcodes = (content: string | undefined | null) => {
  if (!content) return "";
  return emoji.emojify(content);
};

// slugify
export const slugify = (content: string | undefined | null) => {
  if (!content) return "";
  return slug(content);
};

// markdownify
export const markdownify = (
  content: string | undefined | null,
  div?: boolean,
) => {
  if (!content) return "";
  const emojified = emojifyShortcodes(content) as string;
  return div
    ? marked.parse(emojified)
    : (marked.parseInline(emojified) as string);
};

// humanize
export const humanize = (content: string | undefined | null) => {
  if (!content) return "";
  return content
    .replace(/^[\s_]+|[\s_]+$/g, "")
    .replace(/[_\s]+/g, " ")
    .replace(/[-\s]+/g, " ")
    .replace(/^[a-z]/, function (m) {
      return m.toUpperCase();
    });
};

// titleify
export const titleify = (content: string | undefined | null) => {
  if (!content) return "";
  const humanized = humanize(content);
  return humanized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// plainify
export const plainify = (content: string | undefined | null) => {
  if (!content) return "";
  const parseMarkdown: any = marked.parse(emojifyShortcodes(content) as string);
  const filterBrackets = parseMarkdown.replace(/<\/?[^>]+(>|$)/gm, "");
  const filterSpaces = filterBrackets.replace(/[\r\n]\s*[\r\n]/gm, "");
  const stripHTML = htmlEntityDecoder(filterSpaces);
  return stripHTML;
};

// strip entities for plainify
const htmlEntityDecoder = (htmlWithEntities: string) => {
  let entityList: { [key: string]: string } = {
    "&nbsp;": " ",
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
  };
  let htmlWithoutEntities: string = htmlWithEntities.replace(
    /(&amp;|&lt;|&gt;|&quot;|&#39;)/g,
    (entity: string): string => {
      return entityList[entity];
    },
  );
  return htmlWithoutEntities;
};
