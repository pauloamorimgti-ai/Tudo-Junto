'use client'

import { Message } from '@/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface Props {
  message: Message
  isStreaming?: boolean
}

// Minimal markdown renderer — bold, code, code blocks, links
function renderMarkdown(text: string): string {
  return text
    // Code blocks
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="msg-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="msg-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="msg-h1">$1</h1>')
    // Bullet lists
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="msg-list">$1</ul>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="msg-link">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />')
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 group">
        <div className="max-w-[75%]">
          <div className="bg-accent text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-6 group">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center text-sm shrink-0 mt-0.5">
        ✦
      </div>

      <div className="flex-1 min-w-0">
        {/* Content */}
        <div
          className={cn(
            'prose-msg text-sm leading-relaxed text-text',
            isStreaming && 'streaming'
          )}
          dangerouslySetInnerHTML={{ __html: '<p>' + renderMarkdown(message.content) + '</p>' }}
        />

        {/* Actions */}
        {!isStreaming && (
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={copy}
              className="text-xs text-text-muted hover:text-text flex items-center gap-1 transition-colors"
            >
              {copied ? '✓ Copiado' : '⎘ Copiar'}
            </button>
            {message.model && (
              <span className="text-xs text-text-muted/50">
                {message.model.split('/').pop()}
              </span>
            )}
          </div>
        )}

        {/* Streaming cursor */}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-accent/60 ml-0.5 animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  )
}
