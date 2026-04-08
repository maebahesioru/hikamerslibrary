import styles from './LoadingSkeleton.module.css'
import resultStyles from '../../page.module.css'

export default function LoadingSkeleton() {
  return (
    <div className={resultStyles.results}>
      <div className={resultStyles.resultStats}>
        <div className={styles.skeletonText} />
      </div>

      {[...Array(10)].map((_, i) => (
        <div key={i} className={resultStyles.resultItem}>
          <div className={styles.skeletonContainer}>
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonSubtitle} />
              <div className={styles.skeletonBody} />
            </div>
            <div className={styles.skeletonImage} />
          </div>
        </div>
      ))}
    </div>
  )
}
