import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Home from "./pages/Home";
import Collaborations from "./pages/Collaborations";
import Events from "./pages/Events";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Application Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Home />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/collaborate"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Collaborations />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/events"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Events />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/discover"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Discover />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;