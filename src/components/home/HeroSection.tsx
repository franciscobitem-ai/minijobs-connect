import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Users, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background py-20 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl animate-pulse-slow" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Más de 1.000 trabajos publicados
          </div>
          
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Encuentra el{" "}
            <span className="text-gradient">trabajo perfecto</span>
            <br />
            o quien lo realice
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Conectamos personas que necesitan pequeños trabajos puntuales con profesionales
            dispuestos a realizarlos. Rápido, seguro y sin complicaciones.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/jobs">
                Buscar trabajos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {user ? (
              <Button variant="outline" size="xl" asChild>
                <Link to="/jobs/create">
                  Publicar un trabajo
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="xl" asChild>
                <Link to="/auth?mode=signup">
                  Crear cuenta gratis
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-6 shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Briefcase className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">1.000+</p>
              <p className="text-sm text-muted-foreground">Trabajos publicados</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-6 shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Users className="h-7 w-7 text-accent" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">5.000+</p>
              <p className="text-sm text-muted-foreground">Usuarios registrados</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-6 shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <Shield className="h-7 w-7 text-success" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground">Transacciones seguras</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
