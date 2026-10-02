export const getOpenGraphImagePath = (pathname: string) => {
  const route = pathname.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, "");
  return `/open-graph/${route || "home"}.png`;
};
