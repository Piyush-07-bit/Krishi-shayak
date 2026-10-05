import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import AnalyzePage from "./pages/AnalyzePage";
import WeatherPage from "./pages/WeatherPage";
import MarketPage from "./pages/MarketPage";
import SchemesPage from "./pages/SchemesPage";
import FarmDiaryPage from "./pages/FarmDiaryPage";
import CommunityPage from "./pages/CommunityPage";
import SettingsPage from "./pages/SettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MyQueriesPage from "./pages/MyQueriesPage";
import ChatRoomPage from "@/pages/ChatRoomPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="digital-krishi-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
            <Route path="/market" element={<ProtectedRoute><MarketPage /></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute><SchemesPage /></ProtectedRoute>} />
            <Route path="/diary" element={<ProtectedRoute><FarmDiaryPage /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/chat-room" element={<ProtectedRoute><ChatRoomPage /></ProtectedRoute>} />
            <Route path="/queries" element={<ProtectedRoute><MyQueriesPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
