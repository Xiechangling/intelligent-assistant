import { File, Image, X } from 'lucide-react'
import { useAppShellStore } from '../../state/appShellStore'
import styles from './AttachmentList.module.css'

export function AttachmentList() {
  const attachments = useAppShellStore((state) => state.attachments)
  const removeAttachment = useAppShellStore((state) => state.removeAttachment)

  if (attachments.length === 0) {
    return null
  }

  return (
    <div className={styles.list}>
      {attachments.map((attachment) => (
        <div key={attachment.id} className={styles.item}>
          <div className={styles.icon}>
            {attachment.type === 'image' ? (
              <Image size={16} />
            ) : (
              <File size={16} />
            )}
          </div>
          <span className={styles.name}>{attachment.name}</span>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => removeAttachment(attachment.id)}
            aria-label={`Remove ${attachment.name}`}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
