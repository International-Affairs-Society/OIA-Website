import type { Metadata } from "next";
import TeamPageClient from "./TeamPageClient";

export const metadata: Metadata = {
  title: "Our Team | Office of International Affairs — Bennett University",
  description:
    "Meet the dedicated team behind the Office of International Affairs at Bennett University, driving global partnerships, student exchange programs, and international collaborations.",
};

export default function TeamPage() {
  return <TeamPageClient />;
}
