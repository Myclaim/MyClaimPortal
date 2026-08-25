import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { Badge, Button } from '../../components/ui/Components';
import { ArrowLeft, Edit2, Calendar } from 'lucide-react';

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: claim, loading, error, refetch } = useFetch(`/claims/${id}`);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (claim) {
      setStatus(claim.status);
    }
  }, [claim]);

  if (loading) return <div>Loading claim details...</div>;
  if (error || !claim) return <div>Claim not found</div>;

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await api.put(`/claims/${id}`, { status });
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in text-gray-800">
      <button 
        onClick={() => navigate('/claims')} 
        className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Claims
      </button>

      <div className="card">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Claim #{claim._id.slice(-8)}</h2>
            <p className="text-gray-500 text-sm mt-1 flex items-center">
              <Calendar size={14} className="mr-1" />
              Created on {new Date(claim.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge status={claim.status} />
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-4">Claim Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Client Name</p>
                <p className="text-lg font-medium text-gray-900">{claim.clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Full Claim ID</p>
                <p className="text-base text-gray-900 font-mono text-sm">{claim._id}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-4">Manage Status</h3>
              <p className="text-sm text-gray-600 mb-3">Update the current status of this claim to reflect progress.</p>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleStatusUpdate} 
                disabled={status === claim.status || updating}
                className="w-full sm:w-auto"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetail;
