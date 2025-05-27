/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // if the api url is not set, throw an error
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL is not set');
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return [
      {
        source: '/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
}

export default nextConfig