import { useState, useRef, type KeyboardEvent } from 'react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  editable?: boolean
}

export function InlineTags({ tags, onChange, editable = true }: Props) {
  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = () => {
    const value = inputValue.trim().toLowerCase()
    if (value && !tags.includes(value)) {
      onChange([...tags, value])
    }
    setInputValue('')
    setInputVisible(false)
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Escape') {
      setInputValue('')
      setInputVisible(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--color-green-faded)] text-[var(--color-green-dark)] border border-[var(--color-green-light)]"
        >
          {tag}
          {editable && (
            <button
              onClick={() => removeTag(tag)}
              className="ml-0.5 text-[var(--color-green-main)] hover:text-[var(--color-pink)] cursor-pointer bg-transparent border-none p-0 text-[11px] leading-none"
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          )}
        </span>
      ))}
      {editable && (
        inputVisible ? (
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onBlur={addTag}
            onKeyDown={handleKeyDown}
            placeholder="tag name"
            autoFocus
            className="px-2 py-0.5 rounded-full text-[11px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] outline-none w-20"
          />
        ) : (
          <button
            onClick={() => setInputVisible(true)}
            className="px-2 py-0.5 rounded-full text-[11px] border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-green-main)] hover:text-[var(--color-green-main)] cursor-pointer bg-transparent transition-colors"
          >
            + tag
          </button>
        )
      )}
    </div>
  )
}
