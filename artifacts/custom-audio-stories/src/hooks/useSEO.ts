import { useEffect } from "react";

const SITE_NAME = "The Private Story";
const DEFAULT_OG_IMAGE = "https://theprivatestory.com/opengraph.jpg";

function setMeta(selector: string, attr: string, value: string, attrName = "content") {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (el) {
    el.setAttribute(attrName, value);
  } else {
    el = document.createElement("meta");
    el.setAttribute(attr, selector.match(/\[.*?="(.*?)"\]/)?.[1] ?? "");
    el.setAttribute(attrName, value);
    document.head.appendChild(el);
  }
  return el;
}

function setCanonical(url: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (el) {
    el.setAttribute("href", url);
  } else {
    el = document.createElement("link");
    el.rel = "canonical";
    el.href = url;
    document.head.appendChild(el);
  }
  return el;
}

export function useSEO({
  title,
  description,
  ogImage,
}: {
  title: string;
  description: string;
  ogImage?: string;
}) {
  useEffect(() => {
    const prevTitle = document.title;
    const image = ogImage ?? DEFAULT_OG_IMAGE;
    const url = window.location.href;

    document.title = title;

    const prevDesc = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
    const prevOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? "";
    const prevOgDesc = document.querySelector('meta[property="og:description"]')?.getAttribute("content") ?? "";
    const prevOgUrl = document.querySelector('meta[property="og:url"]')?.getAttribute("content") ?? "";
    const prevTwTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute("content") ?? "";
    const prevTwDesc = document.querySelector('meta[name="twitter:description"]')?.getAttribute("content") ?? "";
    const prevCanonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";

    setMeta('meta[name="description"]', "name", description);
    setMeta('meta[property="og:title"]', "property", title);
    setMeta('meta[property="og:description"]', "property", description);
    setMeta('meta[property="og:url"]', "property", url);
    setMeta('meta[property="og:image"]', "property", image);
    setMeta('meta[property="og:site_name"]', "property", SITE_NAME);
    setMeta('meta[name="twitter:title"]', "name", title);
    setMeta('meta[name="twitter:description"]', "name", description);
    setMeta('meta[name="twitter:image"]', "name", image);
    setCanonical(url);

    return () => {
      document.title = prevTitle;
      setMeta('meta[name="description"]', "name", prevDesc);
      setMeta('meta[property="og:title"]', "property", prevOgTitle);
      setMeta('meta[property="og:description"]', "property", prevOgDesc);
      setMeta('meta[property="og:url"]', "property", prevOgUrl);
      setMeta('meta[name="twitter:title"]', "name", prevTwTitle);
      setMeta('meta[name="twitter:description"]', "name", prevTwDesc);
      if (prevCanonical) setCanonical(prevCanonical);
    };
  }, [title, description, ogImage]);
}
