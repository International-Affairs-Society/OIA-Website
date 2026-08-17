import React from "react";
import Navbar from "@/app/homepage/Navbar";
import Footer from "@/app/homepage/Footer";
import { PastEventsHeroSkeleton, PastTimelineSkeleton } from "./components/PastEventsSkeleton";

export default function PastEventsLoading() {
  return (
    <main className="bg-black text-white overflow-hidden">
      <Navbar />
      <PastEventsHeroSkeleton />
      <PastTimelineSkeleton />
      <Footer />
    </main>
  );
}
