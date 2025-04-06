import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark' | 'system';

interface UiState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  activeView: string;
}

const initialState: UiState = {
  theme: 'system',
  sidebarOpen: true,
  mobileMenuOpen: false,
  activeView: 'dashboard',
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
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
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
});

export const {
  initializeTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setActiveView,
} = uiSlice.actions;

export default uiSlice.reducer;
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      applyTheme(action.payload);
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
