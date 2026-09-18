import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { EventProvider } from "./context/EventContext.jsx";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import Layout from "./components/shared/Layout";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Contributions = lazy(() => import("./pages/Contributions"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Categories = lazy(() => import("./pages/Categories"));
const PendingContributions = lazy(() => import("./pages/PendingContributions"));
const More = lazy(() => import("./pages/More"));
const Settings = lazy(() => import("./pages/Settings"));

const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 p-6 text-gray-500">Loading...</div>
);

const withLayout = (Component) => (
  <ProtectedRoute>
    <Layout>
      <Component />
    </Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={withLayout(Dashboard)} />
              <Route
                path="/contributions"
                element={withLayout(Contributions)}
              />
              <Route path="/expenses" element={withLayout(Expenses)} />
              <Route path="/categories" element={withLayout(Categories)} />
              <Route
                path="/pending"
                element={withLayout(PendingContributions)}
              />
              <Route path="/more" element={withLayout(More)} />
              <Route path="/settings" element={withLayout(Settings)} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;
