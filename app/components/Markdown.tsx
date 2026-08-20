'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders post descriptions written in markdown. Raw HTML is not enabled, so
 * author-supplied markup is escaped rather than executed.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="post-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children: label, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer noopener">
              {label}
            </a>
          ),
          table: ({ node: _node, ...props }) => (
            <div className="post-markdown-table-wrap">
              <table {...props} />
            </div>
          ),
          img: ({ node: _node, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} alt={props.alt ?? ''} loading="lazy" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
