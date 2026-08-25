import React, { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { Button, Badge } from '../../components/ui/Components';

const Catalog = () => {
  const { data: catalog, loading, refetch } = useFetch('/catalog');
  const [formData, setFormData] = useState({ vertical: 'claim', mainCategory: '', subCategory: '', bundleName: '', price: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/catalog', formData);
      refetch();
      setFormData({ vertical: 'claim', mainCategory: '', subCategory: '', bundleName: '', price: 0 });
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  if (loading) return <div>Loading catalog...</div>;

  return (
    <div className="space-y-6 animate-fade-in" style={{ padding: '24px' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Service Catalog</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-6" style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Add Bundle</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Vertical</label>
              <select 
                className="block w-full rounded-md shadow-sm p-2 outline-none" 
                style={{ background: 'var(--accent-green, #22c55e)', color: '#ffffff', border: 'none' }}
                value={formData.vertical} 
                onChange={e => setFormData({...formData, vertical: e.target.value})}
              >
                <option value="claim">Claim Hub</option>
                <option value="service">Service Hub</option>
                <option value="store">Store</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Main Category</label>
              <input 
                type="text" required 
                className="block w-full rounded-md shadow-sm p-2 outline-none" 
                style={{ background: 'var(--accent-green, #22c55e)', color: '#ffffff', border: 'none' }}
                value={formData.mainCategory} 
                onChange={e => setFormData({...formData, mainCategory: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Sub Category</label>
              <input 
                type="text" required 
                className="block w-full rounded-md shadow-sm p-2 outline-none" 
                style={{ background: 'var(--accent-green, #22c55e)', color: '#ffffff', border: 'none' }}
                value={formData.subCategory} 
                onChange={e => setFormData({...formData, subCategory: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Bundle Name</label>
              <input 
                type="text" required 
                className="block w-full rounded-md shadow-sm p-2 outline-none" 
                style={{ background: 'var(--accent-green, #22c55e)', color: '#ffffff', border: 'none' }}
                value={formData.bundleName} 
                onChange={e => setFormData({...formData, bundleName: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Price</label>
              <input 
                type="number" required 
                className="block w-full rounded-md shadow-sm p-2 outline-none" 
                style={{ background: 'var(--accent-green, #22c55e)', color: '#ffffff', border: 'none' }}
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
              />
            </div>
            <Button type="submit" className="w-full mt-4" style={{ background: 'var(--accent-green, #22c55e)', color: '#ffffff', border: 'none' }}>
              Save Bundle
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 p-0 overflow-x-auto" style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <table className="w-full text-left text-sm border-collapse">
            <thead className="uppercase" style={{ background: 'var(--accent-green, #22c55e)', color: '#ffffff' }}>
              <tr>
                <th className="px-6 py-4 font-bold text-xs tracking-wider">Vertical</th>
                <th className="px-6 py-4 font-bold text-xs tracking-wider">Category / Sub</th>
                <th className="px-6 py-4 font-bold text-xs tracking-wider">Bundle</th>
                <th className="px-6 py-4 font-bold text-xs tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800" style={{ borderColor: 'var(--border)' }}>
              {catalog?.map(item => (
                <tr key={item._id} style={{ transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-6 py-4 uppercase font-semibold text-xs" style={{ color: 'var(--text)' }}><Badge status={item.vertical} /></td>
                  <td className="px-6 py-4" style={{ color: 'var(--text)' }}>{item.mainCategory} <span style={{ color: 'var(--text-muted)' }}>&rarr;</span> {item.subCategory}</td>
                  <td className="px-6 py-4 font-medium" style={{ color: 'var(--text)' }}>{item.bundleName}</td>
                  <td className="px-6 py-4" style={{ color: 'var(--text)' }}>₹{item.price}</td>
                </tr>
              ))}
              {(!catalog || catalog.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center" style={{ color: 'var(--text-muted)' }}>No catalog items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Catalog;

// In patner portal in My Client add there the option to add nnew client 