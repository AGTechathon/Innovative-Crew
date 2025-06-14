
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppSidebar } from "./components/Layout/Sidebar";
import { LoginForm } from "./components/Auth/LoginForm";
import { SignUpForm } from "./components/Auth/SignUpForm";
import { DataSeeder } from "./components/DataSeeder";
import { Dashboard } from "./pages/Dashboard";
import { WorkOrders } from "./pages/WorkOrders";
import { Inventory } from "./pages/Inventory";
import { Workers } from "./pages/Workers";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        {authMode === 'login' ? <LoginForm /> : <SignUpForm />}
        <div className="fixed bottom-4 right-4">
          <Button
            variant="outline"
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
          >
            {authMode === 'login' ? 'Create Account' : 'Back to Sign In'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DataSeeder />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="border-b border-border/40 p-4">
            <SidebarTrigger />
          </div>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/workers" element={<Workers />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
