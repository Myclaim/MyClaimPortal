import React, { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { Badge, Button } from '../../components/ui/Components';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import api from '../../services/api';

const Claims = () => {
  const { data: claims, loading, refetch } = useFetch('/claims');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [creating, setCreating] = useState(false);

  if (loading) return <div>Loading claims...</div>;

  const filteredClaims = claims?.filter(claim => {
    const matchesSearch = claim.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || claim._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/claims', { clientName: newClientName });
      setShowModal(false);
      setNewClientName('');
      refetch();
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 card p-4">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search claims..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-64"
            />
          </div>
          <div className="relative cursor-pointer">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
        <Button onClick={() => setShowModal(true)}>+ New Claim</Button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">Claim ID</th>
                <th className="px-6 py-4 font-medium">Client Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date Created</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClaims?.length > 0 ? filteredClaims.map(claim => (
                <tr key={claim._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">#{claim._id.slice(-8)}</td>
                  <td className="px-6 py-4">{claim.clientName}</td>
                  <td className="px-6 py-4"><Badge status={claim.status} /></td>
                  <td className="px-6 py-4 text-gray-500">{new Date(claim.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/claims/${claim._id}`} className="text-brand-600 hover:text-brand-800 font-medium px-3 py-1 bg-brand-50 rounded-md hover:bg-brand-100 transition-colors">
                      View
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No claims found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Create New Claim</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input 
                  type="text" 
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Claims;
