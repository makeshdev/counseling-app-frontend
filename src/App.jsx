import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Counselors from "./pages/Counselors";
import CounselorProfile from "./pages/CounselorProfile";
import Appointments from "./pages/Appointments";
import SessionNotes from "./pages/SessionNotes";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import VideoCall from "./pages/VideoCall";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/counselors"
                element={
                  <PrivateRoute>
                    <Counselors />
                  </PrivateRoute>
                }
              />
              <Route
                path="/counselors/:id"
                element={
                  <PrivateRoute>
                    <CounselorProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <PrivateRoute>
                    <Appointments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/session-notes/:id"
                element={
                  <PrivateRoute>
                    <SessionNotes />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <PrivateRoute>
                    <Payments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/video-call/:id"
                element={
                  <PrivateRoute>
                    <VideoCall />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <footer className="bg-gray-800 text-white py-4">
            <div className="container mx-auto px-4 text-center">
              <p>
                © {new Date().getFullYear()} Online Counseling Platform. All
                rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
