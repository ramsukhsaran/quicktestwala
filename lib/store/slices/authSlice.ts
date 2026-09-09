import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  status: "ACTIVE" | "BLOCKED";
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserProfile | null }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.user;
      state.error = null;
      state.isLoading = false;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

// Actions
export const {
  setCredentials,
  updateProfile,
  setAuthLoading,
  setAuthError,
  logout,
} = authSlice.actions;

// Selectors
export const selectAuthState = (state: { auth: AuthState }) => state.auth;
export const selectCurrentUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);
export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);
export const selectUserRole = createSelector(
  [selectCurrentUser],
  (user) => user?.role || null
);
export const selectIsAdmin = createSelector(
  [selectCurrentUser],
  (user) => user?.role === "ADMIN"
);
export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isLoading
);
export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);

export default authSlice.reducer;
