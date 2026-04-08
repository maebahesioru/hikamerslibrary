/** @type {import('next').NextConfig} */
const DEFAULT_SITE = 'https://hikamerslibrary.vercel.app'
function normalizeSiteOrigin() {
  let raw = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE).trim()
  if (!raw) return DEFAULT_SITE
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`
  try {
    return new URL(raw).origin
  } catch {
    return DEFAULT_SITE
  }
}
const publicSiteUrl = normalizeSiteOrigin()
let canonicalHost = 'hikamerslibrary.vercel.app'
try {
  canonicalHost = new URL(publicSiteUrl).host
} catch {
  /* keep default */
}

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  // 末尾スラッシュの統一（SEO）
  trailingSlash: false,
  eslint: {
    // ビルド時にESLintを実行（警告は無視）
    ignoreDuringBuilds: false,
  },
  typescript: {
    // ビルド時に型チェックを実行
    ignoreBuildErrors: false,
  },
  // 実験的機能
  experimental: {
    // 最適化
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    // 画像最適化設定
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30日キャッシュ
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'abs.twimg.com',
      },
    ],
  },
  async redirects() {
    const base = publicSiteUrl.replace(/\/$/, '')
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: `www.${canonicalHost}` }],
        destination: `${base}/:path*`,
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          // SEO最適化ヘッダー
          {
            key: 'Content-Language',
            value: 'ja'
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding, Accept-Language'
          },
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
          },
        ],
      },
      // 検索ページ用ヘッダー
      {
        source: '/search',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-image-preview:large'
          },
          {
            key: 'Link',
            value: '</search>; rel="canonical"'
          },
        ],
      },
      // AI検索ページ用ヘッダー
      {
        source: '/ai',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow, max-image-preview:large'
          },
          {
            key: 'Link',
            value: '</ai>; rel="canonical"'
          },
        ],
      },
      // HTMLページ用キャッシュヘッダー
      {
        source: '/((?!api|_next|.*\\..*).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
