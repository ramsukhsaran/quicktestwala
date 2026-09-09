import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import examReducer from "./slices/examSlice";
import testSeriesReducer from "./slices/testSeriesSlice";
import cartReducer from "./slices/cartSlice";
import adminReducer from "./slices/adminSlice";
import uiReducer from "./slices/uiSlice";
import testAppReducer from "./testAppSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  exam: examReducer,
  testSeries: testSeriesReducer,
  cart: cartReducer,
  admin: adminReducer,
  ui: uiReducer,
  testApp: testAppReducer, // Maintained for backward compatibility
});

export type RootState = ReturnType<typeof rootReducer>;
