// src/features/ui/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
	darkMode: boolean;
	sidebarOpen: boolean;
	activeView: 'list' | 'calendar' | 'categories';
	notifications: {
		id: string;
		type: 'success' | 'error' | 'info' | 'warning';
		message: string;
		dismissed: boolean;
	}[];
	isMobile: boolean;
	modal: {
		isOpen: boolean;
		type: string | null;
		data: any;
	};
}

// Try to get darkMode preference from localStorage or use system preference
const getInitialDarkMode = (): boolean => {
	if (typeof window !== 'undefined') {
		const savedDarkMode = localStorage.getItem('darkMode');

		if (savedDarkMode !== null) {
			return savedDarkMode === 'true';
		}

		// Check system preference
		return (
			window.matchMedia &&
			window.matchMedia('(prefers-color-scheme: dark)').matches
		);
	}

	return false;
};

const initialState: UIState = {
	darkMode: getInitialDarkMode(),
	sidebarOpen: true,
	activeView: 'list',
	notifications: [],
	isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
	modal: {
		isOpen: false,
		type: null,
		data: null,
	},
};

const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		toggleDarkMode: (state) => {
			state.darkMode = !state.darkMode;
			if (typeof window !== 'undefined') {
				localStorage.setItem('darkMode', state.darkMode.toString());
			}
		},
		setDarkMode: (state, action: PayloadAction<boolean>) => {
			state.darkMode = action.payload;
			if (typeof window !== 'undefined') {
				localStorage.setItem('darkMode', state.darkMode.toString());
			}
		},
		toggleSidebar: (state) => {
			state.sidebarOpen = !state.sidebarOpen;
		},
		setSidebarOpen: (state, action: PayloadAction<boolean>) => {
			state.sidebarOpen = action.payload;
		},
		setActiveView: (
			state,
			action: PayloadAction<'list' | 'calendar' | 'categories'>
		) => {
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
		dismissNotification: (state, action: PayloadAction<string>) => {
			const index = state.notifications.findIndex(
				(n) => n.id === action.payload
			);
			if (index !== -1) {
				state.notifications[index].dismissed = true;
			}
		},
		clearAllNotifications: (state) => {
			state.notifications = [];
		},
		setIsMobile: (state, action: PayloadAction<boolean>) => {
			state.isMobile = action.payload;

			// Auto-close sidebar on mobile
			if (action.payload) {
				state.sidebarOpen = false;
			} else {
				state.sidebarOpen = true;
			}
		},
		openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
			state.modal = {
				isOpen: true,
				type: action.payload.type,
				data: action.payload.data || null,
			};
		},
		closeModal: (state) => {
			state.modal = {
				isOpen: false,
				type: null,
				data: null,
			};
		},
	},
});

export const {
	toggleDarkMode,
	setDarkMode,
	toggleSidebar,
	setSidebarOpen,
	setActiveView,
	addNotification,
	dismissNotification,
	clearAllNotifications,
	setIsMobile,
	openModal,
	closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
