import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Briefcase, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const sidebarLinks = [
  { href: "/admin", icon: Shield, label: "Dashboard", exact: true },
  { href: "/admin/users", icon: Users, label: "Usuarios" },
  { href: "/admin/jobs", icon: Briefcase, label: "Trabajos" },
];

export default function Admin() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        toast.error("No tienes permisos de administrador");
        navigate("/dashboard");
      } else {
        setChecking(false);
      }
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading || checking) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) return null;

  const isActive = (href: string, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
        <div className="container py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-accent">
                <Shield className="h-5 w-5 text-accent-foreground" />
              </div>
              <h1 className="font-display text-2xl font-bold">Panel de Administrador</h1>
            </div>
            <p className="text-muted-foreground">Gestiona usuarios, trabajos y configuración del sistema</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <Card className="p-4 sticky top-24">
                <nav className="space-y-1">
                  {sidebarLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3",
                        isActive(link.href, link.exact) && "bg-accent/20 text-accent"
                      )}
                      asChild
                    >
                      <Link to={link.href}>
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    </Button>
                  ))}
                </nav>
              </Card>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}
