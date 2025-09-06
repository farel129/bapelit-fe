import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import UnauthorizedPage from './components/UnauthorizedPage'; // Import halaman unauthorized
import KepalaLayout from './components/Layout/KepalaLayout';
import KepalaDashboard from './pages/kepala/KepalaDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './components/Layout/AdminLayout';
import AdminBuatSurat from './pages/admin/AdminBuatSurat';
import AdminDaftarUser from './pages/admin/AdminDaftarUser';
import AdminTambahUser from './pages/admin/AdminTambahUser';
import AdminSuratMasuk from './pages/admin/AdminSuratMasuk';
import SekretarisDashboard from './pages/sekretaris/SekretarisDashboard';
import KabidDashboard from './pages/kabid/KabidDashboard';
import SekretarisLayout from './components/Layout/SekretarisLayout';
import KabidLayout from './components/Layout/KabidLayout';
import KabidDisposisiDetail from './pages/kabid/KabidDisposisiDetail';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffLayout from './components/Layout/StaffLayout';
import StaffDisposisiDetail from './pages/staff/StaffDisposisiDetail';
import KepalaDisposisiDetail from './pages/kepala/KepalaDisposisiDetail';
import AdminSuratKeluar from './pages/admin/AdminSuratKeluar';
import ScrollToTop from './utils/scrollToTop';
import DaftarUser from './components/common/DaftarUser';
import SekretarisDisposisiDetail from './pages/sekretaris/SekretarisDisposisiDetail';
import Leaderboard from './components/common/Leaderboard';
import LandingPage from './pages/LandingPage';
import HomePage from './components/common/HomePage';
import AdminJadwalAcara from './pages/admin/AdminJadwalAcara';
import FeedPage from './components/common/FeedPage';
import DocumentationPage from './components/common/DocumentationPage';
import AdminBukuTamu from './pages/admin/AdminBukuTamu';
import PublikBukuTamu from './pages/public/PublicBukuTamu';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className='h-screen flex justify-center items-center'>...</div>;

  if (!user) return <Navigate to="/" />;

  // Jika role diperlukan dan user tidak memiliki role yang sesuai
  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/guest/:qrToken" element={<PublikBukuTamu />} />


        {/* Halaman Unauthorized */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ----------------------KEPALA----------------------- */}
        <Route path="/kepala" element={
          <PrivateRoute role="kepala">
            <KepalaLayout>
              <KepalaDashboard />
            </KepalaLayout>
          </PrivateRoute>
        } />
        <Route path="/kepala/disposisi/:id" element={
          <PrivateRoute role="kepala">
            <KepalaLayout>
              <KepalaDisposisiDetail />
            </KepalaLayout>
          </PrivateRoute>
        } />
        <Route path="/kepala/daftar-user" element={
          <PrivateRoute role='kepala'>
            <KepalaLayout>
              <DaftarUser />
            </KepalaLayout>
          </PrivateRoute>
        } />
        <Route path="/kepala/leaderboard" element={
          <PrivateRoute role='kepala'>
            <KepalaLayout>
              <Leaderboard />
            </KepalaLayout>
          </PrivateRoute>
        } />

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
        <Route path="/admin-surat-keluar" element={
          <PrivateRoute role="admin">
            <AdminLayout>
              <AdminSuratKeluar />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/leaderboard" element={
          <PrivateRoute role='admin'>
            <AdminLayout>
              <Leaderboard />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin-jadwal-acara" element={
          <PrivateRoute role='admin'>
            <AdminLayout>
              <AdminJadwalAcara />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin-feed" element={
          <PrivateRoute role='admin'>
            <AdminLayout>
              <FeedPage />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin-profile" element={
          <PrivateRoute role='admin'>
            <AdminLayout>
              <DocumentationPage />
            </AdminLayout>
          </PrivateRoute>
        } />
        <Route path="/admin-buku-tamu" element={
          <PrivateRoute role='admin'>
            <AdminLayout>
              <AdminBukuTamu />
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
        <Route path="/sekretaris/disposisi/detail/:id" element={
          <PrivateRoute role='sekretaris'>
            <SekretarisLayout>
              <SekretarisDisposisiDetail />
            </SekretarisLayout>
          </PrivateRoute>
        } />
        <Route path="/sekretaris/daftar-user" element={
          <PrivateRoute role='sekretaris'>
            <SekretarisLayout>
              <DaftarUser />
            </SekretarisLayout>
          </PrivateRoute>
        } />
        <Route path="/sekretaris/leaderboard" element={
          <PrivateRoute role='sekretaris'>
            <SekretarisLayout>
              <Leaderboard />
            </SekretarisLayout>
          </PrivateRoute>
        } />
        {/* ----------------------KABID----------------------- */}
        <Route path="/kabid" element={
          <PrivateRoute role='user'>
            <KabidLayout>
              <KabidDashboard />
            </KabidLayout>
          </PrivateRoute>
        } />
        <Route path="/kabid/disposisi/detail/:id" element={
          <PrivateRoute role='user'>
            <KabidLayout>
              <KabidDisposisiDetail />
            </KabidLayout>
          </PrivateRoute>
        } />
        <Route path="/kabid/daftar-user" element={
          <PrivateRoute role='user'>
            <KabidLayout>
              <DaftarUser />
            </KabidLayout>
          </PrivateRoute>
        } />
        <Route path="/kabid/leaderboard" element={
          <PrivateRoute role='user'>
            <KabidLayout>
              <Leaderboard />
            </KabidLayout>
          </PrivateRoute>
        } />

        <Route path="/kabid-profile" element={
          <PrivateRoute role='user'>
            <KabidLayout>
              <DocumentationPage />
            </KabidLayout>
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
        <Route path="/staff/disposisi/:id" element={
          <PrivateRoute role='staff'>
            <StaffLayout>
              <StaffDisposisiDetail />
            </StaffLayout>
          </PrivateRoute>
        } />
        <Route path="/staff/daftar-user" element={
          <PrivateRoute role='staff'>
            <StaffLayout>
              <DaftarUser />
            </StaffLayout>
          </PrivateRoute>
        } />
        <Route path="/staff/leaderboard" element={
          <PrivateRoute role='staff'>
            <StaffLayout>
              <Leaderboard />
            </StaffLayout>
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;