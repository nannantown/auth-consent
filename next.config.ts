import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ビルド時にESLintエラーを無視（開発時はlintコマンドで確認）
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 型エラーもビルド時は無視
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
