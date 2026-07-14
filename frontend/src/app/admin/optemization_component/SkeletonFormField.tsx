"use client";
import React from "react";
import SkeletonPulse from "./SkeletonPulse";

/**
 * SkeletonFormField
 *
 * Mimics a FormField (label + input) while a create/edit form is loading.
 *
 * @param labelWidth — width of the label shimmer (default "100px")
 * @param inputHeight — height of the input shimmer (default "38px")
 */

export interface SkeletonFormFieldProps {
  labelWidth?: string;
  inputHeight?: string;
}

export default function SkeletonFormField({
  labelWidth = "100px",
  inputHeight = "38px",
}: SkeletonFormFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <SkeletonPulse width={labelWidth} height="12px" borderRadius="2px" />
      <SkeletonPulse width="100%" height={inputHeight} borderRadius="2px" />
    </div>
  );
}
