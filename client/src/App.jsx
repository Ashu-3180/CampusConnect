import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Home from "./pages/Home";
import Collaborations from "./pages/Collaborations";
import CreateCollaboration from "./pages/CreateCollaboration";
import CollaborationDetails from "./pages/CollaborationDetails";
import Events from "./pages/Events";
import Discover from "./pages/Discover";
import SearchPage from "./pages/SearchPage";
import Network from "./pages/Network";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PostDetails from "./pages/PostDetails";

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
          path="/app/collaborations"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Collaborations />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/collaborations/create"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CreateCollaboration />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/collaborations/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CollaborationDetails />
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
          path="/app/search"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SearchPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/network"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Network />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/messages"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Messages />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/messages/:userId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Chat />
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
          path="/app/profile/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <UserProfile />
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
        <Route
          path="/app/posts/:postId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PostDetails />
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

