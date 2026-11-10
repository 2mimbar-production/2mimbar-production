/** @type {import('next').NextConfig} */

// Portofolio publik pindah ke web etalase (repo 2mimbar-production/portofolio).
// Web ini khusus Studio; link lama /karya/... diteruskan ke etalase.
const ETALASE = process.env.NEXT_PUBLIC_ETALASE_URL || "https://2mimbar-portofolio.vercel.app";

const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/", destination: "/studio", permanent: false },
      { source: "/karya/:slug", destination: `${ETALASE}/program/:slug`, permanent: true },
    ];
  },
};

module.exports = nextConfig;
