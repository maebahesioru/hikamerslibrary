---
inclusion: always
---

# Project Structure

## Root Directory

```
/
├── .kiro/              # Kiro configuration and steering rules
│   └── steering/       # AI assistant guidance documents
├── app/                # Next.js application
│   ├── api/            # API routes
│   │   ├── tweets/     # Tweet data APIs
│   │   │   ├── route.ts        # Legacy full data load
│   │   │   └── stream/         # Optimized streaming search
│   │   │       └── route.ts
│   ├── search/         # Search page
│   └── ai/             # AI-powered search
├── public/             # Static files and CSV data
│   ├── 2022/           # 2022 tweet data
│   ├── 2023/           # 2023 tweet data
│   ├── 2024/           # 2024 tweet data
│   ├── 2025/           # 2025 tweet data
│   └── 2026/           # 2026 tweet data
└── Yahoo-Realtime-Search-Scraper/  # Data collection scripts
```

## File Naming Convention

- CSV files are named by date: `YYYY-MM-DD.csv`
- Organized in year-based folders: `public/{YEAR}/{YYYY-MM-DD}.csv`
- Example: `public/2025/2025-01-12.csv`

## Data Organization

- **Year-based structure**: Data files organized by year for better scalability
- **Date-based naming**: Easy chronological sorting and identification
- **Single file per day**: Each CSV represents a day's tweet collection

## Performance Considerations

- 300,000+ tweets across multiple CSV files
- Streaming API reduces load time from 11+ seconds to near-instant
- Server-side filtering minimizes data transfer
- Year-based folders enable efficient data access patterns
