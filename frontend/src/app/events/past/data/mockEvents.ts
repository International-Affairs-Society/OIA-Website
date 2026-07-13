export type PastEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  stats?: string;
  images: string[];
  link?: string;
};


export const MOCK_PAST_EVENTS: PastEvent[] = [
  {
    id: "01",
    title: "Global AI Summit",
    date: "March 12-14, 2025",
    location: "Main Auditorium, Bennett University",
    description: "An international convergence of AI researchers, industry leaders, and delegates from partner universities exploring the future of artificial intelligence. Hosted keynotes from leading tech giants and featured collaborative projects from cross-continental student teams.",
    stats: "50+ Universities • 12 Countries • 2000+ Attendees",
    images: [
      "/homepage assets/event-1.jpeg",
      "/homepage assets/event-2.JPG",
      "/homepage assets/event-3.jpg"
    ],
  },
  {
    id: "02",
    title: "SCAD x Bennett Immersion",
    date: "February 24, 2025",
    location: "Design Studio Hub",
    description: "A collaborative workshop between SCAD (Savannah College of Art and Design) and Bennett students focusing on global design thinking and cross-cultural creativity.",
    stats: "2 Partner Institutions • 150 Students",
    images: [
      "/homepage assets/event-2.JPG",
      "/homepage assets/event-4.jpeg"
    ],
  },
  {
    id: "03",
    title: "Global Village",
    date: "November 18, 2024",
    location: "University Courtyard",
    description: "A celebration of cultural diversity featuring pavilions from over 30 countries. International students showcased their heritage through culinary experiences, traditional performances, and interactive art installations.",
    stats: "30+ Countries • 5000+ Visitors",
    images: [
      "/homepage assets/event-3.jpg",
      "/homepage assets/event-1.jpeg",
      "/homepage assets/event-2.JPG"
    ],
  },
  {
    id: "04",
    title: "Namaste India Program",
    date: "August 5-10, 2024",
    location: "Campus Wide",
    description: "An immersive cultural exchange initiative welcoming foreign exchange students. The program included intensive language sessions, heritage tours, and collaborative academic planning.",
    stats: "15 Exchange Universities • 80 Delegates",
    images: [
      "/homepage assets/event-4.jpeg",
      "/homepage assets/event-3.jpg"
    ],
  }
];
