import { createContext, useContext, useState, useCallback, useMemo } from 'react';

// Lets each admin page publish its own title/record-count for the AdminLayout
// header (e.g. "Orders" / "28 orders found") without duplicating page headers.
const AdminPageContext = createContext(null);

export const AdminPageProvider = ({ initialTitle = 'Admin', children }) => {
  const [page, setPage] = useState({ title: initialTitle, subtitle: '' });

  const setAdminPage = useCallback((title, subtitle = '') => {
    setPage({ title, subtitle });
  }, []);

  const value = useMemo(() => ({ page, setAdminPage }), [page]);

  return <AdminPageContext.Provider value={value}>{children}</AdminPageContext.Provider>;
};

// Returns null when rendered outside AdminLayout so pages can degrade safely.
export const useAdminPage = () => useContext(AdminPageContext);
