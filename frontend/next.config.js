/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Permite carregar imagens do Cloudinary
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    // Formatos modernos entregues pelo next/image
    formats: ['image/avif', 'image/webp'],
  },

  // Variáveis de ambiente disponíveis no browser (prefixo NEXT_PUBLIC_)
  // As outras ficam apenas no servidor
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WHATSAPP: process.env.NEXT_PUBLIC_WHATSAPP,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Lumina Fotografia',
  },
};

module.exports = nextConfig;
