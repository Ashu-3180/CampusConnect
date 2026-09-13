import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import authService from "../services/authService";
import socket from "../socket/socket";

const AuthContext = createContext();

function getTokenExpiry(token) {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const normalized = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = normalized.padEnd(
      normalized.length +
        ((4 - (normalized.length % 4)) % 4),
      "="
    );

    const payload = JSON.parse(atob(padded));

    return typeof payload.exp === "number"
      ? payload.exp
      : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevent multiple simultaneous session-expiry
  // events from triggering duplicate logout work.
  const sessionExpiredHandled = useRef(false);

  useEffect(() => {
    const handleSessionExpired = () => {
      if (sessionExpiredHandled.current) {
        return;
      }

      sessionExpiredHandled.current = true;

      socket.disconnect();
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    };

    window.addEventListener(
      "campusconnect:session-expired",
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        "campusconnect:session-expired",
        handleSessionExpired
      );
    };
  }, []);

  /*
   * Restore an existing session when the app starts.
   */
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (mounted) {
          setLoading(false);
        }

        return;
      }

      try {
        const expiry = getTokenExpiry(token);

        // If the token is already expired, clear it
        // before making an authenticated request.
        if (
          expiry !== null &&
          expiry * 1000 <= Date.now()
        ) {
          localStorage.removeItem("token");
          socket.disconnect();

          if (mounted) {
            setUser(null);
          }

          return;
        }

        const data =
          await authService.getCurrentUser(token);

        if (!mounted) {
          return;
        }

        setUser(data.user);

        socket.auth = {
          userId: data.user._id,
        };

        socket.connect();
      } catch (error) {
        localStorage.removeItem("token");
        socket.disconnect();

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Automatically expire the current frontend session
   * when the JWT reaches its expiry time.
   */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !user) {
      return undefined;
    }

    const expiry = getTokenExpiry(token);

    if (expiry === null) {
      return undefined;
    }

    const expiryTime = expiry * 1000;
    const remainingTime =
      expiryTime - Date.now();

    const handleExpiry = () => {
      if (sessionExpiredHandled.current) {
        return;
      }

      sessionExpiredHandled.current = true;

      socket.disconnect();
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    };

    if (remainingTime <= 0) {
      handleExpiry();

      return undefined;
    }

    const timer = window.setTimeout(
      handleExpiry,
      remainingTime
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [user]);

  /*
   * Keep application-wide dark mode synchronized
   * with the authenticated user's preference.
   */
  useEffect(() => {
    const darkMode =
      user?.preferences?.darkMode ?? false;

    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );
  }, [user]);

  const register = async (userData) => {
    // A successful authentication starts a fresh session.
    sessionExpiredHandled.current = false;

    const data =
      await authService.register(userData);

    localStorage.setItem(
      "token",
      data.token
    );

    setUser(data.user);

    socket.auth = {
      userId: data.user._id,
    };

    socket.connect();

    /*
     * Login/register is no longer an initial
     * authentication-hydration phase.
     */
    setLoading(false);

    return data;
  };

  const login = async (credentials) => {
    // A successful authentication starts a fresh session.
    sessionExpiredHandled.current = false;

    const data =
      await authService.login(credentials);

    localStorage.setItem(
      "token",
      data.token
    );

    setUser(data.user);

    socket.auth = {
      userId: data.user._id,
    };

    socket.connect();

    /*
     * This is the important fix.
     * Chat and other authenticated pages must
     * immediately know authentication is ready.
     */
    setLoading(false);

    return data;
  };

  const logout = () => {
    sessionExpiredHandled.current = true;

    socket.disconnect();
    localStorage.removeItem("token");

    setUser(null);
    setLoading(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}