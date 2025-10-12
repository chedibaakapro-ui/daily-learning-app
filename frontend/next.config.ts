import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  outputFileTracingRoot: require('path').join(__dirname, '../'),
};

export default withNextIntl(nextConfig);