import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import CreateJob from "./pages/CreateJob";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/dashboard/Profile";
import MyJobs from "./pages/dashboard/MyJobs";
import MyApplications from "./pages/dashboard/MyApplications";
import Payments from "./pages/dashboard/Payments";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/jobs/create" element={<CreateJob />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Profile />} />
              <Route path="profile" element={<Profile />} />
              <Route path="jobs" element={<MyJobs />} />
              <Route path="applications" element={<MyApplications />} />
              <Route path="payments" element={<Payments />} />
            </Route>
            <Route path="/admin" element={<Admin />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="jobs" element={<AdminJobs />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
