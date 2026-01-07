import { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Briefcase, FileText, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/dashboard", icon: User, label: "Mi perfil", exact: true },
  { href: "/dashboard/jobs", icon: Briefcase, label: "Mis trabajos publicados" },
  { href: "/dashboard/applications", icon: FileText, label: "Mis postulaciones" },
  { href: "/dashboard/payments", icon: CreditCard, label: "Pagos y cobros" },
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const isActive = (href: string, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
        <div className="container py-8">
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
                        isActive(link.href, link.exact) && "bg-primary/10 text-primary"
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
