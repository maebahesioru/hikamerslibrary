import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

// 静的サイトマップ（APIを叩かない）
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl()
  const now = new Date()
  
  // 静的ページのみ
  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: 'always', priority: 0.9 },
    { url: `${baseUrl}/ai`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/hikamer-dx`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/hikamer-dx/chat`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/hikamer-dx/group`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/hikamer-dx/battle`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/how-to-use`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/download`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/feed.xml`, lastModified: now, changeFrequency: 'daily', priority: 0.3 },
    { url: `${baseUrl}/atom.xml`, lastModified: now, changeFrequency: 'daily', priority: 0.3 },
  ]
}
