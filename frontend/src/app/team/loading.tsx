import React from "react";
import Navbar from "@/app/homepage/Navbar";
import TeamFooter from "./TeamFooter";
import { TeamPageSkeleton } from "./TeamSkeleton";

export default function TeamLoading() {
  return (
    <>
      <Navbar />
      <TeamPageSkeleton />
      <TeamFooter />
    </>
  );
}
