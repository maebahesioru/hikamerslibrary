import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/icon-', '/logo.png'],
      },
      {
        userAgent: 'Googlebot-Video',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Slurp',
        allow: '/',
        crawlDelay: 2,
      },
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        crawlDelay: 2,
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
      },
      {
        userAgent: 'Discordbot',
        allow: '/',
      },
      {
        userAgent: 'Applebot',
        allow: '/',
        crawlDelay: 1,
      },
      // 悪質なボットをブロック
      {
        userAgent: 'AhrefsBot',
        disallow: '/',
      },
      {
        userAgent: 'SemrushBot',
        disallow: '/',
      },
      {
        userAgent: 'MJ12bot',
        disallow: '/',
      },
      {
        userAgent: 'DotBot',
        disallow: '/',
      },
      {
        userAgent: 'BLEXBot',
        disallow: '/',
      },
    ],
    sitemap: [
      `${siteUrl}/sitemapindex.xml`,
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/sitemap-images.xml`,
      `${siteUrl}/sitemap-video.xml`,
      `${siteUrl}/sitemap-news.xml`
    ],
    host: siteUrl,
  }
}
