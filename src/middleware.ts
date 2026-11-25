import { defineMiddleware } from "astro:middleware";
import { isDataError, reportBroken, reportOk } from "@/lib/broken";
import { warmChrome } from "@/lib/sanity/queries";
import { ROUTES, isRepeatable } from "@/lib/seo/contract.mjs";
import { keepVisibleFaqs } from "@/lib/seo/visible.mjs";

const repeatable = new Set(Object.keys(ROUTES).filter(isRepeatable).map((t) => ROUTES[t as keyof typeof ROUTES].replace("{slug}", "")));
const isContentPage = (pattern: string) => /\/\[\w+\]$/.test(pattern) && repeatable.has(pattern.replace(/\[\w+\]$/, ""));

export const onRequest = defineMiddleware(async (context, next) => {
  if (!context.isPrerendered && !/^\/(?:api|_image|_server-islands)(?:\/|$)/.test(context.url.pathname)) warmChrome();
  let response: Response, html: string;
  try {
    response = await next();
    if (!response.headers.get("content-type")?.startsWith("text/html") || !response.body) return response;
    html = await response.text();
  } catch (error) {
    // Last resort for one broken document at build: its address shows the
    // not-found page, noindex. Fixed pages and any other error still fail.
    if (!context.isPrerendered || !isContentPage(context.routePattern) || !isDataError(error)) throw error;
    reportBroken(`page ${context.routePattern}`, context.url.pathname, `page not published: ${(error as Error).message}`, true);
    const missing = await context.rewrite("/404");
    return new Response(await missing.text(), { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  }
  if (isContentPage(context.routePattern)) reportOk(`page ${context.routePattern}`);
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
