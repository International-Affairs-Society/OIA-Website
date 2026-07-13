import Navbar from "@/app/homepage/Navbar";
import PastEventHero from "./components/PastEventHero";
import PastTimeline from "./components/Timeline/PastTimeline";
import MobileTimeline from "./components/Timeline/MobileTimeline";
import Footer from "@/app/homepage/Footer";
import styles from "./past-events.module.css";

export const dynamic = "force-dynamic";
async function getPastEvents() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/events?eventType=past`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch past events:", error);
    return [];
  }
}

export default async function PastEventsPage() {
  const rawEvents = await getPastEvents();
  const events = rawEvents.map((ev: any) => {
    // Format date properly e.g. "Aug 22, 2025"
    let formattedDate = "";
    if (ev.date) {
      const d = new Date(ev.date);
      formattedDate = `${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`;
    }
    
    return {
      id: ev.id,
      title: ev.title,
      date: formattedDate,
      description: ev.description || "",
      images: ev.galleryUrls && ev.galleryUrls.length > 0 ? ev.galleryUrls : ["/events assets/1.jpeg"],
    };
  });

  return (
    <main className="bg-black text-white overflow-hidden">
      <Navbar />
      <PastEventHero />

      {/* Desktop Timeline — hidden on mobile */}
      <div className={styles.desktopOnly}>
        <PastTimeline events={events} />
      </div>

      {/* Mobile Timeline — hidden on desktop */}
      <div className={styles.mobileOnly}>
        <MobileTimeline events={events} />
      </div>

      <Footer />
    </main>
  );
}
