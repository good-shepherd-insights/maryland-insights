import { marked } from "marked";
import * as emoji from "node-emoji";

const ENTITIES = { "&nbsp;": " ", "&lt;": "<", "&gt;": ">", "&amp;": "&", "&quot;": '"', "&#39;": "'" };

/** Markdown or HTML to plain text. */
export const plainify = (content) => {
  if (typeof content !== "string" || !content) return "";
  return marked.parse(emoji.emojify(content))
    .replace(/<\/?[^>]+(>|$)/gm, "")
    .replace(/[\r\n]\s*[\r\n]/gm, "")
    .replace(/&(nbsp|lt|gt|amp|quot|#39);/g, (m) => ENTITIES[m])
    .trim();
};
