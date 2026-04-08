'use client'

import { useState, useEffect } from 'react'
import { FileInfo, Stats, ExportFormat } from '../types'

export function useDownloadData() {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [groupedFiles, setGroupedFiles] = useState<{ [year: string]: FileInfo[] }>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredGroupedFiles, setFilteredGroupedFiles] = useState<{ [year: string]: FileInfo[] }>({})
  const [stats, setStats] = useState<Stats>({ totalFiles: 0, totalTweets: 0, totalSize: 0, years: 0 })
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('tsv')

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const response = await fetch('/api/download/list')
        const data = await response.json()
        
        if (data.error) {
          console.error('Error:', data.error)
          setIsLoading(false)
          return
        }
        
        setStats(data.stats)
        
        const allFiles: FileInfo[] = []
        const grouped: { [year: string]: FileInfo[] } = {}
        
        for (const [year, yearFiles] of Object.entries(data.files as { [year: string]: { date: string; count: number; size: number }[] })) {
          grouped[year] = []
          for (const file of yearFiles) {
            const fileInfo: FileInfo = { date: file.date, count: file.count, size: file.size, year }
            allFiles.push(fileInfo)
            grouped[year].push(fileInfo)
          }
          grouped[year].sort((a, b) => b.date.localeCompare(a.date))
        }

        setFiles(allFiles)
        setGroupedFiles(grouped)
        setFilteredGroupedFiles(grouped)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading files:', error)
        setIsLoading(false)
      }
    }

    loadFiles()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGroupedFiles(groupedFiles)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered: { [year: string]: FileInfo[] } = {}

    Object.keys(groupedFiles).forEach(year => {
      const matchedFiles = groupedFiles[year].filter(file =>
        file.date.toLowerCase().includes(query) || file.year.includes(query)
      )
      if (matchedFiles.length > 0) filtered[year] = matchedFiles
    })

    setFilteredGroupedFiles(filtered)
  }, [searchQuery, groupedFiles])

  const toggleYear = (year: string) => {
    setExpandedYears(prev => {
      const next = new Set(prev)
      if (next.has(year)) next.delete(year)
      else next.add(year)
      return next
    })
  }

  const expandAll = () => setExpandedYears(new Set(Object.keys(filteredGroupedFiles)))
  const collapseAll = () => setExpandedYears(new Set())

  return {
    files, isLoading, filteredGroupedFiles, searchQuery, setSearchQuery,
    stats, expandedYears, toggleYear, expandAll, collapseAll,
    selectedFormat, setSelectedFormat
  }
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function handleDownload(date: string, format: ExportFormat = 'tsv') {
  const link = document.createElement('a')
  link.href = `/api/download?date=${date}&format=${format}`
  link.download = `${date}.${format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function handleDownloadAll(files: FileInfo[], format: ExportFormat = 'tsv') {
  files.forEach((file, index) => {
    setTimeout(() => handleDownload(file.date, format), index * 500)
  })
}
