import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

const basePath = import.meta.env.BASE_URL || "/";

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[GameZone] render error:", error);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center text-[#f2fff5]">
        <h2 className="text-2xl font-bold">This section couldn't load</h2>
        <p className="max-w-md text-sm text-[#b1c9b8]">
          The game server isn't reachable right now, so this page has no data to show. You can head
          back and keep browsing.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="rounded-xl bg-[#39e36b] px-5 py-2.5 font-bold text-[#06200d] hover:bg-[#62f07f]"
          >
            Try again
          </button>
          <a
            href={basePath}
            className="rounded-xl border border-[#31533d] bg-[#102319] px-5 py-2.5 font-bold text-[#f2fff5] hover:border-[#62f07f]"
          >
            Go home
          </a>
        </div>
      </div>
    );
  }
}
