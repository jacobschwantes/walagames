/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui"],
    images: {
        domains: ["images.jsch.me"],
    }
};

export default nextConfig;
