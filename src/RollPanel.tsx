import { useState } from 'react'

export interface FilterConfig {
  key: string
  label: string
  options: { value: string; label: string }[]
}

interface RollPanelProps<T> {
  title: string
  items: T[]
  filters?: FilterConfig[]
  filterItem: (item: T, activeFilters: Record<string, string>) => boolean
  rollItem: (items: T[], activeFilters: Record<string, string>) => { item: T; roll: number } | null
  getLabel: (item: T) => string
  renderPreview: (item: T) => React.ReactNode
  onAdd?: (item: T) => void
  onClose?: () => void
}

export function RollPanel<T>({
  title,
  items,
  filters = [],
  filterItem,
  rollItem,
  getLabel,
  renderPreview,
  onAdd,
  onClose,
}: RollPanelProps<T>) {
  const [mode, setMode] = useState<'choose' | 'roll'>('choose')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const f of filters) {
      initial[f.key] = f.options[0]?.value ?? ''
    }
    return initial
  })
  const [selection, setSelection] = useState('')
  const [preview, setPreview] = useState<T | null>(null)
  const [roll, setRoll] = useState<number | null>(null)

  const filteredItems = items.filter((item) => filterItem(item, activeFilters))

  const handleSelectionChange = (label: string) => {
    setSelection(label)
    const chosen = items.find((item) => getLabel(item) === label) ?? null
    setPreview(chosen)
    setRoll(null)
    setMode('choose')
  }

  const updateFilter = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }))
    setSelection('')
    setPreview(null)
    setRoll(null)
  }

  const handleRoll = () => {
    const result = rollItem(items, activeFilters)

    if (!result) {
      setPreview(null)
      setRoll(null)
      setMode('roll')
      return
    }

    setPreview(result.item)
    setRoll(result.roll)
    setMode('roll')
  }

  const handleAdd = () => {
    if (!preview) return
    onAdd?.(preview)
  }

  return (
    <>
      <div className="modal-header">
        <div>
          <h3>{title}</h3>
          <p>Choose from the list or roll for one.</p>
        </div>
        {onClose && (
          <button type="button" className="button button-ghost" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      <div className="modal-toggle-row">
        <button
          type="button"
          className={`button ${mode === 'choose' ? 'button-primary' : 'button-ghost'}`}
          onClick={() => {
            const first = filteredItems[0]
            setSelection(first ? getLabel(first) : '')
            setPreview(first ?? null)
            setRoll(null)
            setMode('choose')
          }}
        >
          Choose
        </button>
        <button
          type="button"
          className={`button ${mode === 'roll' ? 'button-primary' : 'button-ghost'}`}
          onClick={handleRoll}
        >
          Roll
        </button>
      </div>

      <div className="modal-body">
        {filters.length > 0 && (
          <div className="modal-field-row">
            {filters.map((f) => (
              <span key={f.key} style={{ display: 'contents' }}>
                <label className="modal-label" htmlFor={`filter-${f.key}`}>
                  {f.label}
                </label>
                <select
                  id={`filter-${f.key}`}
                  className="panel-select"
                  value={activeFilters[f.key] ?? ''}
                  onChange={(event) => updateFilter(f.key, event.target.value)}
                >
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </span>
            ))}
          </div>
        )}

        {mode === 'choose' ? (
          <>
            <label className="modal-label" htmlFor="item-select">
              Select
            </label>
            <select
              id="item-select"
              className="panel-select"
              value={selection}
              onChange={(event) => handleSelectionChange(event.target.value)}
              disabled={filteredItems.length === 0}
            >
              <option value="">Select an option</option>
              {filteredItems.map((item) => (
                <option key={getLabel(item)} value={getLabel(item)}>
                  {getLabel(item)}
                </option>
              ))}
            </select>
          </>
        ) : null}

        {preview ? (
          <div className="modal-preview">
            {roll !== null && (
              <p className="modal-roll-result">Rolled {roll}</p>
            )}
            {renderPreview(preview)}
          </div>
        ) : (
          <div className="modal-preview">
            <p>No item available.</p>
          </div>
        )}
      </div>

      {onAdd && (
        <div className="modal-footer">
          {onClose && (
            <button type="button" className="button button-ghost" onClick={onClose}>
              Cancel
            </button>
          )}
          <button type="button" className="button button-primary" onClick={handleAdd} disabled={!preview}>
            {onClose ? 'Confirm' : 'Add'}
          </button>
        </div>
      )}
    </>
  )
}
