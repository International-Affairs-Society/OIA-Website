"use client";

import React from "react";
import { AuthProvider } from "./admin/roles/AuthContext";
export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
