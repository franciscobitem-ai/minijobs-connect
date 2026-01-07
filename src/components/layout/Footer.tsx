import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                Mini<span className="text-primary">Jobs</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Conectamos personas que necesitan trabajos puntuales con profesionales dispuestos a ayudar.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Para trabajadores</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/jobs" className="hover:text-foreground transition-colors">Buscar trabajos</Link></li>
              <li><Link to="/auth?mode=signup" className="hover:text-foreground transition-colors">Crear cuenta</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Mi panel</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Para clientes</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/jobs/create" className="hover:text-foreground transition-colors">Publicar trabajo</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Gestionar trabajos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-foreground transition-colors">Términos de uso</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Privacidad</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MiniJobs. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
