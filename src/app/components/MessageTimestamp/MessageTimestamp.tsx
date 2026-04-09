import { formatDistanceToNow } from 'date-fns';
import styles from './MessageTimestamp.module.css';

interface MessageTimestampProps {
  timestamp: string | Date;
}

export function MessageTimestamp({ timestamp }: MessageTimestampProps) {
  const date = new Date(timestamp);
  const relativeTime = formatDistanceToNow(date, { addSuffix: true });

  return (
    <time
      className={styles.timestamp}
      dateTime={date.toISOString()}
      title={date.toLocaleString()}
    >
      {relativeTime}
    </time>
  );
}
