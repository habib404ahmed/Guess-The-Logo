import type { LogoQuestion } from '@/types';

/**
 * Logo Questions
 * ─────────────────────────────────────────────────────────────────────────────
 * Each question shows a logo image and asks students to pick the brand.
 * Images live in src/assets/logos/ and are imported for Vite bundling.
 */

// Vite static image imports — bundled at build time
import appleImg      from '@/assets/logos/apple.png';
import nikeImg       from '@/assets/logos/nike.png';
import mcdonaldsImg  from '@/assets/logos/mcdonalds.png';
import googleImg     from '@/assets/logos/google.png';
import amazonImg     from '@/assets/logos/amazon.png';
import netflixImg    from '@/assets/logos/netflix.png';
import spotifyImg    from '@/assets/logos/spotify.png';
import adidasImg     from '@/assets/logos/adidas.png';
import youtubeImg    from '@/assets/logos/youtube.png';
import twitterImg    from '@/assets/logos/twitter.png';
import instagramImg  from '@/assets/logos/instagram.png';

export const logoQuestions: LogoQuestion[] = [
  {
    id: 'logo-01',
    type: 'logo',
    logoSrc: appleImg,
    brandName: 'Apple',
    category: 'Technology',
    difficulty: 'easy',
    points: 10,
    options: [
      { id: 'a', label: 'Apple',     isCorrect: true  },
      { id: 'b', label: 'Microsoft', isCorrect: false },
      { id: 'c', label: 'Google',    isCorrect: false },
      { id: 'd', label: 'Samsung',   isCorrect: false },
    ],
  },
  {
    id: 'logo-02',
    type: 'logo',
    logoSrc: nikeImg,
    brandName: 'Nike',
    category: 'Sportswear',
    difficulty: 'easy',
    points: 10,
    options: [
      { id: 'a', label: 'Adidas',  isCorrect: false },
      { id: 'b', label: 'Puma',    isCorrect: false },
      { id: 'c', label: 'Nike',    isCorrect: true  },
      { id: 'd', label: 'Reebok',  isCorrect: false },
    ],
  },
  {
    id: 'logo-03',
    type: 'logo',
    logoSrc: mcdonaldsImg,
    brandName: "McDonald's",
    category: 'Fast Food',
    difficulty: 'easy',
    points: 10,
    options: [
      { id: 'a', label: "McDonald's", isCorrect: true  },
      { id: 'b', label: 'Burger King', isCorrect: false },
      { id: 'c', label: 'KFC',         isCorrect: false },
      { id: 'd', label: 'Subway',       isCorrect: false },
    ],
  },
  {
    id: 'logo-04',
    type: 'logo',
    logoSrc: googleImg,
    brandName: 'Google',
    category: 'Technology',
    difficulty: 'easy',
    points: 10,
    options: [
      { id: 'a', label: 'Yahoo',   isCorrect: false },
      { id: 'b', label: 'Bing',    isCorrect: false },
      { id: 'c', label: 'Google',  isCorrect: true  },
      { id: 'd', label: 'DuckDuckGo', isCorrect: false },
    ],
  },
  {
    id: 'logo-05',
    type: 'logo',
    logoSrc: amazonImg,
    brandName: 'Amazon',
    category: 'E-Commerce',
    difficulty: 'easy',
    points: 10,
    options: [
      { id: 'a', label: 'eBay',    isCorrect: false },
      { id: 'b', label: 'Amazon',  isCorrect: true  },
      { id: 'c', label: 'Flipkart',isCorrect: false },
      { id: 'd', label: 'Alibaba', isCorrect: false },
    ],
  },
  {
    id: 'logo-06',
    type: 'logo',
    logoSrc: netflixImg,
    brandName: 'Netflix',
    category: 'Streaming',
    difficulty: 'easy',
    points: 10,
    options: [
      { id: 'a', label: 'Hulu',      isCorrect: false },
      { id: 'b', label: 'Disney+',   isCorrect: false },
      { id: 'c', label: 'Netflix',   isCorrect: true  },
      { id: 'd', label: 'Prime Video', isCorrect: false },
    ],
  },
  {
    id: 'logo-07',
    type: 'logo',
    logoSrc: spotifyImg,
    brandName: 'Spotify',
    category: 'Music',
    difficulty: 'medium',
    points: 15,
    options: [
      { id: 'a', label: 'Spotify',    isCorrect: true  },
      { id: 'b', label: 'Apple Music',isCorrect: false },
      { id: 'c', label: 'SoundCloud', isCorrect: false },
      { id: 'd', label: 'Tidal',      isCorrect: false },
    ],
  },
  {
    id: 'logo-08',
    type: 'logo',
    logoSrc: adidasImg,
    brandName: 'Adidas',
    category: 'Sportswear',
    difficulty: 'medium',
    points: 15,
    options: [
      { id: 'a', label: 'Puma',   isCorrect: false },
      { id: 'b', label: 'Under Armour', isCorrect: false },
      { id: 'c', label: 'Nike',   isCorrect: false },
      { id: 'd', label: 'Adidas', isCorrect: true  },
    ],
  },
  {
    id: 'logo-09',
    type: 'logo',
    logoSrc: youtubeImg,
    brandName: 'YouTube',
    category: 'Video',
    difficulty: 'easy',
    points: 10,
    options: [
      { id: 'a', label: 'Twitch',   isCorrect: false },
      { id: 'b', label: 'YouTube',  isCorrect: true  },
      { id: 'c', label: 'Vimeo',    isCorrect: false },
      { id: 'd', label: 'TikTok',   isCorrect: false },
    ],
  },
  {
    id: 'logo-10',
    type: 'logo',
    logoSrc: twitterImg,
    brandName: 'Twitter',
    category: 'Social Media',
    difficulty: 'medium',
    points: 15,
    options: [
      { id: 'a', label: 'Reddit',    isCorrect: false },
      { id: 'b', label: 'Twitter',   isCorrect: true  },
      { id: 'c', label: 'LinkedIn',  isCorrect: false },
      { id: 'd', label: 'Pinterest', isCorrect: false },
    ],
  },
  {
    id: 'logo-11',
    type: 'logo',
    logoSrc: instagramImg,
    brandName: 'Instagram',
    category: 'Social Media',
    difficulty: 'easy',
    points: 10,
    options: [
      { id: 'a', label: 'Snapchat',  isCorrect: false },
      { id: 'b', label: 'Instagram', isCorrect: true  },
      { id: 'c', label: 'Facebook',  isCorrect: false },
      { id: 'd', label: 'BeReal',    isCorrect: false },
    ],
  },
];
