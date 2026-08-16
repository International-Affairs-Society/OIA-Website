import React from "react";
import Navbar from "@/app/homepage/Navbar";
import IASFooter from "./IASFooter";
import { IASPageSkeleton } from "./IASSkeleton";

export default function IASLoading() {
  return (
    <>
      <Navbar />
      <IASPageSkeleton />
      <IASFooter />
    </>
  );
}
