import { useState } from 'react'
import { generateNameWithMoniker } from './lib/nameGenerator'

interface RenamePanelProps {
  currentName: string
  raceName: string
  onConfirm: (name: string) => void
  onClose?: () => void
}

export function RenamePanel({ currentName, raceName, onConfirm, onClose }: RenamePanelProps) {
  const [name, setName] = useState(currentName)

  const handleRoll = () => {
    setName(generateNameWithMoniker(raceName))
  }

  return (
    <>
      <div className="modal-header">
        <div>
          <h3>Rename</h3>
          <p>Roll a new name or type one yourself.</p>
        </div>
        {onClose && (
          <button type="button" className="button button-ghost" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      <div className="modal-body">
        <div className="modal-field-row">
          <label className="modal-label" htmlFor="rename-input">
            Name
          </label>
          <input
            id="rename-input"
            type="text"
            className="rename-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button type="button" className="button button-ghost" onClick={handleRoll}>
            Roll
          </button>
        </div>
      </div>

      <div className="modal-footer">
        {onClose && (
          <button type="button" className="button button-ghost" onClick={onClose}>
            Cancel
          </button>
        )}
        <button type="button" className="button button-primary" onClick={() => onConfirm(name)}>
          Confirm
        </button>
      </div>
    </>
  )
}
