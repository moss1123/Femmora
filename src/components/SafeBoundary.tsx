import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * Keeps an optional layer (the WebGL rack) from taking the whole site down:
 * if it throws — chunk failed to load, WebGL unavailable — render the fallback instead.
 */
export default class SafeBoundary extends Component<{ children: ReactNode; fallback?: ReactNode; onError?: () => void }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[Femmora] optional layer disabled:', error.message, info.componentStack?.split('\n')[1]?.trim())
    this.props.onError?.()
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}
