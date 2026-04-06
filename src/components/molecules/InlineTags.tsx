import { useState, useRef, type KeyboardEvent } from 'react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  editable?: boolean
}

const MAX_VISIBLE_TAGS = 8

export function InlineTags({ tags, onChange, editable = true }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [showAll, setShowAll] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = () => {
    const value = inputValue.trim().toLowerCase()
    if (value && !tags.includes(value)) {
      onChange([...tags, value])
    }
    setInputValue('')
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Escape') {
      setInputValue('')
      inputRef.current?.blur()
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove the last tag on backspace in empty input
      onChange(tags.slice(0, -1))
    }
  }

  const visibleTags = showAll ? tags : tags.slice(0, MAX_VISIBLE_TAGS)
  const hiddenCount = tags.length - MAX_VISIBLE_TAGS

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {visibleTags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[var(--color-green-faded)] text-[var(--color-green-dark)] border border-[var(--color-green-light)]"
        >
          {tag}
          {editable && (
            <button
              onClick={() => removeTag(tag)}
              className="ml-0.5 text-[var(--color-green-main)] hover:text-[var(--color-pink)] cursor-pointer bg-transparent border-none p-0 text-[12px] leading-none transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              x
            </button>
          )}
        </span>
      ))}

      {/* Show count badge for overflow tags */}
      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-gray-200)] transition-colors"
        >
          +{hiddenCount} more
        </button>
      )}

      {showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(false)}
          className="px-2 py-0.5 rounded-full text-[11px] text-[var(--color-text-muted)] cursor-pointer bg-transparent border-none hover:text-[var(--color-text-secondary)] transition-colors"
        >
          show less
        </button>
      )}

      {/* Always-visible tag input */}
      {editable && (
        <input
          ref={inputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onBlur={() => {
            if (inputValue.trim()) addTag()
          }}
          onKeyDown={handleKeyDown}
          placeholder="+ add tag"
          className="px-2 py-0.5 rounded-full text-[12px] border border-dashed border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] outline-none w-24 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-green-main)] focus:bg-[var(--color-surface)] transition-colors"
        />
      )}
    </div>
  )
}
