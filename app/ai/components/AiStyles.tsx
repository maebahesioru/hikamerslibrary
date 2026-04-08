export default function AiStyles() {
  return (
    <style jsx global>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes spin-reverse {
        0% { transform: rotate(360deg); }
        100% { transform: rotate(0deg); }
      }

      @keyframes pulse {
        0%, 100% { 
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
        50% { 
          opacity: 0.5;
          transform: translate(-50%, -50%) scale(1.2);
        }
      }

      @keyframes bounce {
        0%, 80%, 100% { 
          transform: translateY(0);
          opacity: 0.5;
        }
        40% { 
          transform: translateY(-10px);
          opacity: 1;
        }
      }

      .markdown-content h1,
      .markdown-content h2,
      .markdown-content h3,
      .markdown-content h4 {
        margin-top: 24px;
        margin-bottom: 12px;
        font-weight: 600;
        line-height: 1.4;
      }

      .markdown-content h1 {
        font-size: 24px;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 8px;
      }

      .markdown-content h2 {
        font-size: 20px;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 6px;
      }

      .markdown-content h3 {
        font-size: 18px;
      }

      .markdown-content h4 {
        font-size: 16px;
      }

      .markdown-content p {
        margin-bottom: 16px;
      }

      .markdown-content ul,
      .markdown-content ol {
        margin-bottom: 16px;
        padding-left: 24px;
      }

      .markdown-content li {
        margin-bottom: 8px;
      }

      .markdown-content code {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 2px 6px;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
      }

      .markdown-content pre {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 16px;
        overflow-x: auto;
        margin-bottom: 16px;
      }

      .markdown-content pre code {
        background: transparent;
        border: none;
        padding: 0;
      }

      .markdown-content blockquote {
        border-left: 4px solid var(--border-color);
        padding-left: 16px;
        margin: 16px 0;
        color: var(--text-secondary);
        font-style: italic;
      }

      .markdown-content a {
        color: #8ab4f8;
        text-decoration: none;
      }

      .markdown-content a:hover {
        text-decoration: underline;
      }

      .markdown-content table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 16px;
      }

      .markdown-content th,
      .markdown-content td {
        border: 1px solid var(--border-color);
        padding: 8px 12px;
        text-align: left;
      }

      .markdown-content th {
        background: var(--bg-secondary);
        font-weight: 600;
      }
    `}</style>
  )
}
