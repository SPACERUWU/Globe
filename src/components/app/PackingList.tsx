import { useState, useEffect, useCallback } from 'react'
import { Plus, X, Check, Package2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { PackingItem } from '../../types'

const PRESETS: Record<string, string[]> = {
  '📄 Documents': ['Passport', 'Visa', 'Boarding pass', 'Travel insurance', 'Hotel confirmation'],
  '👔 Clothes':   ['T-shirts', 'Pants/shorts', 'Underwear & socks', 'Jacket', 'Comfortable shoes', 'Swimwear'],
  '🔌 Electronics': ['Phone charger', 'Power bank', 'Universal adapter', 'Earphones'],
  '🧴 Toiletries': ['Toothbrush & toothpaste', 'Shampoo', 'Sunscreen', 'Deodorant'],
  '💊 Health':    ['Pain relievers', 'Band-aids', 'Motion sickness pills', 'Prescriptions'],
  '💰 Money':     ['Credit/debit cards', 'Local cash', 'Emergency backup card'],
}

export function PackingList({ tripId }: { tripId: string }) {
  const { user } = useAuth()
  const [items, setItems] = useState<PackingItem[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [showPresets, setShowPresets] = useState(false)

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from('packing_items').select('*').eq('trip_id', tripId).order('created_at')
    setItems((data as PackingItem[]) ?? [])
  }, [tripId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const addItem = async (label: string) => {
    if (!user || !label.trim()) return
    const { data } = await supabase.from('packing_items').insert({
      trip_id: tripId, user_id: user.id, label: label.trim(), checked: false,
    }).select().single()
    if (data) setItems(prev => [...prev, data as PackingItem])
    setNewLabel('')
  }

  const toggleItem = async (item: PackingItem) => {
    await supabase.from('packing_items').update({ checked: !item.checked }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i))
  }

  const deleteItem = async (id: string) => {
    await supabase.from('packing_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const checkedCount = items.filter(i => i.checked).length

  return (
    <div className="mx-4 mb-6 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package2 className="w-4 h-4 text-white/40" />
          <span className="text-sm font-semibold text-white">Packing List</span>
          {items.length > 0 && (
            <span className="text-[11px] text-white/30 tabular-nums">{checkedCount}/{items.length}</span>
          )}
        </div>
        <button
          onClick={() => setShowPresets(s => !s)}
          className="text-[11px] text-[#B2D5E5] hover:text-blue-300 transition-colors"
        >
          {showPresets ? 'Hide templates' : '+ Templates'}
        </button>
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="h-0.5 bg-white/[0.06] rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-[#B2D5E5] rounded-full transition-all duration-500"
            style={{ width: `${(checkedCount / items.length) * 100}%` }}
          />
        </div>
      )}

      {/* Preset templates */}
      {showPresets && (
        <div className="mb-4 p-3 rounded-xl bg-black/20 space-y-3">
          {Object.entries(PRESETS).map(([cat, presetItems]) => (
            <div key={cat}>
              <p className="text-[10px] font-semibold text-white/35 mb-1.5 uppercase tracking-wide">{cat}</p>
              <div className="flex flex-wrap gap-1.5">
                {presetItems.map(label => {
                  const exists = items.some(i => i.label === label)
                  return (
                    <button
                      key={label}
                      disabled={exists}
                      onClick={() => addItem(label)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition-all active:scale-95 ${
                        exists
                          ? 'bg-white/[0.03] text-white/20 cursor-default'
                          : 'bg-white/[0.06] text-white/55 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {exists ? '✓ ' : ''}{label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Items list */}
      <div className="space-y-1.5 mb-3">
        {items.length === 0 && (
          <p className="text-xs text-white/20 py-2">No items yet. Add from templates or type below.</p>
        )}
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2.5 group py-0.5">
            <button
              onClick={() => toggleItem(item)}
              className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border transition-all ${
                item.checked
                  ? 'bg-[#B2D5E5] border-[#B2D5E5]'
                  : 'border-white/15 hover:border-white/30'
              }`}
            >
              {item.checked && <Check className="w-3 h-3 text-white" />}
            </button>
            <span className={`flex-1 text-sm transition-colors ${item.checked ? 'line-through text-white/25' : 'text-white/70'}`}>
              {item.label}
            </span>
            <button
              onClick={() => deleteItem(item.id)}
              className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-white/20 hover:text-white/50 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add input */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors"
          placeholder="Add item…"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { addItem(newLabel) } }}
        />
        <button
          onClick={() => addItem(newLabel)}
          disabled={!newLabel.trim()}
          className="px-3 py-2 rounded-xl bg-white/[0.05] text-white/50 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
