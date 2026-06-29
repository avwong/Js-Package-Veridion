/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["passkey-kit", "passkey-kit-sdk", "sac-sdk", "stellar-passport"],
};

export default nextConfig;
