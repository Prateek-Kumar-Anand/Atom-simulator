import React from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Catches render-time errors anywhere in its subtree. Without this, React
 * unmounts the *entire* app on any uncaught error — which is exactly the
 * "whole site goes white, nothing shows" failure mode. This boundary
 * contains the damage to the active module, shows the real error and
 * component stack on screen (so it's diagnosable without opening dev
 * tools), and offers a way back to a different module.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error("Module render error:", error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    // If the active module changes (user navigated away), clear the error so
    // switching modules always gets a fresh render attempt instead of staying stuck.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null, info: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="qp-card" style={{ margin: 16, borderColor: "#e23d57" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, color: "#e23d57" }}>
            <AlertTriangle size={18} /> This module hit an error
          </h3>
          <p className="qp-element-summary">
            {String(this.state.error?.message || this.state.error)}
          </p>
          <p className="qp-muted small" style={{ marginTop: 8 }}>
            Pick a different module from the sidebar, or reload the page. The error above (and a
            full component stack in the browser console) is what to share when reporting this.
          </p>
          {this.state.info?.componentStack && (
            <pre style={{ fontSize: 10, color: "var(--muted)", overflowX: "auto", marginTop: 10, whiteSpace: "pre-wrap" }}>
              {this.state.info.componentStack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
