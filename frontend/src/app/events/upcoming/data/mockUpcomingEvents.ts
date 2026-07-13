export type UpcomingEvent = {
  id: string;
  title: string;
  date: string;
  eventDate: string;
  description: string;
  location?: string;
  highlights: string[];
  thumbnail: string;
  posterRatio?: number;
};

export const MOCK_UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: "01",
    title: "Global AI Summit",
    date: "August 15-17, 2026",
    eventDate: "2026-08-15T09:00:00",
    location: "Main Auditorium, Bennett University",
    description:
      "An international convergence of AI researchers, industry leaders, and delegates from partner universities exploring the future of artificial intelligence.",
    highlights: ["Academic Conference", "Keynote Sessions", "Research Exhibition"],
    thumbnail: "/events assets/1.jpeg",
    posterRatio: 820 / 1170,
  },
  {
    id: "02",
    title: "SCAD x Bennett Immersion",
    date: "September 20, 2026",
    eventDate: "2026-09-20T10:00:00",
    location: "Design Studio Hub, Block C",
    description:
      "A collaborative workshop between SCAD and Bennett students focusing on global design thinking and cross-cultural creativity.",
    highlights: ["Creative Workshop", "Design Thinking", "Cultural Exchange"],
    thumbnail: "/events assets/2.jpeg",
    posterRatio: 1,
  },
  {
    id: "03",
    title: "Global Village",
    date: "October 10, 2026",
    eventDate: "2026-10-10T11:00:00",
    location: "University Courtyard, Bennett University",
    description:
      "A celebration of cultural diversity featuring pavilions from over 30 countries with culinary experiences and live performances.",
    highlights: ["Cultural Showcase", "International Pavilions", "Live Performances"],
    thumbnail: "/events assets/1.jpeg",
    posterRatio: 820 / 1170,
  },
  {
    id: "04",
    title: "Namaste India Program",
    date: "November 25-30, 2026",
    eventDate: "2026-11-25T09:00:00",
    location: "Campus Heritage Zone, Bennett University",
    description:
      "An immersive cultural exchange initiative welcoming foreign exchange students with heritage tours and academic planning.",
    highlights: ["Student Exchange", "Heritage Tours", "Academic Planning"],
    thumbnail: "/events assets/2.jpeg",
    posterRatio: 1,
  },
];
