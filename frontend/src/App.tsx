import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MapPage from "./pages/MapPage";
import AppLayout from "./components/AppLayout";
import HistoryPage from "./pages/HistoryPage";
import FriendsPage from "./pages/FriendsPage";
import GroupsPage from "./pages/GroupsPage";
import SharedWithMePage from "./pages/SharedWithMePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MapPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HistoryPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <AppLayout>
                <FriendsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <AppLayout>
                <GroupsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared-with-me"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SharedWithMePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/map" />} />
      </Routes>
    </BrowserRouter>
  );
}
