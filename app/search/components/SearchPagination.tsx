import { getPageNumbers } from '../utils'
import styles from '../../page.module.css'

interface SearchPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function SearchPagination({ currentPage, totalPages, onPageChange }: SearchPaginationProps) {
  return (
    <div className={styles.pagination}>
      <MobilePagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      <DesktopPagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}

function MobilePagination({ currentPage, totalPages, onPageChange }: SearchPaginationProps) {
  return (
    <div className="pagination-mobile" style={{ display: 'none' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%', padding: '0 15px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          overflowX: 'auto', 
          width: '100%',
          padding: '4px 0',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin'
        }}>
          {getPageNumbers(currentPage, totalPages).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              style={{
                minWidth: '28px',
                height: '28px',
                padding: '4px',
                fontSize: '12px',
                background: page === currentPage ? 'var(--link-color)' : 'transparent',
                color: page === currentPage ? '#fff' : 'var(--link-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: page === currentPage ? 600 : 400,
                transition: 'all 0.2s',
                flexShrink: 0
              }}
            >
              {page}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <NavButton direction="prev" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} />
          <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, minWidth: '60px', textAlign: 'center' }}>
            {currentPage} / {totalPages}
          </span>
          <NavButton direction="next" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} />
        </div>
      </div>
    </div>
  )
}

function NavButton({ direction, disabled, onClick }: { direction: 'prev' | 'next'; disabled: boolean; onClick: () => void }) {
  const isPrev = direction === 'prev'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        maxWidth: '120px',
        padding: '10px 16px',
        fontSize: '13px',
        background: 'transparent',
        color: 'var(--link-color)',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        transition: 'all 0.2s'
      }}
    >
      {isPrev && <ChevronIcon direction="left" />}
      {isPrev ? '前へ' : '次へ'}
      {!isPrev && <ChevronIcon direction="right" />}
    </button>
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  const path = direction === 'left' ? 'M15 18L9 12L15 6' : 'M9 18L15 12L9 6'
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d={path} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DesktopPagination({ currentPage, totalPages, onPageChange }: SearchPaginationProps) {
  return (
    <div className="pagination-desktop" style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', maxWidth: '100%' }}>
      {currentPage > 1 && (
        <div className="pagination-prev" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-end' }}>
          <button className={styles.paginationButton} onClick={() => onPageChange(currentPage - 1)} title="前へ">
            <ChevronIcon direction="left" />
          </button>
          <button className={styles.nextButton} onClick={() => onPageChange(currentPage - 1)}>
            <ChevronIcon direction="left" />
            前へ
          </button>
        </div>
      )}

      <LogoPagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

      {currentPage < totalPages && (
        <div className="pagination-next" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
          <button className={styles.paginationButton} onClick={() => onPageChange(currentPage + 1)} title="次へ">
            <ChevronIcon direction="right" />
          </button>
          <button className={styles.nextButton} onClick={() => onPageChange(currentPage + 1)}>
            次へ
            <ChevronIcon direction="right" />
          </button>
        </div>
      )}
    </div>
  )
}

function LogoPagination({ currentPage, totalPages, onPageChange }: SearchPaginationProps) {
  const colors = ['#4285f4', '#ea4335', '#fbbc04', '#4285f4']
  const letters = ['H', 'i', 'k', 'a']
  const endLetters = [
    { letter: 'm', color: '#34a853' },
    { letter: 'e', color: '#ea4335' },
    { letter: 'r', color: '#4285f4' }
  ]
  
  return (
    <div className="pagination-logo" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, flex: '0 1 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'nowrap', overflow: 'hidden' }}>
        {letters.map((letter, i) => (
          <span key={i} style={{ color: colors[i], fontSize: 'clamp(16px, 4vw, 32px)', fontWeight: 400, letterSpacing: '-1.5px', lineHeight: '1' }}>
            {letter}
          </span>
        ))}
        <div className="pagination-pages" style={{ display: 'flex', gap: 0, minWidth: 0, marginLeft: '-2px', marginRight: '-2px', fontSize: 0 }}>
          {getPageNumbers(currentPage, totalPages).map((page) => (
            <div key={page} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: 0 }}>
              <span
                style={{
                  color: page === currentPage ? '#e8eaed' : '#8ab4f8',
                  cursor: 'pointer',
                  opacity: page === currentPage ? 1 : 0.6,
                  fontSize: 'clamp(16px, 4vw, 32px)',
                  fontWeight: 400,
                  letterSpacing: '-1.5px',
                  lineHeight: '1',
                  display: 'block',
                  margin: 0,
                  padding: 0
                }}
                onClick={() => onPageChange(page)}
              >
                m
              </span>
              <button
                className={`${styles.pageNumber} ${page === currentPage ? styles.pageNumberActive : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            </div>
          ))}
        </div>
        {endLetters.map(({ letter, color }, i) => (
          <span key={i} style={{ color, fontSize: 'clamp(16px, 4vw, 32px)', fontWeight: 400, letterSpacing: '-1.5px', lineHeight: '1', marginLeft: i === 0 ? '-4px' : 0 }}>
            {letter}
          </span>
        ))}
      </div>
    </div>
  )
}
