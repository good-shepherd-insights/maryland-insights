import { homeCopy } from "@/lib/home/copy";
import { heroMaps } from "@/lib/home/heroArt.mjs";
import { getHomeRedesign } from "@/lib/sanity/queries";

export const prerender = true;
export async function GET() {
  const { counts } = homeCopy(await getHomeRedesign());
  return new Response(heroMaps(counts).wide.svg, { headers: { "Content-Type": "image/svg+xml" } });
}
