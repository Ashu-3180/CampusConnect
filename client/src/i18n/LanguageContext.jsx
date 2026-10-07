import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import en from "./en";
import hi from "./hi";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";

const dictionaries = { en, hi };

const LanguageContext = createContext(null);

function getNestedValue(dictionary, path) {
  return path.split(".").reduce((current, key) => {
    if (current && typeof current === "object") {
      return current[key];
    }

    return undefined;
  }, dictionary);
}

export function LanguageProvider({ children }) {
  const { user, updateUser } = useAuth();
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    const preferred = user?.preferences?.language;

    if (preferred === "en" || preferred === "hi") {
      setLanguageState(preferred);
    }
  }, [user?.preferences?.language]);

  const setLanguage = useCallback(
    async (nextLanguage) => {
      if (nextLanguage !== "en" && nextLanguage !== "hi") {
        return;
      }

      const previous = language;
      setLanguageState(nextLanguage);

      try {
        const data = await userService.updateMyPreferences({
          language: nextLanguage,
        });

        const finalLanguage =
          data.preferences?.language || nextLanguage;

        setLanguageState(finalLanguage);

        if (user && updateUser) {
          updateUser({
            ...user,
            preferences: {
              ...user.preferences,
              ...(data.preferences || {}),
              language: finalLanguage,
            },
          });
        }
      } catch (error) {
        setLanguageState(previous);
        throw error;
      }
    },
    [language, updateUser, user]
  );

  const t = useCallback(
    (key, fallback = "") => {
      const primary = getNestedValue(
        dictionaries[language] || dictionaries.en,
        key
      );

      if (typeof primary === "string") {
        return primary;
      }

      const english = getNestedValue(dictionaries.en, key);

      if (typeof english === "string") {
        return english;
      }

      return fallback || key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used within LanguageProvider"
    );
  }

  return context;
}

export function useTranslation() {
  return useLanguage();
}
