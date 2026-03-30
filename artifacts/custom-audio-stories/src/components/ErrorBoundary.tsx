import React from "react";
import { RefreshCw, Home } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 text-center px-4 min-h-[60vh]">
          <div className="max-w-md">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">Something went wrong</p>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              An unexpected error occurred.
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We weren't expecting this. Try refreshing the page — if the problem persists, contact us at{" "}
              <a href="mailto:support@theprivatestory.com" className="text-primary hover:underline">
                support@theprivatestory.com
              </a>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh page
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/40 text-foreground/70 font-semibold text-sm hover:border-primary/40 hover:text-primary transition-all"
              >
                <Home className="w-4 h-4" />
                Go home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
