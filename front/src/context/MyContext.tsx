// MyContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type MyContextType = {
  username: string | null;
  logged: boolean;
  setUsername: (name: string | null) => void;
  setLogged: (value: boolean) => void;
};

const SESSION_KEY = "myContextData";

const MyContext = createContext<MyContextType>({
  username: null,
  logged: false,
  setUsername: () => {},
  setLogged: () => {},
});

export const MyContextProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsernameState] = useState<string | null>(null);
  const [logged, setLoggedState] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          username: string | null;
          logged: boolean;
        };
        setUsernameState(parsed.username);
        setLoggedState(parsed.logged);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    const payload = JSON.stringify({ username, logged });
    sessionStorage.setItem(SESSION_KEY, payload);
  }, [username, logged]);

  const setUsername = (name: string | null) => {
    setUsernameState(name);
    // sessionStorage updated via effect
  };

  const setLogged = (value: boolean) => {
    setLoggedState(value);
    // sessionStorage updated via effect
  };

  return (
    <MyContext.Provider
      value={{ username, logged, setUsername, setLogged }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  return useContext(MyContext);
};
