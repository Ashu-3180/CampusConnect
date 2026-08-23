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
            <AppLayout>
              <Home />
            </AppLayout>
          }
        />

        <Route
          path="/app/collaborate"
          element={
            <AppLayout>
              <Collaborations />
            </AppLayout>
          }
        />

        <Route
          path="/app/events"
          element={
            <AppLayout>
              <Events />
            </AppLayout>
          }
        />

        <Route
          path="/app/discover"
          element={
            <AppLayout>
              <Discover />
            </AppLayout>
          }
        />

        <Route
          path="/app/profile"
          element={
            <AppLayout>
              <Profile />
            </AppLayout>
          }
        />

        <Route
          path="/app/settings"
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;