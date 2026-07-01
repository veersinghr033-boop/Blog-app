import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer({
  experimental: {
    optimizePackageImports: [
      "antd",
      "@ant-design/icons",
    ],
  },
});