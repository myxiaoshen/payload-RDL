'use client'

import { useCallback, useEffect, useState } from 'react'

type Options = {
  /** 已构建好的查询串，不含 page/limit */
  query: string
  limit?: number
  /** 为 false 时不发起请求（用于标签页懒加载） */
  enabled?: boolean
}

type Result<T> = {
  docs: T[]
  page: number
  totalPages: number
  totalDocs: number
  loading: boolean
  setPage: (page: number) => void
  reload: () => Promise<void>
  removeDoc: (id: number | string) => void
}

/**
 * 个人中心列表的分页拉取：每次只取一页，避免一次性拉 100 条拖慢页面。
 */
export const usePaginatedList = <T extends { id: number | string }>({
  query,
  limit = 10,
  enabled = true,
}: Options): Result<T> => {
  const [docs, setDocs] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)
  const [loading, setLoading] = useState(enabled)

  const fetchPage = useCallback(
    async (targetPage: number) => {
      setLoading(true)
      try {
        const res = await fetch(`${query}&limit=${limit}&page=${targetPage}`, {
          credentials: 'include',
        })
        const data = await res.json()
        setDocs(data?.docs ?? [])
        setTotalPages(data?.totalPages ?? 1)
        setTotalDocs(data?.totalDocs ?? 0)
      } catch {
        setDocs([])
      } finally {
        setLoading(false)
      }
    },
    [limit, query],
  )

  useEffect(() => {
    if (!enabled) return
    void fetchPage(page)
  }, [enabled, fetchPage, page])

  const reload = useCallback(() => fetchPage(page), [fetchPage, page])

  // 删除末页最后一条时回退一页，避免停在空白页
  const removeDoc = useCallback(
    (id: number | string) => {
      setDocs((prev) => {
        const next = prev.filter((doc) => doc.id !== id)
        if (next.length === 0 && page > 1) setPage(page - 1)
        return next
      })
      setTotalDocs((prev) => Math.max(0, prev - 1))
    },
    [page],
  )

  return { docs, page, totalPages, totalDocs, loading, setPage, reload, removeDoc }
}
