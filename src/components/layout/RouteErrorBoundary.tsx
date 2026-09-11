import { Component, type ErrorInfo, type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { EmptyState } from "@/components/layout/EmptyState"

type BoundaryProps = { children: ReactNode }
type BoundaryState = { hasError: boolean }

class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false }

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("In the Back view error", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          eyebrow="Board hiccup"
          title="This view stalled."
          primaryTo="/"
          primaryLabel="Back to the board"
          titleAs="h1"
        >
          <p>
            Something in this screen broke. The rest of the house is still up. Try the board or
            the directory. This is not a live filing.
          </p>
        </EmptyState>
      )
    }
    return this.props.children
  }
}

/** Remount on route change so a stalled view does not trap the rest of the board. */
export function RouteErrorBoundary({ children }: BoundaryProps) {
  const { pathname } = useLocation()
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>
}
