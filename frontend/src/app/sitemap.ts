import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Replace this with your actual production domain
  const baseUrl = 'https://www.oia.bennett.edu.in';

  // These are the core public routes available on the site
  const staticRoutes = [
    '',
    '/team',
    '/partners',
    '/ias',
    '/events/upcoming',
    '/events/past',
    '/programs/other',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // If you want to dynamically add routes (e.g. specific programs), 
  // you would fetch them from your database here and append them to the array.
  
  return [...staticRoutes];
}
