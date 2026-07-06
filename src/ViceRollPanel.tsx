import { rollVice } from './lib/viceRoll'
import { RollPanel } from './RollPanel'

type Vice = {
  name: string
  stats?: Record<string, number>
  description: string
}

interface ViceRollPanelProps {
  items: Vice[]
  onAddVice?: (vice: Vice) => void
  onClose?: () => void
}

export function ViceRollPanel({ items, onAddVice, onClose }: ViceRollPanelProps) {
  return (
    <RollPanel
      title="Vice Roller"
      items={items}
      filterItem={() => true}
      rollItem={(vices) => {
        const result = rollVice(vices)
        return result ? { item: result.vice, roll: result.roll } : null
      }}
      getLabel={(v) => v.name}
      renderPreview={(v) => (
        <>
          <strong>{v.name}</strong>
          <p>{v.description}</p>
        </>
      )}
      onAdd={onAddVice ? (v) => onAddVice(v) : undefined}
      onClose={onClose}
    />
  )
}
