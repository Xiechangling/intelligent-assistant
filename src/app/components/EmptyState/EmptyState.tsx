import React from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  mode: 'project' | 'conversation'
}

export function EmptyState({ mode }: EmptyStateProps) {
  const title = mode === 'project'
    ? 'Start a coding session'
    : 'Start a conversation'

  const description = mode === 'project'
    ? 'Describe the task for this workspace to begin an attached coding session.'
    : 'Send a message without opening a workspace.'

  return (
    <div className={styles.emptyState}>
      <div className={styles.mascot}>
        <img src="/panda-mascot.svg" alt="Panda mascot" />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  )
}
