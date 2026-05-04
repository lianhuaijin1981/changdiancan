import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { CartItem, User, Store, MemberInfo } from "../types";

interface AppState {
  token: string | null;
  user: User | null;
  store: Store | null;
  cart: CartItem[];
  memberInfo: MemberInfo | null;
}

type Action =
  | { type: "SET_AUTH"; payload: { token: string; user: User } }
  | { type: "CLEAR_AUTH" }
  | { type: "SET_STORE"; payload: Store }
  | { type: "SET_CART"; payload: CartItem[] }
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "UPDATE_CART_QTY"; payload: { dishId: number; specId?: number; quantity: number } }
  | { type: "REMOVE_FROM_CART"; payload: { dishId: number; specId?: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_MEMBER"; payload: MemberInfo };

const initialState: AppState = {
  token: localStorage.getItem("token"),
  user: (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })(),
  store: null,
  cart: (() => {
    try {
      const c = localStorage.getItem("cart");
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  })(),
  memberInfo: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_AUTH": {
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      return { ...state, token: action.payload.token, user: action.payload.user };
    }
    case "CLEAR_AUTH": {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return { ...state, token: null, user: null };
    }
    case "SET_STORE":
      return { ...state, store: action.payload };
    case "SET_CART": {
      localStorage.setItem("cart", JSON.stringify(action.payload));
      return { ...state, cart: action.payload };
    }
    case "ADD_TO_CART": {
      const existing = state.cart.find(
        (i) => i.dishId === action.payload.dishId && i.specId === action.payload.specId
      );
      let next: CartItem[];
      if (existing) {
        next = state.cart.map((i) =>
          i.dishId === action.payload.dishId && i.specId === action.payload.specId
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i
        );
      } else {
        next = [...state.cart, action.payload];
      }
      localStorage.setItem("cart", JSON.stringify(next));
      return { ...state, cart: next };
    }
    case "UPDATE_CART_QTY": {
      const next = state.cart
        .map((i) =>
          i.dishId === action.payload.dishId && i.specId === action.payload.specId
            ? { ...i, quantity: action.payload.quantity }
            : i
        )
        .filter((i) => i.quantity > 0);
      localStorage.setItem("cart", JSON.stringify(next));
      return { ...state, cart: next };
    }
    case "REMOVE_FROM_CART": {
      const next = state.cart.filter(
        (i) => !(i.dishId === action.payload.dishId && i.specId === action.payload.specId)
      );
      localStorage.setItem("cart", JSON.stringify(next));
      return { ...state, cart: next };
    }
    case "CLEAR_CART": {
      localStorage.removeItem("cart");
      return { ...state, cart: [] };
    }
    case "SET_MEMBER":
      return { ...state, memberInfo: action.payload };
    default:
      return state;
  }
}

interface ContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<ContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useCart() {
  const { state } = useApp();
  const cartTotal = state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);
  return { cart: state.cart, cartTotal, cartCount };
}
