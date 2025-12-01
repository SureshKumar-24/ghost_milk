'use client'

import { useState, useEffect } from 'react'
import { customerService } from '@/services/customer'
import type { Customer } from '@/types'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const data = await customerService.list({ search: search || undefined })
      setCustomers(data)
    } catch (err) {
      console.error('Failed to load customers:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadCustomers()
  }, [search])

  const resetForm = () => {
    setFormName('')
    setFormPhone('')
    setFormAddress('')
    setFormError('')
  }

  const openAddModal = () => {
    resetForm()
    setEditingCustomer(null)
    setShowAddModal(true)
  }

  const openEditModal = (customer: Customer) => {
    setFormName(customer.name)
    setFormPhone(customer.phone || '')
    setFormAddress(customer.address || '')
    setFormError('')
    setEditingCustomer(customer)
    setShowAddModal(true)
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!formName.trim()) {
      setFormError('Name is required')
      return
    }

    setFormLoading(true)
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id, {
          name: formName,
          phone: formPhone || undefined,
          address: formAddress || undefined,
        })
      } else {
        await customerService.create({
          name: formName,
          phone: formPhone || undefined,
          address: formAddress || undefined,
        })
      }
      setShowAddModal(false)
      loadCustomers()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save customer')
    }
    setFormLoading(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await customerService.delete(id)
      setDeleteConfirm(null)
      loadCustomers()
    } catch (err) {
      console.error('Failed to delete customer:', err)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">👻 Spirit Registry</h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          + Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Customer Table */}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : customers.length === 0 ? (
        <div className="text-gray-400">No customers found. Add your first customer!</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-gray-400 font-medium">Name</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Phone</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Address</th>
                <th className="py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3 px-4 text-white">{customer.name}</td>
                  <td className="py-3 px-4 text-gray-300">{customer.phone || '-'}</td>
                  <td className="py-3 px-4 text-gray-300">{customer.address || '-'}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => openEditModal(customer)}
                      className="text-purple-400 hover:text-purple-300 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(customer.id)}
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


      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 px-3 py-2 rounded text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-sm border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Delete Customer?</h2>
            <p className="text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
