import { useState, useMemo, useEffect, useRef } from 'react';
import { useAppShellStore } from '../../state/appShellStore';
import { MessageSquare } from 'lucide-react';
import styles from './GlobalSearch.module.css';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const { sessionHistory, resumeSession } = useAppShellStore();

  // Search sessions by title
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    return sessionHistory
      .filter((session: any) =>
        session.title.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10); // Limit to 10 results
  }, [query, sessionHistory]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleResultClick = (sessionId: string) => {
    resumeSession(sessionId);
    onClose();
    setQuery('');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div ref={modalRef} className={styles.modal} data-testid="global-search">
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Search sessions and messages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className={styles.results}>
          {query.trim() === '' ? (
            <div className={styles.emptyState}>
              Type to search sessions...
            </div>
          ) : searchResults.length === 0 ? (
            <div className={styles.emptyState}>
              No results found for "{query}"
            </div>
          ) : (
            searchResults.map((session: any) => (
              <button
                key={session.id}
                className={styles.resultItem}
                onClick={() => handleResultClick(session.id)}
              >
                <MessageSquare size={16} />
                <div className={styles.resultContent}>
                  <div className={styles.resultTitle}>{session.title}</div>
                  <div className={styles.resultMeta}>
                    {session.projectName || 'No project'}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
