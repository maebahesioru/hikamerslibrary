'use client'

import { useState, useEffect, useMemo } from 'react'
import { HikamerUser, SortKey } from '../types'
import { sortUsers, filterHikamers, filterBySearch } from '../utils'

interface UseHikamerDataParams {
  sortBy: SortKey
  year: string
  limit: number
  dateFrom: string
  dateTo: string
  useCustomDate: boolean
  userFilter: string
  onlyMania: boolean
}

export function useHikamerData(params: UseHikamerDataParams) {
  const { sortBy, year, limit, dateFrom, dateTo, useCustomDate, userFilter, onlyMania } = params
  const [users, setUsers] = useState<HikamerUser[]>([])
  const [loading, setLoading] = useState(true)
  const [availableYears, setAvailableYears] = useState<string[]>([])

  // 年リスト取得
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await fetch('/api/hikamer-dx?action=years')
        const data = await res.json()
        setAvailableYears(data.years || [])
      } catch (e) {
        console.error('Failed to fetch years:', e)
      }
    }
    fetchYears()
  }, [])

  // ユーザーデータ取得
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('sortBy', sortBy)
        params.set('limit', limit.toString())
        if (useCustomDate) {
          if (dateFrom) params.set('from', dateFrom)
          if (dateTo) params.set('to', dateTo)
        } else if (year !== 'all') {
          params.set('year', year)
        }
        const res = await fetch(`/api/hikamer-dx?${params}`)
        const data = await res.json()
        const sortedUsers = sortUsers(data.users || [], sortBy)
        setUsers(sortedUsers)
      } catch (e) {
        console.error('Failed to fetch users:', e)
      }
      setLoading(false)
    }
    fetchUsers()
  }, [sortBy, year, limit, dateFrom, dateTo, useCustomDate])

  // フィルタリング
  const filteredUsers = useMemo(() => {
    let filtered = [...users]
    if (onlyMania) {
      filtered = filterHikamers(filtered)
    }
    if (userFilter.trim()) {
      filtered = filterBySearch(filtered, userFilter)
    }
    return filtered
  }, [users, userFilter, onlyMania])

  return { users: filteredUsers, loading, availableYears }
}
