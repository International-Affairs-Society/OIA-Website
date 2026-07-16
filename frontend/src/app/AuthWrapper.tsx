"use client";

import React from "react";
import { AuthProvider } from "./admin/roles/AuthContext";
import { DeviceTierProvider } from "@/hooks/useDeviceTier";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DeviceTierProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </DeviceTierProvider>
  );
}

