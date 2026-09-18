import { createContext, useContext } from "react";

export const EventContext = createContext(null);

export const useEvent = () => useContext(EventContext);
