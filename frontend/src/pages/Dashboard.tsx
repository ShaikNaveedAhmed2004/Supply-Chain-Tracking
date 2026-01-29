import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, LogOut, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import SupplierDashboard from "@/components/dashboards/SupplierDashboard";
import ManufacturerDashboard from "@/components/dashboards/ManufacturerDashboard";
import DistributorDashboard from "@/components/dashboards/DistributorDashboard";
import RetailerDashboard from "@/components/dashboards/RetailerDashboard";
import ConsumerDashboard from "@/components/dashboards/ConsumerDashboard";
import { NotificationBell } from "@/components/NotificationBell";

interface UserData {
  email: string;
  role: string;
  id: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      navigate("/login");
      return;
    }
    
    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
    } catch (error) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return null;

  const renderDashboard = () => {
    if (!user) return null;
    
    const role = user.role.toUpperCase();
    
    switch (role) {
      case "ADMIN":
        return <AdminDashboard />;
      case "SUPPLIER":
        return <SupplierDashboard />;
      case "MANUFACTURER":
        return <ManufacturerDashboard />;
      case "DISTRIBUTOR":
        return <DistributorDashboard />;
      case "RETAILER":
        return <RetailerDashboard />;
      case "CONSUMER":
        return <ConsumerDashboard />;
      default:
        return <div className="text-center py-8">Invalid role: {user.role}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Supply Chain Tracker</h1>
                <p className="text-sm text-muted-foreground">
                  {user?.role} Dashboard
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{user?.email}</span>
                <Badge variant="outline">{user?.role}</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
                <User className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Dashboard;
