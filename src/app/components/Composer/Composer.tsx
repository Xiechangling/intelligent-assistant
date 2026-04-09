import { FilePlus2, FileImage, SendHorizontal } from 'lucide-react';
import { FormEvent, KeyboardEvent } from 'react';
import { useInputHistory } from '../../hooks/useInputHistory';
import { useAppShellStore } from '../../state/appShellStore';
import { VoiceInput } from '../VoiceInput';
import type { SessionAttachment } from '../../state/types';
import styles from './Composer.module.css';

interface ComposerProps {
  mode: 'project' | 'conversation';
  draftPrompt: string;
  pendingAttachments: SessionAttachment[];
  setDraftPrompt: (prompt: string) => void;
  addFileAttachments: () => Promise<void>;
  addImageAttachments: () => Promise<void>;
  removePendingAttachment: (attachmentId: string) => void;
  submitPrompt: () => Promise<void>;
  disabled: boolean;
}

function CommandHint({ draftPrompt }: { draftPrompt: string }) {
  if (!draftPrompt.startsWith('/')) {
    return null;
  }

  return (
    <div className={styles.commandHint}>
      <span>Slash command detected</span>
    </div>
  );
}

function PendingAttachments({
  attachments,
  onRemove,
}: {
  attachments: SessionAttachment[];
  onRemove: (id: string) => void;
}) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className={styles.pendingAttachments}>
      {attachments.map((attachment) => (
        <div key={attachment.id} className={styles.attachmentChip}>
          <strong>{attachment.name}</strong>
          <span>{attachment.kind}</span>
          <button
            type="button"
            onClick={() => onRemove(attachment.id)}
            aria-label="Remove attachment"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function Composer({
  mode,
  draftPrompt,
  pendingAttachments,
  setDraftPrompt,
  addFileAttachments,
  addImageAttachments,
  removePendingAttachment,
  submitPrompt,
  disabled,
}: ComposerProps) {
  const { globalDefaultModel, activeSessionModelOverride, setActiveSessionModelOverride } = useAppShellStore();

  // Integrate input history
  const { addToHistory, handleKeyDown: handleHistoryKeyDown, historySize } = useInputHistory(draftPrompt, setDraftPrompt);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addToHistory(draftPrompt);
    submitPrompt().catch(() => undefined);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle history navigation first
    handleHistoryKeyDown(event);

    // Then handle submit
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      addToHistory(draftPrompt);
      submitPrompt().catch(() => undefined);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setDraftPrompt(draftPrompt ? `${draftPrompt}\n${text}` : text);
  };

  const buttonLabel = mode === 'project' ? 'Send instruction' : 'Send message';
  const currentModel = activeSessionModelOverride || globalDefaultModel;

  return (
    <form className={`composer composer--${mode}`} onSubmit={handleSubmit} data-testid="composer">
      <CommandHint draftPrompt={draftPrompt} />
      <div className="composer__toolbar">
        <button
          className="workspace__secondary-action"
          type="button"
          onClick={() => addFileAttachments().catch(() => undefined)}
          disabled={disabled}
        >
          <FilePlus2 size={18} strokeWidth={2} />
          <span>File</span>
        </button>
        <button
          className="workspace__secondary-action"
          type="button"
          onClick={() => addImageAttachments().catch(() => undefined)}
          disabled={disabled}
        >
          <FileImage size={18} strokeWidth={2} />
          <span>Image</span>
        </button>
        <span className="composer__slash-hint">Type / to use slash commands</span>

        {/* Model selector and voice input */}
        <div className={styles.inputTools}>
          <select
            value={currentModel}
            onChange={(e) => setActiveSessionModelOverride(e.target.value as any)}
            className={styles.modelSelector}
            disabled={disabled}
          >
            <option value="claude-sonnet">Claude Sonnet</option>
            <option value="claude-opus">Claude Opus</option>
            <option value="claude-haiku">Claude Haiku</option>
          </select>
          <VoiceInput onTranscript={handleVoiceTranscript} />
        </div>
      </div>
      <PendingAttachments attachments={pendingAttachments} onRemove={removePendingAttachment} />
      <div className="composer__field">
        <textarea
          id="assistant-prompt"
          className="composer__input"
          value={draftPrompt}
          onChange={(event) => setDraftPrompt(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === 'project'
              ? 'Describe the next task for this workspace.'
              : 'Send a message to the assistant.'
          }
          rows={mode === 'project' ? 3 : 4}
          disabled={disabled}
        />
        <button
          className="workspace__primary-action composer__send"
          type="submit"
          disabled={disabled || !draftPrompt.trim()}
          aria-label={buttonLabel}
          title={mode === 'project' ? 'Ctrl/Cmd + Enter sends instruction' : 'Ctrl/Cmd + Enter sends message'}
        >
          <SendHorizontal size={18} strokeWidth={2} />
        </button>
      </div>
      <div className="composer__footer">
        <span>{buttonLabel}</span>
        <span>Ctrl/Cmd + Enter</span>
        {historySize > 0 && <span className="composer__history-hint">↑/↓ to browse history ({historySize})</span>}
      </div>
    </form>
  );
}
