import { createRoot } from "react-dom/client";
import AppWrapper from "./AppWrapper.tsx";
import "./index.css";

// Add global error handler
window.addEventListener('error', (event) => {
	console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
	console.error('Unhandled promise rejection:', event.reason);
});

try {
	const rootElement = document.getElementById("root");
	if (!rootElement) {
		throw new Error('Root element not found');
	}
	
	console.log('Attempting to render React app...');
	createRoot(rootElement).render(<AppWrapper />);
	console.log('React app render initiated successfully');
} catch (error) {
	console.error('Fatal error during app initialization:', error);
	// Display error to user
	const rootElement = document.getElementById("root");
	if (rootElement) {
		rootElement.innerHTML = `
			<div style="padding: 20px; max-width: 600px; margin: 50px auto; font-family: sans-serif;">
				<h1 style="color: #dc2626;">Application Failed to Load</h1>
				<p>An error occurred while initializing the application. Please try:</p>
				<ul>
					<li>Refreshing the page</li>
					<li>Clearing your browser cache</li>
					<li>Using a different browser</li>
				</ul>
				<details style="margin-top: 20px;">
					<summary style="cursor: pointer; font-weight: bold;">Technical Details</summary>
					<pre style="background: #f3f4f6; padding: 10px; margin-top: 10px; overflow: auto;">${error instanceof Error ? error.message + '\n' + error.stack : String(error)}</pre>
				</details>
			</div>
		`;
	}
}
