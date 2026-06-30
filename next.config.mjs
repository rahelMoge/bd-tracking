/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  // Prevent Next.js from bundling CJS modules that use native Node.js APIs
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
