import { createContext, useContext } from "react";
import { LT } from "./constants";

export const ThemeContext = createContext(LT);
export const useTheme = () => useContext(ThemeContext);
