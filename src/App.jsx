import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import AdminBuatSurat from './admin/AdminBuatSurat';
import AdminDaftarUser from './admin/AdminDaftarUser';
import AdminTambahUser from './admin/AdminTambahUser';
import AdminSuratMasuk from './admin/AdminSuratMasuk';
import Dashboard from './pages/Dashboard';
import SemuaData from './pages/SemuaData';
import UsersList from './pages/UsersList';
import ProcessSurat from './pages/ProcessSurat';
import Notifications from './pages/Notifications';
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';
import HomePage from './pages/HomePage';
import StaffNotifications from './staff/StaffNotifications';
import StaffLayout from './components/StaffLayout';
import StaffDashboard from './staff/StaffDashboard';
import StaffProcessSurat from './staff/StaffProcessSurat';
import StaffUsersList from './staff/StaffUsersList';
import StaffSemuaData from './staff/StaffSemuaData';
import UnauthorizedPage from './components/UnauthorizedPage'; // Import halaman unauthorized
import SekretarisDashboard from './sekretaris/SekretarisDashboard';
import SekretarisNotifications from './sekretaris/SekretarisNotifications';
import SekretarisProcessSurat from './sekretaris/SekretarisProcessSurat';
import SekretarisSemuaData from './sekretaris/SekretarisSemuaData';
import SekretarisUsersList from './sekretaris/SekretarisUsersList';
import SekretarisLayout from './components/SekretarisLayout';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;
  
  // Jika role diperlukan dan user tidak memiliki role yang sesuai
  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<HomePage />} />
        
        {/* Halaman Unauthorized */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* ----------------------ADMIN----------------------- */}
        <Route path="/admin" element={
          <PrivateRoute role="admin">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin-surat-masuk" element={
          <PrivateRoute role="admin">
            <AdminLayout>
              <AdminBuatSurat />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin-daftar-user" element={
          <PrivateRoute role="admin">
            <AdminLayout>
              <AdminDaftarUser />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin-buat-akun" element={
          <PrivateRoute role="admin">
            <AdminLayout>
              <AdminTambahUser />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin-daftar-surat-masuk" element={
          <PrivateRoute role="admin">
            <AdminLayout>
              <AdminSuratMasuk />
            </AdminLayout>
          </PrivateRoute>
        } />

        {/* ----------------------SEKRETARIS----------------------- */}
        <Route path="/sekretaris" element={
          <PrivateRoute role='sekretaris'>
            <SekretarisLayout>
              <SekretarisDashboard />
            </SekretarisLayout>
          </PrivateRoute>
        } />
        <Route path="/sekretaris-notifications" element={
          <PrivateRoute role='sekretaris'>
            <SekretarisLayout>
              <SekretarisNotifications />
            </SekretarisLayout>
          </PrivateRoute>
        } />
        <Route path="/sekretaris-process/:id" element={
          <PrivateRoute role='sekretaris'>
            <SekretarisLayout>
              <SekretarisProcessSurat />
            </SekretarisLayout>
          </PrivateRoute>
        } />
        <Route path="/sekretaris-semua-data" element={
          <PrivateRoute role='sekretaris'>
            <SekretarisLayout>
              <SekretarisSemuaData />
            </SekretarisLayout>
          </PrivateRoute>
        } />
        <Route path="/sekretaris-list-user" element={
          <PrivateRoute role='sekretaris'>
            <SekretarisLayout>
              <SekretarisUsersList />
            </SekretarisLayout>
          </PrivateRoute>
        } />

        {/* ----------------------KABID----------------------- */}
        <Route path="/" element={
          <PrivateRoute role='user'>
            <UserLayout>
              <Dashboard />
            </UserLayout>
          </PrivateRoute>
        } />
        <Route path="/semua-data" element={
          <PrivateRoute role='user'>
            <UserLayout>
              <SemuaData />
            </UserLayout>
          </PrivateRoute>
        } />
        <Route path="/list-user" element={
          <PrivateRoute role='user'>
            <UserLayout>
              <UsersList />
            </UserLayout>
          </PrivateRoute>
        } />
        <Route path="/process/:id" element={
          <PrivateRoute role='user'>
            <UserLayout>
              <ProcessSurat />
            </UserLayout>
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute role='user'>
            <UserLayout>
              <Notifications />
            </UserLayout>
          </PrivateRoute>
        } />

        {/* ----------------------STAFF----------------------- */}
        <Route path="/staff" element={
          <PrivateRoute role='staff'>
            <StaffLayout>
              <StaffDashboard />
            </StaffLayout>
          </PrivateRoute>
        } />
        <Route path="/staff-notifications" element={
          <PrivateRoute role='staff'>
            <StaffLayout>
              <StaffNotifications />
            </StaffLayout>
          </PrivateRoute>
        } />
        <Route path="/staff-process/:id" element={
          <PrivateRoute role='staff'>
            <StaffLayout>
              <StaffProcessSurat />
            </StaffLayout>
          </PrivateRoute>
        } />
        <Route path="/staff-semua-data" element={
          <PrivateRoute role='staff'>
            <StaffLayout>
              <StaffSemuaData />
            </StaffLayout>
          </PrivateRoute>
        } />
        <Route path="/staff-list-user" element={
          <PrivateRoute role='staff'>
            <StaffLayout>
              <StaffUsersList />
            </StaffLayout>
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;