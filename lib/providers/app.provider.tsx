"use client";

import { createContext, useContext, useReducer } from "react";
import type { Dispatch } from "react";

export type AppState = {
  user: User | null;
  accounts: Account[];
  totalBanks: number;
  totalCurrentBalance: number;
  accountDetails: Record<
    string,
    {
      info: Account;
      transactions: Transaction[];
    }
  >;
};

type Actions =
  | {
      type: "SET_USER";
      payload: {
        user: AppState["user"];
      };
    }
  | {
      type: "SIGN_OUT";
    }
  | {
      type: "SET_ACCOUNT";
      payload: {
        data: Account;
        transactions: Transaction[];
      };
    };

type AppDispatch = Dispatch<Actions>;

const initialAppState: AppState = {
  user: null,
  accounts: [],
  totalBanks: 0,
  totalCurrentBalance: 0,
  accountDetails: {},
};

const AppContext = createContext<{
  state: AppState;
  dispatch: AppDispatch;
}>({
  state: initialAppState,
  dispatch: () => null,
});
AppContext.displayName = "AppContext";

function appReducer(state: AppState, action: Actions): AppState {
  switch (action.type) {
    case "SET_USER": {
      return {
        ...state,
        user: action.payload.user,
      };
    }
    case "SET_ACCOUNT": {
      return {
        ...state,
        accountDetails: {
          ...state.accountDetails,
          [action.payload.data.appwriteItemId]: {
            info: action.payload.data,
            transactions: action.payload.transactions,
          },
        },
      };
    }
    case "SIGN_OUT": {
      return initialAppState;
    }
    default:
      return state;
  }
}

const useAppReducer = (appState: AppState) =>
  useReducer(appReducer, initialAppState, () => appState);

function AppProvider({
  children,
  ...appState
}: React.PropsWithChildren<AppState>) {
  const [state, dispatch] = useAppReducer(appState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

const useAppState = () => {
  const appState = useContext(AppContext);
  if (!appState) {
    throw new Error("useAppState must be used within a AppProvider");
  }

  return appState;
};

export { AppProvider, AppContext, useAppState };
