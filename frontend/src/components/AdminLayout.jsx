import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      {/* Sidebar - Desktop Only */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
