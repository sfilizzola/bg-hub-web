import { useContext } from "react";
import type { AppContainer } from "../di/AppContainer";
import { AppContainerContext } from "./AppContainerContext";

export function useAppContainer(): AppContainer {
  const ctx = useContext(AppContainerContext);
  if (!ctx) throw new Error("AppContainerProvider missing");
  return ctx;
}
