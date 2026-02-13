import React, { createContext, useContext, useMemo } from "react";
import type { AppContainer } from "../di/AppContainer";
import { createAppContainer } from "../di/createAppContainer";

const AppContainerContext = createContext<AppContainer | null>(null);

export function AppContainerProvider({ children }: { children: React.ReactNode }) {
  const container = useMemo(() => createAppContainer(), []);
  return (
    <AppContainerContext.Provider value={container}>
      {children}
    </AppContainerContext.Provider>
  );
}

export function useAppContainer(): AppContainer {
  const ctx = useContext(AppContainerContext);
  if (!ctx) throw new Error("AppContainerProvider missing");
  return ctx;
}
