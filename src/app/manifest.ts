import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tldraw Notes',
    short_name: 'Notes',
    description: 'An offline-first drawing and note-taking app.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0D0D0D', // brand-5
    theme_color: '#0D0D0D',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
