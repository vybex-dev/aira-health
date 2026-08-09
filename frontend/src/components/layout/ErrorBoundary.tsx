import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-ink flex items-center justify-center px-6">
          <div className="max-w-sm text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-coral/10 text-coral mb-5">
              <AlertTriangle size={20} />
            </span>
            <h1 className="font-display font-semibold text-xl text-mist mb-2">Something went wrong</h1>
            <p className="text-sm text-slate mb-6 leading-relaxed">
              Aira hit an unexpected error. Reloading usually fixes it — if it keeps
              happening, please try again in a moment.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-full bg-vital text-ink text-sm font-semibold hover:bg-vital-dim transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
