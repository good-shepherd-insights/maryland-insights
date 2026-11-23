import { defineMiddleware } from "astro:middleware";
import { keepVisibleFaqs } from "@/lib/seo/visible.mjs";

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (!response.headers.get("content-type")?.startsWith("text/html")) return response;
  const html = await response.text();
  let body = html;
  try {
    body = keepVisibleFaqs(html, (message) => console.warn(`${context.url.pathname} ${message}`));
  } catch (error) {
    console.error(`${context.url.pathname} FAQ check failed: ${(error as Error).message}`);
  }
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
});
