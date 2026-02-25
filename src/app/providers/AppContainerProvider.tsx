import React, { useMemo } from "react";
import { createAppContainer } from "../di/createAppContainer";
import { AppContainerContext } from "./AppContainerContext";

export function AppContainerProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const container = useMemo(() => createAppContainer(), []);
  return (
    <AppContainerContext.Provider value={container}>
      {children}
    </AppContainerContext.Provider>
  );
}
