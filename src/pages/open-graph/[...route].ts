import type { APIRoute } from "astro";
import { heroMaps } from "@/lib/home/heroArt.mjs";
import { homeCopy } from "@/lib/home/copy";
import { getHomeRedesign } from "@/lib/sanity/queries";
import { loadAllSeo, loadNotFoundSeo } from "@/lib/seo/load";
import { drawCard, type Card } from "@/lib/seo/openGraphCard";
import { cardPicture } from "@/lib/seo/openGraphImagePath";

export const prerender = true;

export async function getStaticPaths() {
  const missing = await loadNotFoundSeo();
  const pages = [...(await loadAllSeo()), { route: "/404", head: missing }];
  return pages.map(({ route, head }) => ({
    params: { route: `${route.replace(/^\//, "") || "home"}.png` },
    props: { route, title: head.ogTitle ?? head.title, description: head.ogDescription ?? head.description ?? "", picture: cardPicture(head) } satisfies Card,
  }));
}

const map = homeCopy(await getHomeRedesign());

export const GET: APIRoute<Card> = async ({ props }) =>
  new Response(new Uint8Array(await drawCard(props, heroMaps(map.counts).wide.svg)), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=0, must-revalidate" } });
