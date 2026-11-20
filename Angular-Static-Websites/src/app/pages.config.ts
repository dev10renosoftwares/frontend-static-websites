/**
 * PAGE REGISTRY
 * -------------
 * To add a new page:
 *   1. Put your HTML file in  src/assets/pages/
 *   2. Add one entry below. It appears on the dashboard automatically.
 *
 *   slug        -> URL path (baseurl/<slug>)
 *   file        -> file name in src/assets/pages/
 *   title       -> browser tab title
 *   name        -> name shown on the dashboard card
 *   description -> one-line summary on the card
 *   category    -> label on the card and in the dashboard stats
 *   accent      -> card accent colour
 */
export interface PageEntry {
  slug: string;
  file: string;
  title: string;
  name: string;
  description: string;
  category: string;
  accent: string;
}

export const PAGES: PageEntry[] = [
  {
    slug: 'wah-kabab',
    file: 'wah-kabab.html',
    title: 'Wah Kabab – Authentic Mughlai in Lal Chowk, Srinagar',
    name: 'Wah Kabab',
    description: 'Restaurant website with menu, videos, gallery, reviews and table booking.',
    category: 'Restaurant',
    accent: '#B3321F'
  },
  {
    slug: 'khandar',
    file: 'khandar.html',
    title: 'KHANDAR – Matrimony where interests are proven',
    name: 'KHANDAR',
    description: 'Matrimonial platform where profiles are backed by short interest videos.',
    category: 'Matrimony',
    accent: '#5C7068'
  },
  {
    slug: 'aakash-unani',
    file: 'aakash-unani.html',
    title: 'Aakash Unani & Ayurvedic — Vailoo, Kokernag',
    name: 'Aakash Unani & Ayurvedic',
    description: 'Clinic website with treatments, doctor profile, online consultation and WhatsApp booking.',
    category: 'Healthcare',
    accent: '#C4A04F'
  },
  {
    slug: 'tabea-foods',
    file: 'tabea-foods.html',
    title: 'Tabea Foods – Authentic Homemade Anchaar, Srinagar',
    name: 'Tabea Foods',
    description: 'Homemade achaar (pickle) brand with products, reels, gallery and Instagram ordering.',
    category: 'Food Brand',
    accent: '#46561F'
  }
];
