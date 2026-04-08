interface AdvancedSearchModalProps {
  onClose: () => void
}

export default function AdvancedSearchModal({ onClose }: AdvancedSearchModalProps) {
  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    fontSize: '14px'
  }

  const labelStyle = {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    display: 'block',
    marginBottom: '8px'
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid var(--border-color)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>検索オプション</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle as React.CSSProperties}>すべてのキーワードを含む</label>
            <input type="text" placeholder="キーワードを入力" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle as React.CSSProperties}>語順も含め完全一致</label>
            <input type="text" placeholder="完全一致するフレーズ" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle as React.CSSProperties}>いずれかのキーワードを含む</label>
            <input type="text" placeholder="キーワード1 OR キーワード2" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle as React.CSSProperties}>含めないキーワード</label>
            <input type="text" placeholder="除外するキーワード" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle as React.CSSProperties}>エンゲージメント数の範囲</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="number" placeholder="最小" style={{ ...inputStyle, flex: 1 }} />
              <span style={{ color: 'var(--text-secondary)' }}>〜</span>
              <input type="number" placeholder="最大" style={{ ...inputStyle, flex: 1 }} />
            </div>
          </div>

          <div>
            <label style={labelStyle as React.CSSProperties}>期間指定</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="date" title="開始日" aria-label="開始日" style={{ ...inputStyle, flex: 1 }} />
              <span style={{ color: 'var(--text-secondary)' }}>〜</span>
              <input type="date" title="終了日" aria-label="終了日" style={{ ...inputStyle, flex: 1 }} />
            </div>
          </div>

          <div>
            <label style={labelStyle as React.CSSProperties}>ユーザー指定</label>
            <input type="text" placeholder="@ユーザー名" style={inputStyle} />
          </div>

          <button
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'var(--link-color)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            検索
          </button>
        </div>
      </div>
    </div>
  )
}
