import { useEffect } from "react";
import { useLocation } from "wouter";

/** /drift → unified Creation Room (bedtime funnel). Keeps SEO URLs; one generation pipeline. */
export default function Drift() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/after-dark?funnel=bedtime&enter=1");
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
      />
    </div>
  );
}
