import { useEffect } from 'react';

import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import ParentTabs from './ParentTabs';
import EducatorTabs from './EducatorTabs';

export default function RoleSwitch() {
  const { user, logout } = useAuth();
  const role = user?.role;

  useEffect(() => {
    if (role && role !== 'PARENT' && role !== 'EDUCATEUR') {
      logout();
    }
  }, [logout, role]);

  if (role === 'PARENT') {
    return <ParentTabs />;
  }

  if (role === 'EDUCATEUR') {
    return <EducatorTabs />;
  }

  return <Loader />;
}
