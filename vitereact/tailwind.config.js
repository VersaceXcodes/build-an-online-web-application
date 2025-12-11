/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			colors: {
				// KAKE Brand Colors - Artisan Bakery Palette
				kake: {
					// Primary: Warm Cream background (soft, cozy)
					cream: {
						50: '#fef9f5',
						100: '#fdf3eb',
						200: '#fae7d7',
						300: '#f7dbc3',
						400: '#f5d0b0',
						500: '#F3D8C7', // Main warm cream
						600: '#e0c2ab',
						700: '#c9a88c',
						800: '#b18d6d',
						900: '#8f7256',
					},
					// Secondary: Dark Chocolate Brown text/buttons (rich, warm)
					chocolate: {
						50: '#f5f0ed',
						100: '#ebe1db',
						200: '#d7c3b7',
						300: '#c3a593',
						400: '#8f6a4f',
						500: '#5C311E', // Main dark chocolate brown
						600: '#522c1b',
						700: '#452517',
						800: '#381e13',
						900: '#2d180f',
					},
					// Accent: Light Cream for text on dark backgrounds
					lightCream: {
						50: '#fffefb',
						100: '#fffdf7',
						200: '#fffaeb',
						300: '#fff7df',
						400: '#fff1c7',
						500: '#ffeaaf',
						600: '#e6d49e',
						700: '#bfb184',
						800: '#998d6a',
						900: '#7d7457',
					},
					// Highlight: Caramel accent (for subtle highlights)
					caramel: {
						50: '#fef9f3',
						100: '#fdf2e6',
						200: '#fbe4c0',
						300: '#f9d49a',
						400: '#f5b74d',
						500: '#f19a00',
						600: '#d98b00',
						700: '#b57400',
						800: '#915d00',
						900: '#764c00',
					},
				},
				// Neutral colors with warm undertones
				warm: {
					50: '#fafaf9',
					100: '#f5f5f4',
					200: '#e7e5e4',
					300: '#d6d3d1',
					400: '#a8a29e',
					500: '#78716c',
					600: '#57534e',
					700: '#44403c',
					800: '#292524',
					900: '#1c1917',
				},
			},
			fontFamily: {
				serif: ['Playfair Display', 'serif'],
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			boxShadow: {
				'caramel': '0 4px 14px rgba(241, 154, 0, 0.15)',
				'caramel-lg': '0 10px 25px rgba(241, 154, 0, 0.2)',
				'soft': '0 2px 8px rgba(120, 113, 108, 0.08)',
				'soft-lg': '0 8px 20px rgba(120, 113, 108, 0.12)',
			},
			keyframes: {
				"accordion-down": {
					from: {
						height: "0",
					},
					to: {
						height: "var(--radix-accordion-content-height)",
					},
				},
				"accordion-up": {
					from: {
						height: "var(--radix-accordion-content-height)",
					},
					to: {
						height: "0",
					},
				},
				// KAKE animations
				"drip": {
					"0%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(2px)" },
					"100%": { transform: "translateY(0)" },
				},
				"cream-fade-in": {
					"0%": { opacity: "0", transform: "translateY(-10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				"wobble": {
					"0%, 100%": { transform: "rotate(0deg)" },
					"25%": { transform: "rotate(-1deg)" },
					"75%": { transform: "rotate(1deg)" },
				},
				"soft-bounce": {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-5px)" },
				},
				"frosting-blur": {
					"0%": { opacity: "0", backdropFilter: "blur(0px)" },
					"100%": { opacity: "1", backdropFilter: "blur(8px)" },
				},
				"shimmer": {
					"0%": { backgroundPosition: "-200% 0" },
					"100%": { backgroundPosition: "200% 0" },
				},
				"watermark-fade-in": {
					"0%": { opacity: "0" },
					"100%": { opacity: "0.1" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				// KAKE animations
				"drip": "drip 0.6s ease-in-out",
				"cream-fade-in": "cream-fade-in 0.3s ease-out",
				"wobble": "wobble 0.5s ease-in-out",
				"soft-bounce": "soft-bounce 0.6s ease-in-out infinite",
				"frosting-blur": "frosting-blur 0.3s ease-out",
				"shimmer": "shimmer 2s linear infinite",
				"watermark-fade-in": "watermark-fade-in 3s ease-out forwards",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};
