/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui"],
    images: {
        remotePatterns: [
            {
                hostname: 'images.jsch.me'
            }
        ]
    }
};

export default nextConfig;
