import { useEffect } from "react";

export function useSEO({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") ?? "";

    if (meta) {
      meta.setAttribute("content", description);
    } else {
      meta = document.createElement("meta");
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }

    return () => {
      document.title = prevTitle;
      document.querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.setAttribute("content", prevDesc);
    };
  }, [title, description]);
}
