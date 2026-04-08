import { memo } from 'react'
import { Tweet } from '../types'
import styles from '../../page.module.css'
import TweetResultItem from './TweetResultItem'
import { SearchPagination } from './SearchPagination'
import { NoResults } from './NoResults'
import RelatedQuestions from './RelatedQuestions'
import RelatedSearches from './RelatedSearches'

interface NormalSearchResultsProps {
  tweets: Tweet[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  total?: number
  searchQuery?: string
}

function NormalSearchResults({
  tweets,
  currentPage,
  totalPages,
  onPageChange,
  total,
  searchQuery,
}: NormalSearchResultsProps) {
  return (
    <div style={{ display: 'flex', gap: '60px', paddingLeft: '160px', paddingRight: '20px' }}>
      <div className={styles.results} style={{ flex: '0 1 650px', minWidth: 0 }}>
        <div className={styles.resultStats}>約 {(total || tweets.length).toLocaleString()} 件の結果</div>

        {tweets.slice(0, 3).map((tweet) => (
          <TweetResultItem key={tweet.id} tweet={tweet} />
        ))}

        {tweets.length >= 1 && currentPage === 1 && searchQuery && (
          <RelatedQuestions searchQuery={searchQuery} />
        )}

        {tweets.slice(3).map((tweet) => (
          <TweetResultItem key={tweet.id} tweet={tweet} />
        ))}

        {tweets.length === 0 && (
          <div className={styles.noResults}>
            <NoResults searchQuery={searchQuery} />
          </div>
        )}

        {tweets.length > 0 && currentPage === 1 && searchQuery && (
          <RelatedSearches searchQuery={searchQuery} />
        )}

        {tweets.length > 0 && (
          <SearchPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  )
}

export default memo(NormalSearchResults)
