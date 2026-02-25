import { createContext } from "react";
import type { AppContainer } from "../di/AppContainer";

export const AppContainerContext = createContext<AppContainer | null>(null);
