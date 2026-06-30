import type { NextConfig } from "next";
import { getAutoLanIp } from "./lib/lan";

const lanIp = getAutoLanIp();
const allowedOrigins = lanIp ? [lanIp] : [];

const nextConfig: NextConfig = {
  allowedDevOrigins: allowedOrigins,
};

export default nextConfig;
