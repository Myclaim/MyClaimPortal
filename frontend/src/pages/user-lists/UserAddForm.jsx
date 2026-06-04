import React from 'react';
import { useLocation } from 'react-router-dom';
import SuperPartnerForm from './SuperPartnerForm';
import ClientForm from './ClientForm';
import AdminForm from './AdminForm';
import PartnerForm from './PartnerForm';
import EmployeeForm from './EmployeeForm';

const UserAddForm = () => {
  const { search: searchParams } = useLocation();
  const role = new URLSearchParams(searchParams).get('role') || 'partner';

  if (role === 'super_partner') return <SuperPartnerForm />;
  if (role === 'partner') return <PartnerForm defaultRole={role} />;
  if (role === 'employee') return <EmployeeForm defaultRole={role} />;
  if (role === 'client') return <ClientForm />;

  // Admin / Super Admin → standard form
  return <AdminForm role={role} />;
};

export default UserAddForm;
