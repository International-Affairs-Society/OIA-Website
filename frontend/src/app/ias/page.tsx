import type { Metadata } from "next";
import IASPageClient from "./IASPageClient";

export const metadata: Metadata = {
  title: "IAS | International Affairs Society — Bennett University",
  description:
    "The International Affairs Society (IAS) at Bennett University fosters global awareness, diplomatic discourse, and cross-cultural engagement among students.",
};

export default function IASPage() {
  return <IASPageClient />;
}
