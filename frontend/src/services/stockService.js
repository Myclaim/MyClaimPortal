import api from './api';

export const searchCompanies = async (query) => {
  if (!query || query.length < 2) return [];
  try {
    const { data } = await api.get(`/companies/search?q=${encodeURIComponent(query)}&limit=10`);
    return data.companies || [];
  } catch (error) {
    console.error('Error searching companies:', error);
    return [];
  }
};
