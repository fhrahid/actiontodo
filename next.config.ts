import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/api/cron/reminders",
      headers: [
        { key: "Authorization", value: "Bearer ${process.env.CRON_SECRET}" },
      ],
    },
  ],
};

export default nextConfig;
