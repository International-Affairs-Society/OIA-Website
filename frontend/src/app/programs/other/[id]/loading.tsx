import React from "react";
import Navbar from "@/app/homepage/Navbar";
import Pattern from "../components/Pattern";
import { ProgramDetailSkeleton } from "../components/ProgramSkeleton";
import ProgramsFooter from "../components/ProgramsFooter";

export default function ProgramDetailLoading() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#FFFBF2",
      }}
    >
      <Pattern />

      {/* Floating Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <ProgramDetailSkeleton />

      <ProgramsFooter />
    </div>
  );
}
