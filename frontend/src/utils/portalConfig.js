/**
 * Utility to identify whether the current running instance is:
 * - 'client' (myclaimindia.com)
 * - 'management' (wealthearth.com)
 * 
 * Supports both:
 * 1. Build-time configuration via import.meta.env.VITE_PORTAL_TYPE ('client' | 'management')
 * 2. Runtime hostname detection for myclaimindia.com and wealthearth.com
 */

export const getPortalType = () => {
  // 1. Check environment variable if set during build
  const envType = import.meta.env.VITE_PORTAL_TYPE;
  if (envType === 'client' || envType === 'management') {
    return envType;
  }

  // 2. Dynamic hostname detection
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('myclaimindia') || hostname.includes('client')) {
    return 'client';
  }
  if (hostname.includes('wealthearth') || hostname.includes('wealtharth') || hostname.includes('admin') || hostname.includes('staff')) {
    return 'management';
  }

  // Default fallback (can be toggled in dev)
  return 'management';
};

export const isClientPortal = () => getPortalType() === 'client';
export const isManagementPortal = () => getPortalType() === 'management';

export const PORTAL_CONFIG = {
  client: {
    name: 'MyClaim India',
    tagline: 'Client Claims & Settlement Portal',
    domain: 'myclaimindia.com',
    allowedRoles: ['client'],
    primaryColor: '#0ea5e9', // Sky blue / Teal modern look
  },
  management: {
    name: 'WealthEarth',
    tagline: 'Enterprise Management & Partner Network',
    domain: 'wealthearth.com',
    allowedRoles: ['super_admin', 'admin', 'employee', 'super_partner', 'partner'],
    primaryColor: '#22c55e', // Emerald green
  }
};
