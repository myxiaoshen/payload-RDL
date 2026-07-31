'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type CommentUser = { id: number | string; name?: string | null; email?: string | null }

type CommentDoc = {
  id: number | string
  content: string
  author?: CommentUser | number | string | null
  parent?: { id: number | string } | number | string | null
  createdAt: string
}

type MeUser = { id: number | string; name?: string | null; email?: string | null } | null

type TreeNode = CommentDoc & { children: TreeNode[] }

const authorName = (author: CommentDoc['author']): string => {
  if (author && typeof author === 'object') return author.name || author.email || '用户'
  return '用户'
}

const parentId = (parent: CommentDoc['parent']): string | null => {
  if (parent && typeof parent === 'object') return String(parent.id)
  if (parent != null) return String(parent)
  return null
}

const buildTree = (comments: CommentDoc[]): TreeNode[] => {
  const map = new Map<string, TreeNode>()
  const roots: TreeNode[] = []
  comments.forEach((c) => map.set(String(c.id), { ...c, children: [] }))
  comments.forEach((c) => {
    const node = map.get(String(c.id))!
    const pid = parentId(c.parent)
    if (pid && map.has(pid)) {
      map.get(pid)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

export const CommentsSection: React.FC<{
  relationTo: 'posts' | 'software'
  docId: number | string
}> = ({ relationTo, docId }) => {
  const [user, setUser] = useState<MeUser>(null)
  const [comments, setComments] = useState<CommentDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const loadComments = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      qs.set('where[relatedTo.value][equals]', String(docId))
      qs.set('where[relatedTo.relationTo][equals]', relationTo)
      qs.set('where[status][equals]', 'approved')
      qs.set('depth', '1')
      qs.set('limit', '200')
      qs.set('sort', 'createdAt')
      const res = await fetch(`/api/comments?${qs.toString()}`, { credentials: 'include' })
      const data = await res.json()
      setComments(data?.docs ?? [])
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [docId, relationTo])

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null))
    void loadComments()
  }, [loadComments])

  const tree = useMemo(() => buildTree(comments), [comments])

  const submit = async (text: string, parent: string | null) => {
    if (!text.trim()) return
    setSubmitting(true)
    setNotice(null)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text.trim(),
          relatedTo: { relationTo, value: docId },
          ...(parent ? { parent } : {}),
        }),
      })
      if (!res.ok) throw new Error('提交失败')
      setNotice('评论已提交，通过审核后显示。')
      setContent('')
      setReplyContent('')
      setReplyTo(null)
    } catch {
      setNotice('提交失败，请稍后再试。')
    } finally {
      setSubmitting(false)
    }
  }

  const renderNode = (node: TreeNode, depth: number) => (
    <div key={String(node.id)} className={depth > 0 ? 'ml-6 border-l border-border pl-4' : ''}>
      <div className="py-3">
        <div className="mb-1 flex items-center gap-2 text-sm">
          <span className="font-medium">{authorName(node.author)}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(node.createdAt).toLocaleString('zh-CN')}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-sm text-foreground/90">{node.content}</p>
        {user && (
          <button
            type="button"
            className="mt-1 text-xs text-muted-foreground hover:text-primary"
            onClick={() => {
              setReplyTo(replyTo === String(node.id) ? null : String(node.id))
              setReplyContent('')
            }}
          >
            {replyTo === String(node.id) ? '取消回复' : '回复'}
          </button>
        )}
        {replyTo === String(node.id) && (
          <div className="mt-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="回复…"
              rows={2}
            />
            <div className="mt-2">
              <Button
                size="sm"
                disabled={submitting}
                onClick={() => submit(replyContent, String(node.id))}
              >
                发表回复
              </Button>
            </div>
          </div>
        )}
      </div>
      {node.children.map((child) => renderNode(child, depth + 1))}
    </div>
  )

  return (
    <section className="mx-auto mt-16 max-w-[48rem]">
      <h2 className="mb-6 text-2xl font-bold">评论</h2>

      {user ? (
        <div className="mb-8">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论…"
            rows={3}
          />
          <div className="mt-3">
            <Button disabled={submitting} onClick={() => submit(content, null)}>
              发表评论
            </Button>
          </div>
        </div>
      ) : (
        <p className="mb-8 text-sm text-muted-foreground">
          请先{' '}
          <a href="/login" className="text-primary hover:underline">
            登录
          </a>{' '}
          后发表评论。
        </p>
      )}

      {notice && <p className="mb-6 text-sm text-primary">{notice}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">加载中…</p>
      ) : tree.length === 0 ? (
        <p className="text-sm text-muted-foreground">还没有评论，来做第一个吧。</p>
      ) : (
        <div className="divide-y divide-border">{tree.map((node) => renderNode(node, 0))}</div>
      )}
    </section>
  )
}
