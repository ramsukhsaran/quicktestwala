import { configureStore } from "@reduxjs/toolkit";
import testAppReducer from "@/lib/store/testAppSlice";

export const store = configureStore({
  reducer: {
    testApp: testAppReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
