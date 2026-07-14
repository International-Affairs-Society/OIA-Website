"use client";
// ============================================================
// AUTH CONTEXT — Provides current role to the entire app.
// Integrates with backend session API.
// ============================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import { Role } from "./permissions";
import { supabase } from "@/lib/supabaseClient";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/['"]/g, "");

interface User {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  gender?: string;
  phone_number?: string;
  photo_url?: string;
  school?: string;
  course?: string;
  enrollment_no?: string;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  setRole: (role: Role) => void;
  logout: () => Promise<void>;
  login: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "general",
  isAuthenticated: false,
  isLoading: true,
  setRole: () => {},
  logout: async () => {},
  login: () => {},
});

import { useRouter, usePathname } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("general");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Helper to check if profile is complete
  const isProfileComplete = (u: User | null) => {
    if (!u) return true;
    const hasGlobal = Boolean(u.gender && u.phone_number && u.photo_url);
    if (u.role === "student") {
      // For students, also require school and course
      return hasGlobal && Boolean(u.school && u.course);
    }
    return hasGlobal;
  };

  useEffect(() => {
    if (user && !isLoading && pathname !== "/complete-profile") {
      if (!isProfileComplete(user)) {
        router.replace("/complete-profile");
      }
    }
  }, [user, isLoading, pathname, router]);

  // Fetch user data from backend using the HTTP-only cookie
  const fetchMe = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        cache: 'no-store'
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setRoleState(userData.role || "general");
      } else {
        setUser(null);
        setRoleState("general");
      }
    } catch (error) {
      console.error("[AuthContext] fetch /me failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          localStorage.setItem("access_token", session.access_token);
        } else {
          localStorage.removeItem("access_token");
        }
      } catch (err) {
        console.error("Error retrieving Supabase session on mount:", err);
      }
      await fetchMe();
    };

    // 1. Check existing session and sync to local storage on mount
    initAuth();

    // 2. Listen for Supabase auth events (like completing the OAuth redirect)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        localStorage.setItem("access_token", session.access_token);
      } else {
        localStorage.removeItem("access_token");
      }

      if (event === "SIGNED_IN" && session) {
        setIsLoading(true);
        try {
          // Send tokens to backend to set HttpOnly cookies
          await fetch(`${API_URL}/api/v1/auth/set-cookie`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
            credentials: "include"
          });
          
          // Now fetch the user profile from backend
          await fetchMe();
        } catch (error) {
          console.error("Error setting cookies:", error);
          setIsLoading(false);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setRoleState("general");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: `${window.location.origin}/`,
        scopes: "openid profile email",
        queryParams: {
          domain_hint: "bennett.edu.in",
          prompt: "select_account"
        }
      }
    });
  };

  const logout = async () => {
    try {
      // 1. Sign out from Supabase client (clears local storage)
      await supabase.auth.signOut();
      
      // 2. Tell backend to clear HttpOnly cookies
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      
      setUser(null);
      setRoleState("general");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, isLoading, setRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
