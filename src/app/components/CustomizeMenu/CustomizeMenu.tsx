import { useEffect, useRef } from 'react';
import { useAppShellStore } from '../../state/appShellStore';
import { Check } from 'lucide-react';
import styles from './CustomizeMenu.module.css';

interface CustomizeMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

export function CustomizeMenu({ isOpen, onClose, anchorRef }: CustomizeMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useAppShellStore();

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  // Position menu relative to anchor
  useEffect(() => {
    if (!isOpen || !menuRef.current || !anchorRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();

    // Adjust position to stay in viewport
    let top = anchorRect.bottom + 8;
    let right = window.innerWidth - anchorRect.right;

    // Check if menu would go off bottom of screen
    if (top + menuRect.height > window.innerHeight) {
      top = anchorRect.top - menuRect.height - 8;
    }

    // Check if menu would go off left of screen
    if (anchorRect.right - menuRect.width < 0) {
      right = window.innerWidth - anchorRect.left - menuRect.width;
    }

    menuRef.current.style.top = `${top}px`;
    menuRef.current.style.right = `${right}px`;
  }, [isOpen, anchorRef]);

  if (!isOpen) {
    return null;
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
  };

  return (
    <div ref={menuRef} className={styles.customizeMenu}>
      {/* Theme section */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Theme</div>
        <button
          className={`${styles.menuItem} ${theme === 'light' ? styles.active : ''}`}
          onClick={() => handleThemeChange('light')}
        >
          <Check className={styles.checkIcon} size={16} />
          <span>Light</span>
        </button>
        <button
          className={`${styles.menuItem} ${theme === 'dark' ? styles.active : ''}`}
          onClick={() => handleThemeChange('dark')}
        >
          <Check className={styles.checkIcon} size={16} />
          <span>Dark</span>
        </button>
        <button
          className={`${styles.menuItem} ${theme === 'auto' ? styles.active : ''}`}
          onClick={() => handleThemeChange('auto')}
        >
          <Check className={styles.checkIcon} size={16} />
          <span>System</span>
        </button>
      </div>

      {/* Settings section */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Settings</div>
        <button className={styles.menuItem} disabled>
          <span>Preferences</span>
        </button>
        <button className={styles.menuItem} disabled>
          <span>Keyboard Shortcuts</span>
        </button>
      </div>

      {/* About section */}
      <div className={styles.section}>
        <button className={styles.menuItem} disabled>
          <span>About</span>
        </button>
      </div>
    </div>
  );
}
