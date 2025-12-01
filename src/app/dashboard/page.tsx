'use client'

import { useState, useEffect } from 'react'
import { summaryService } from '@/services/summary'
import type { DailySummary, WeeklySummary, DateRangeSummary } from '@/types'

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'custom'

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('daily')
  const [loading, setLoading] = useState(true)
  
  // Daily
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  
  // Weekly
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null)
  
  // Custom range
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [customSummary, setCustomSummary] = useState<DateRangeSummary | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const loadDailySummary = async () => {
    setLoading(true)
    try {
      const data = await summaryService.getDailySummary(today)
      setDailySummary(data)
    } catch (err) {
      console.error('Failed to load daily summary:', err)
    }
    setLoading(false)
  }

  const loadWeeklySummary = async () => {
    setLoading(true)
    try {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const data = await summaryService.getWeeklySummary(weekStart.toISOString().split('T')[0])
      setWeeklySummary(data)
    } catch (err) {
      console.error('Failed to load weekly summary:', err)
    }
    setLoading(false)
  }

  const loadCustomSummary = async () => {
    setLoading(true)
    try {
      const data = await summaryService.getDateRangeSummary(startDate, endDate)
      setCustomSummary(data)
    } catch (err) {
      console.error('Failed to load custom summary:', err)
    }
    setLoading(false)
  }


  useEffect(() => {
    if (viewMode === 'daily') loadDailySummary()
    else if (viewMode === 'weekly') loadWeeklySummary()
    else if (viewMode === 'custom') loadCustomSummary()
  }, [viewMode])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">🏚️ Haunted Overview</h1>

      {/* View Mode Tabs */}
      <div className="flex gap-2 mb-6">
        {(['daily', 'weekly', 'custom'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === mode
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      {viewMode === 'custom' && (
        <div className="flex gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          <button
            onClick={loadCustomSummary}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Apply
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Daily View */}
          {viewMode === 'daily' && dailySummary && (
            <div className="grid grid-cols-3 gap-6">
              <SummaryCard title="Today's Entries" value={dailySummary.entry_count} />
              <SummaryCard title="Total Liters" value={dailySummary.total_liters.toFixed(1)} />
              <SummaryCard title="Total Amount" value={`₹${dailySummary.total_amount.toFixed(2)}`} isAmount />
            </div>
          )}

          {/* Weekly View */}
          {viewMode === 'weekly' && weeklySummary && (
            <>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <SummaryCard title="Week Total Liters" value={weeklySummary.total_liters.toFixed(1)} />
                <SummaryCard title="Week Total Amount" value={`₹${weeklySummary.total_amount.toFixed(2)}`} isAmount />
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Daily Breakdown</h3>
                <div className="space-y-2">
                  {weeklySummary.daily_breakdown.map((day) => (
                    <div key={day.date} className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-300">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <div className="flex gap-6">
                        <span className="text-gray-400">{day.entry_count} entries</span>
                        <span className="text-white">{day.total_liters.toFixed(1)} L</span>
                        <span className="text-green-400">₹{day.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Custom View */}
          {viewMode === 'custom' && customSummary && (
            <div className="grid grid-cols-3 gap-6">
              <SummaryCard title="Total Entries" value={customSummary.entry_count} />
              <SummaryCard title="Total Liters" value={customSummary.total_liters.toFixed(1)} />
              <SummaryCard title="Total Amount" value={`₹${customSummary.total_amount.toFixed(2)}`} isAmount />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SummaryCard({ title, value, isAmount = false }: { title: string; value: string | number; isAmount?: boolean }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <div className="text-gray-400 text-sm mb-2">{title}</div>
      <div className={`text-3xl font-bold ${isAmount ? 'text-green-400' : 'text-white'}`}>{value}</div>
    </div>
  )
}
