import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

export interface UIState {
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  commandPaletteOpen: boolean;
  activeModal: string | null;
}

const initialState: UIState = {
  sidebarOpen: true,
  mobileNavOpen: false,
  commandPaletteOpen: false,
  activeModal: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileNav: (state) => {
      state.mobileNavOpen = !state.mobileNavOpen;
    },
    setMobileNavOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileNavOpen = action.payload;
    },
    toggleCommandPalette: (state) => {
      state.commandPaletteOpen = !state.commandPaletteOpen;
    },
    setCommandPaletteOpen: (state, action: PayloadAction<boolean>) => {
      state.commandPaletteOpen = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
  },
});

// Actions
export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileNav,
  setMobileNavOpen,
  toggleCommandPalette,
  setCommandPaletteOpen,
  openModal,
  closeModal,
} = uiSlice.actions;

// Selectors
export const selectUIState = (state: { ui: UIState }) => state.ui;
export const selectSidebarOpen = createSelector([selectUIState], (ui) => ui.sidebarOpen);
export const selectMobileNavOpen = createSelector([selectUIState], (ui) => ui.mobileNavOpen);
export const selectCommandPaletteOpen = createSelector(
  [selectUIState],
  (ui) => ui.commandPaletteOpen
);
export const selectActiveModal = createSelector([selectUIState], (ui) => ui.activeModal);

export default uiSlice.reducer;
