'use client'

import { useState, useEffect } from 'react'
import { milkEntryService } from '@/services/milk-entry'
import { customerService } from '@/services/customer'
import { rateService } from '@/services/rate'
import type { MilkEntry, Customer } from '@/types'

interface EntryWithCustomer extends MilkEntry {
  customer?: { name: string }
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<EntryWithCustomer[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)

  // Form state
  const [formCustomer, setFormCustomer] = useState('')
  const [formShift, setFormShift] = useState<'morning' | 'evening'>('morning')
  const [formFat, setFormFat] = useState('')
  const [formSnf, setFormSnf] = useState('')
  const [formLiters, setFormLiters] = useState('')
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [previewAmount, setPreviewAmount] = useState<number | null>(null)

  const loadEntries = async () => {
    setLoading(true)
    try {
      const data = await milkEntryService.listByDate(selectedDate)
      setEntries(data)
    } catch (err) {
      console.error('Failed to load entries:', err)
    }
    setLoading(false)
  }

  const loadCustomers = async () => {
    try {
      const data = await customerService.list()
      setCustomers(data)
    } catch (err) {
      console.error('Failed to load customers:', err)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    loadEntries()
  }, [selectedDate])


  // Calculate preview amount when FAT/SNF/Liters change
  useEffect(() => {
    const calculatePreview = async () => {
      const fat = parseFloat(formFat)
      const snf = parseFloat(formSnf)
      const liters = parseFloat(formLiters)

      if (!isNaN(fat) && !isNaN(snf) && !isNaN(liters) && liters > 0) {
        const amount = await rateService.calculateAmount(fat, snf, liters)
        setPreviewAmount(amount)
      } else {
        setPreviewAmount(null)
      }
    }
    calculatePreview()
  }, [formFat, formSnf, formLiters])

  const resetForm = () => {
    setFormCustomer('')
    setFormShift('morning')
    setFormFat('')
    setFormSnf('')
    setFormLiters('')
    setFormError('')
    setPreviewAmount(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const fat = parseFloat(formFat)
    const snf = parseFloat(formSnf)
    const liters = parseFloat(formLiters)

    // Validation
    if (!formCustomer) {
      setFormError('Please select a customer')
      return
    }
    if (isNaN(fat) || fat < 0 || fat > 15) {
      setFormError('FAT must be between 0 and 15')
      return
    }
    if (isNaN(snf) || snf < 0 || snf > 15) {
      setFormError('SNF must be between 0 and 15')
      return
    }
    if (isNaN(liters) || liters <= 0) {
      setFormError('Liters must be greater than 0')
      return
    }

    setFormLoading(true)
    try {
      await milkEntryService.create({
        customer_id: formCustomer,
        date: selectedDate,
        shift: formShift,
        fat,
        snf,
        liters,
      })
      resetForm()
      loadEntries()
      // Show ghost animation
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save entry')
    }
    setFormLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    try {
      await milkEntryService.delete(id)
      loadEntries()
    } catch (err) {
      console.error('Failed to delete entry:', err)
    }
  }

  const totalLiters = entries.reduce((sum, e) => sum + Number(e.liters), 0)
  const totalAmount = entries.reduce((sum, e) => sum + Number(e.amount), 0)


  return (
    <div className="p-6 relative">
      {/* Ghost Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="text-8xl animate-bounce">👻</div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-white mb-6">👻 Ghostly Measurements</h1>

      {/* Date Selector */}
      <div className="mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Entry Form */}
      <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">Add Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-3 py-2 rounded text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">Customer</label>
              <select
                value={formCustomer}
                onChange={(e) => setFormCustomer(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Shift</label>
              <select
                value={formShift}
                onChange={(e) => setFormShift(e.target.value as 'morning' | 'evening')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">FAT %</label>
              <input
                type="number"
                step="0.1"
                value={formFat}
                onChange={(e) => setFormFat(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="3.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">SNF %</label>
              <input
                type="number"
                step="0.1"
                value={formSnf}
                onChange={(e) => setFormSnf(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="8.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Liters</label>
              <input
                type="number"
                step="0.1"
                value={formLiters}
                onChange={(e) => setFormLiters(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="10.5"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={formLoading}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {formLoading ? '...' : 'Add'}
              </button>
            </div>
          </div>
          {previewAmount !== null && (
            <div className="text-green-400 text-sm">
              Estimated Amount: ₹{previewAmount.toFixed(2)}
            </div>
          )}
        </form>
      </div>


      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Entries</div>
          <div className="text-2xl font-bold text-white">{entries.length}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Total Liters</div>
          <div className="text-2xl font-bold text-white">{totalLiters.toFixed(1)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Total Amount</div>
          <div className="text-2xl font-bold text-green-400">₹{totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Entries Table */}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-gray-400">No entries for this date.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-gray-400 font-medium">Customer</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Shift</th>
                <th className="py-3 px-4 text-gray-400 font-medium">FAT %</th>
                <th className="py-3 px-4 text-gray-400 font-medium">SNF %</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Liters</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Amount</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3 px-4 text-white">{entry.customer?.name || 'Unknown'}</td>
                  <td className="py-3 px-4 text-gray-300">
                    <span className={`px-2 py-1 rounded text-xs ${entry.shift === 'morning' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-blue-900/50 text-blue-300'}`}>
                      {entry.shift === 'morning' ? '🌅 Morning' : '🌙 Evening'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{Number(entry.fat).toFixed(1)}</td>
                  <td className="py-3 px-4 text-gray-300">{Number(entry.snf).toFixed(1)}</td>
                  <td className="py-3 px-4 text-gray-300">{Number(entry.liters).toFixed(1)}</td>
                  <td className="py-3 px-4 text-green-400">₹{Number(entry.amount).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
