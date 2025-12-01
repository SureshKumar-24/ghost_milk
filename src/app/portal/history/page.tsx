'use client'

import { useState, useEffect } from 'react'
import { portalService } from '@/services/portal'
import type { DateRangeSummary } from '@/types'

export default function HistoryPage() {
  const [summaries, setSummaries] = useState<DateRangeSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await portalService.getHistoricalSummaries(6)
        setSummaries(data)
      } catch (err) {
        console.error('Failed to load history:', err)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return <div className="text-gray-400">Loading...</div>
  }

  const totalLiters = summaries.reduce((sum, s) => sum + s.total_liters, 0)
  const totalAmount = summaries.reduce((sum, s) => sum + s.total_amount, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Historical Summary</h1>

      {/* Overall Totals */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">6-Month Total Liters</div>
          <div className="text-2xl font-bold text-white">{totalLiters.toFixed(1)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">6-Month Total Amount</div>
          <div className="text-2xl font-bold text-green-400">₹{totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Breakdown</h3>
        <div className="space-y-2">
          {summaries.map((summary) => {
            const date = new Date(summary.start_date)
            const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            return (
              <div key={summary.start_date} className="flex justify-between items-center py-3 border-b border-gray-700">
                <span className="text-white font-medium">{monthName}</span>
                <div className="flex gap-6">
                  <span className="text-gray-400">{summary.entry_count} entries</span>
                  <span className="text-white">{summary.total_liters.toFixed(1)} L</span>
                  <span className="text-green-400">₹{summary.total_amount.toFixed(2)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
