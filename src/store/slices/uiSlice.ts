// src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark' | 'system';

interface NotificationType {
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	dismissed: boolean;
}

interface DateRange {
	startDate: string | null;
	endDate: string | null;
}

interface UiState {
	theme: ThemeMode;
	sidebarOpen: boolean;
	mobileMenuOpen: boolean;
	activeView: string;
	notifications: NotificationType[];
	filters: {
		category: string;
		dateRange: DateRange | null;
		searchQuery: string;
	};
}

const initialState: UiState = {
	theme: 'system',
	sidebarOpen: true,
	mobileMenuOpen: false,
	activeView: 'dashboard',
	notifications: [],
	filters: {
		category: 'all',
		dateRange: null,
		searchQuery: '',
	},
};

// Helper function to get theme from localStorage or default to system
const getInitialTheme = (): ThemeMode => {
	if (typeof window !== 'undefined') {
		const savedTheme = localStorage.getItem('theme') as ThemeMode;
		return savedTheme || 'system';
	}
	return 'system';
};

// Helper function to apply theme to document
const applyTheme = (theme: ThemeMode) => {
	if (typeof window !== 'undefined') {
		const root = window.document.documentElement;

		// Save theme preference
		localStorage.setItem('theme', theme);

		// Apply theme
		if (
			theme === 'dark' ||
			(theme === 'system' &&
				window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	}
};

const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		initializeTheme: (state) => {
			state.theme = getInitialTheme();
			applyTheme(state.theme);
		},
		setTheme: (state, action: PayloadAction<ThemeMode>) => {
			state.theme = action.payload;
			applyTheme(action.payload);
		},
		toggleDarkMode: (state) => {
			state.theme = state.theme === 'dark' ? 'light' : 'dark';
			applyTheme(state.theme);
		},
		toggleSidebar: (state) => {
			state.sidebarOpen = !state.sidebarOpen;
		},
		setSidebarOpen: (state, action: PayloadAction<boolean>) => {
			state.sidebarOpen = action.payload;
		},
		toggleMobileMenu: (state) => {
			state.mobileMenuOpen = !state.mobileMenuOpen;
		},
		setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
			state.mobileMenuOpen = action.payload;
		},
		setActiveView: (state, action: PayloadAction<string>) => {
			state.activeView = action.payload;
		},
		addNotification: (
			state,
			action: PayloadAction<{
				type: 'success' | 'error' | 'info' | 'warning';
				message: string;
			}>
		) => {
			state.notifications.push({
				id: Date.now().toString(),
				type: action.payload.type,
				message: action.payload.message,
				dismissed: false,
			});
		},
		hideNotification: (state, action: PayloadAction<string>) => {
			const notification = state.notifications.find(
				(n) => n.id === action.payload
			);
			if (notification) {
				notification.dismissed = true;
			}
		},
		clearNotifications: (state) => {
			state.notifications = [];
		},
		setCategoryFilter: (state, action: PayloadAction<string>) => {
			state.filters.category = action.payload;
		},
		setDateFilter: (state, action: PayloadAction<DateRange | null>) => {
			state.filters.dateRange = action.payload;
		},
		setSearchQuery: (state, action: PayloadAction<string>) => {
			state.filters.searchQuery = action.payload;
		},
		clearFilters: (state) => {
			state.filters = initialState.filters;
		},
	},
});

export const {
	initializeTheme,
	setTheme,
	toggleDarkMode,
	toggleSidebar,
	setSidebarOpen,
	toggleMobileMenu,
	setMobileMenuOpen,
	setActiveView,
	addNotification,
	hideNotification,
	clearNotifications,
	setCategoryFilter,
	setDateFilter,
	setSearchQuery,
	clearFilters,
} = uiSlice.actions;

// Selectors
export const selectTheme = (state: { ui: UiState }) => state.ui.theme;
export const selectIsSidebarOpen = (state: { ui: UiState }) =>
	state.ui.sidebarOpen;
export const selectMobileMenuOpen = (state: { ui: UiState }) =>
	state.ui.mobileMenuOpen;
export const selectActiveView = (state: { ui: UiState }) => state.ui.activeView;
export const selectNotifications = (state: { ui: UiState }) =>
	state.ui.notifications;
export const selectFilters = (state: { ui: UiState }) => state.ui.filters;

// Add selector for dark mode
export const selectIsDarkMode = (state: { ui: UiState }) => {
	const theme = state.ui.theme;
	if (theme === 'dark') return true;
	if (theme === 'light') return false;
	// For 'system' theme, check system preference
	return (
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-color-scheme: dark)').matches
	);
};

// Helper function to show notifications
export const showNotification = (
	type: 'success' | 'error' | 'info' | 'warning',
	message: string
) => {
	return addNotification({ type, message });
};

export default uiSlice.reducer;
