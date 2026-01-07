import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Briefcase, LayoutDashboard, Shield, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Mini<span className="text-primary">Jobs</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/jobs" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Buscar trabajos
          </Link>
          {user && (
            <Link 
              to="/jobs/create" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Publicar trabajo
            </Link>
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Mi cuenta
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Panel de control
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Mi perfil
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      Panel de administrador
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                Iniciar sesión
              </Button>
              <Button variant="hero" size="sm" onClick={() => navigate("/auth?mode=signup")}>
                Registrarse
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-4 space-y-3">
            <Link 
              to="/jobs" 
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Buscar trabajos
            </Link>
            {user && (
              <>
                <Link 
                  to="/jobs/create" 
                  className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Publicar trabajo
                </Link>
                <Link 
                  to="/dashboard" 
                  className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Panel de control
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Panel de administrador
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive"
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </Button>
              </>
            )}
            {!user && (
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}
                >
                  Iniciar sesión
                </Button>
                <Button 
                  variant="hero" 
                  className="flex-1"
                  onClick={() => { navigate("/auth?mode=signup"); setMobileMenuOpen(false); }}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
