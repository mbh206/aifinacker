import React, {
	createContext,
	useState,
	useContext,
	useEffect,
	ReactNode,
} from 'react';

// Define possible theme types
export type ThemeType = 'light' | 'dark' | 'system';

// Interface for Theme Context
interface ThemeContextType {
	theme: ThemeType;
	setTheme: (theme: ThemeType) => void;
	isDarkMode: boolean;
}

// Create the Theme Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider Component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	// State to manage current theme
	const [theme, setThemeState] = useState<ThemeType>(() => {
		// Get initial theme from local storage or default to system
		const savedTheme = localStorage.getItem('app-theme') as ThemeType;
		return savedTheme || 'system';
	});

	// Determine if dark mode is active
	const isDarkMode = (() => {
		if (theme === 'dark') return true;
		if (theme === 'light') return false;

		// For system theme, check prefers-color-scheme
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	})();

	// Set theme and update local storage
	const setTheme = (newTheme: ThemeType) => {
		setThemeState(newTheme);
		localStorage.setItem('app-theme', newTheme);
	};

	// Effect to apply theme classes and listen to system preference changes
	useEffect(() => {
		const root = window.document.documentElement;

		// Remove existing theme classes
		root.classList.remove('light', 'dark');

		// Apply theme class
		root.classList.add(isDarkMode ? 'dark' : 'light');

		// Handle system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = () => {
			if (theme === 'system') {
				root.classList.remove('light', 'dark');
				root.classList.add(mediaQuery.matches ? 'dark' : 'light');
			}
		};

		// Add event listener for system theme changes
		mediaQuery.addEventListener('change', handleChange);

		// Cleanup event listener
		return () => {
			mediaQuery.removeEventListener('change', handleChange);
		};
	}, [theme, isDarkMode]);

	// Provide theme context to children
	return (
		<ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
			{children}
		</ThemeContext.Provider>
	);
};

// Custom hook to use theme context
export const useTheme = () => {
	const context = useContext(ThemeContext);

	// Throw error if used outside of ThemeProvider
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}

	return context;
};

// Utility function to toggle theme
export const toggleTheme = (currentTheme: ThemeType): ThemeType => {
	const themeOrder: ThemeType[] = ['light', 'dark', 'system'];
	const currentIndex = themeOrder.indexOf(currentTheme);
	const nextIndex = (currentIndex + 1) % themeOrder.length;
	return themeOrder[nextIndex];
};
