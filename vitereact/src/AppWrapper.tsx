import React from "react";
import App from "./App.tsx";

// Error Boundary Component
class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	{ hasError: boolean; error: Error | null }
> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('React Error Boundary caught an error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{
					padding: '20px',
					maxWidth: '600px',
					margin: '50px auto',
					fontFamily: 'sans-serif',
					backgroundColor: '#fff',
					borderRadius: '8px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
				}}>
					<h1 style={{ color: '#dc2626', marginBottom: '16px' }}>Something went wrong</h1>
					<p style={{ marginBottom: '16px' }}>
						The application encountered an unexpected error. Please try refreshing the page.
					</p>
					<button
						onClick={() => window.location.reload()}
						style={{
							backgroundColor: '#7c3aed',
							color: 'white',
							padding: '10px 20px',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
							fontSize: '14px',
							fontWeight: '500'
						}}
					>
						Refresh Page
					</button>
					<details style={{ marginTop: '20px' }}>
						<summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
							Technical Details
						</summary>
						<pre style={{
							background: '#f3f4f6',
							padding: '10px',
							borderRadius: '4px',
							overflow: 'auto',
							fontSize: '12px'
						}}>
							{this.state.error?.message}
							{this.state.error?.stack && `\n\n${this.state.error.stack}`}
						</pre>
					</details>
				</div>
			);
		}

		return this.props.children;
	}
}

const AppWrapper: React.FC = () => {
	return (
		<ErrorBoundary>
			<App />
		</ErrorBoundary>
	);
};

export default AppWrapper;
