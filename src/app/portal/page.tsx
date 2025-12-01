'use client'

import { useState, useEffect } from 'react'
import { portalService } from '@/services/portal'
import type { MilkEntry, DateRangeSummary } from '@/types'

export default function PortalPage() {
  const [entries, setEntries] = useState<MilkEntry[]>([])
  const [summary, setSummary] = useState<DateRangeSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [entriesData, summaryData] = await Promise.all([
          portalService.getMonthlyEntries(year, month),
          portalService.getMonthlySummary(year, month),
        ])
        setEntries(entriesData)
        setSummary(summaryData)
      } catch (err) {
        console.error('Failed to load portal data:', err)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return <div className="text-gray-400">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Milk Entries</h1>

      {/* Monthly Summary */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">This Month&apos;s Entries</div>
            <div className="text-2xl font-bold text-white">{summary.entry_count}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">Total Liters</div>
            <div className="text-2xl font-bold text-white">{summary.total_liters.toFixed(1)}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">Total Amount</div>
            <div className="text-2xl font-bold text-green-400">₹{summary.total_amount.toFixed(2)}</div>
          </div>
        </div>
      )}


      {/* Entries Table */}
      {entries.length === 0 ? (
        <div className="text-gray-400">No entries this month.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-gray-400 font-medium">Date</th>
                <th className="py-3 px-4 text-gray-400 font-medium">FAT %</th>
                <th className="py-3 px-4 text-gray-400 font-medium">SNF %</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Liters</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3 px-4 text-white">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{Number(entry.fat).toFixed(1)}</td>
                  <td className="py-3 px-4 text-gray-300">{Number(entry.snf).toFixed(1)}</td>
                  <td className="py-3 px-4 text-gray-300">{Number(entry.liters).toFixed(1)}</td>
                  <td className="py-3 px-4 text-green-400">₹{Number(entry.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
