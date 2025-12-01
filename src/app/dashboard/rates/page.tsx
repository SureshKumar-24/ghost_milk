'use client'

import { useState, useEffect } from 'react'
import { rateService } from '@/services/rate'
import type { Rate } from '@/types'

export default function RatesPage() {
  const [rates, setRates] = useState<Rate[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form state
  const [formFat, setFormFat] = useState('')
  const [formSnf, setFormSnf] = useState('')
  const [formRate, setFormRate] = useState('')
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const loadRates = async () => {
    setLoading(true)
    try {
      const data = await rateService.listRates()
      setRates(data)
    } catch (err) {
      console.error('Failed to load rates:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadRates()
  }, [])

  const resetForm = () => {
    setFormFat('')
    setFormSnf('')
    setFormRate('')
    setFormError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const fat = parseFloat(formFat)
    const snf = parseFloat(formSnf)
    const rate = parseFloat(formRate)

    if (isNaN(fat) || fat < 0 || fat > 15) {
      setFormError('FAT must be between 0 and 15')
      return
    }
    if (isNaN(snf) || snf < 0 || snf > 15) {
      setFormError('SNF must be between 0 and 15')
      return
    }
    if (isNaN(rate) || rate <= 0) {
      setFormError('Rate must be greater than 0')
      return
    }


    setFormLoading(true)
    try {
      await rateService.setRate({ fat, snf, rate_per_liter: rate })
      setShowAddModal(false)
      resetForm()
      loadRates()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save rate')
    }
    setFormLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rate?')) return
    try {
      await rateService.deleteRate(id)
      loadRates()
    } catch (err) {
      console.error('Failed to delete rate:', err)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">🧪 Rate Cauldron</h1>
        <button
          onClick={() => { resetForm(); setShowAddModal(true) }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          + Add Rate
        </button>
      </div>

      {/* Rate Table */}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : rates.length === 0 ? (
        <div className="text-gray-400">No rates configured. Add your first rate!</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-gray-400 font-medium">FAT %</th>
                <th className="py-3 px-4 text-gray-400 font-medium">SNF %</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Rate/Liter</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3 px-4 text-white">{rate.fat.toFixed(1)}</td>
                  <td className="py-3 px-4 text-white">{rate.snf.toFixed(1)}</td>
                  <td className="py-3 px-4 text-green-400">₹{rate.rate_per_liter.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(rate.id)}
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


      {/* Add Rate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Add Rate</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 px-3 py-2 rounded text-sm">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">FAT %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="15"
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
                    min="0"
                    max="15"
                    value={formSnf}
                    onChange={(e) => setFormSnf(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="8.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rate per Liter (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formRate}
                  onChange={(e) => setFormRate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="45.00"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
