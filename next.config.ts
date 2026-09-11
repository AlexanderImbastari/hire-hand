import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // This repo maintains its own CLAUDE.md; don't overwrite it on each build.
  agentRules: false,
};

export default nextConfig;
