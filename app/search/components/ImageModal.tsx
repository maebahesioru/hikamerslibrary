import { SelectedImage } from '../types'
import { getTweetUrl } from '../utils'

interface ImageModalProps {
  selectedImage: SelectedImage
  onClose: () => void
}

export default function ImageModal({ selectedImage, onClose }: ImageModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        className="image-modal-content"
        style={{
          display: 'flex',
          maxWidth: '90vw',
          maxHeight: '90vh',
          gap: '20px',
          width: '100%',
          height: '100%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="image-modal-image" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
          <img
            src={selectedImage.imageUrl}
            alt={selectedImage.tweet.displayText}
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain'
            }}
          />
        </div>
        <div
          className="image-modal-details"
          style={{
            width: '400px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '8px',
            padding: '20px',
            overflowY: 'auto',
            maxHeight: '90vh',
            border: '1px solid var(--border-color)'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img
              src={selectedImage.tweet.profileImage && selectedImage.tweet.profileImage.startsWith('http') ? selectedImage.tweet.profileImage : '/default-avatar.svg'}
              alt={selectedImage.tweet.name}
              onError={(e) => {
                e.currentTarget.src = '/default-avatar.svg'
                e.currentTarget.onerror = null
              }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {selectedImage.tweet.name}
                {selectedImage.tweet.userVerified === 'true' && (
                  <svg viewBox="0 0 22 22" width="16" height="16" style={{ flexShrink: 0 }}>
                    <path fill="#1d9bf0" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                  </svg>
                )}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                @{selectedImage.tweet.userId}
                {selectedImage.tweet.userFollowersCount && parseInt(selectedImage.tweet.userFollowersCount) > 0 && (
                  <span style={{ marginLeft: '8px' }}>
                    · {parseInt(selectedImage.tweet.userFollowersCount).toLocaleString()} followers
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ color: 'var(--text-primary)', marginBottom: '16px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
            {selectedImage.tweet.displayText}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
            {selectedImage.tweet.createdAt}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <span>💬 {selectedImage.tweet.replyCount}</span>
            <span>🔁 {selectedImage.tweet.rtCount}</span>
            <span>💭 {selectedImage.tweet.qtCount}</span>
            <span>❤️ {selectedImage.tweet.likesCount}</span>
            {selectedImage.tweet.viewCount && parseInt(selectedImage.tweet.viewCount) > 0 && (
              <span>👁 {parseInt(selectedImage.tweet.viewCount).toLocaleString()}</span>
            )}
            {selectedImage.tweet.bookmarkCount && parseInt(selectedImage.tweet.bookmarkCount) > 0 && (
              <span>🔖 {selectedImage.tweet.bookmarkCount}</span>
            )}
          </div>
          {selectedImage.tweet.hashtags && selectedImage.tweet.hashtags.trim() && (
            <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedImage.tweet.hashtags.split(',').map((tag, i) => (
                <span key={i} style={{ 
                  fontSize: '12px', 
                  color: 'var(--link-color)', 
                  backgroundColor: 'var(--hover-bg)',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
          <a
            href={getTweetUrl(selectedImage.tweet.userId, selectedImage.tweet.id)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '12px',
              backgroundColor: '#1d9bf0',
              color: 'white',
              borderRadius: '20px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Xで見る
          </a>
        </div>
      </div>
    </div>
  )
}
