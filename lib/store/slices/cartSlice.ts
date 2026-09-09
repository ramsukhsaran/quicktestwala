import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  validityDays: number;
  categoryName?: string;
  testCount?: number;
}

export interface CouponDiscount {
  code: string;
  discountPercentage?: number;
  fixedDiscount?: number;
}

export interface CartState {
  items: CartItem[];
  appliedCoupon: CouponDiscount | null;
  isProcessingPayment: boolean;
  paymentError: string | null;
}

const initialState: CartState = {
  items: [],
  appliedCoupon: null,
  isProcessingPayment: false,
  paymentError: null,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (state.items.length === 0) {
        state.appliedCoupon = null;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.appliedCoupon = null;
      state.paymentError = null;
      state.isProcessingPayment = false;
    },
    applyCoupon: (state, action: PayloadAction<CouponDiscount>) => {
      state.appliedCoupon = action.payload;
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
    },
    setProcessingPayment: (state, action: PayloadAction<boolean>) => {
      state.isProcessingPayment = action.payload;
      if (action.payload) {
        state.paymentError = null;
      }
    },
    setPaymentError: (state, action: PayloadAction<string | null>) => {
      state.paymentError = action.payload;
      state.isProcessingPayment = false;
    },
  },
});

// Actions
export const {
  addToCart,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  setProcessingPayment,
  setPaymentError,
} = cartSlice.actions;

// Selectors
export const selectCartState = (state: { cart: CartState }) => state.cart;
export const selectCartItems = createSelector([selectCartState], (cart) => cart.items);
export const selectCartItemCount = createSelector(
  [selectCartItems],
  (items) => items.length
);

export const selectCartSubtotal = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + item.price, 0)
);

export const selectCartDiscount = createSelector(
  [selectCartState, selectCartSubtotal],
  (cart, subtotal) => {
    if (!cart.appliedCoupon) return 0;
    const { discountPercentage, fixedDiscount } = cart.appliedCoupon;
    if (fixedDiscount && fixedDiscount > 0) {
      return Math.min(fixedDiscount, subtotal);
    }
    if (discountPercentage && discountPercentage > 0) {
      return Math.round((subtotal * discountPercentage) / 100);
    }
    return 0;
  }
);

export const selectCartTotal = createSelector(
  [selectCartSubtotal, selectCartDiscount],
  (subtotal, discount) => Math.max(0, subtotal - discount)
);

export const selectIsProcessingPayment = createSelector(
  [selectCartState],
  (cart) => cart.isProcessingPayment
);

export const selectPaymentError = createSelector(
  [selectCartState],
  (cart) => cart.paymentError
);

export const selectAppliedCoupon = createSelector(
  [selectCartState],
  (cart) => cart.appliedCoupon
);

export default cartSlice.reducer;
