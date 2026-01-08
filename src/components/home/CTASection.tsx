import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function CTASection() {
  const { user } = useAuth();

  return (
    <section className="py-20 bg-card">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-12 lg:p-20">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-foreground mb-6">
              ¿Listo para empezar?
            </h2>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-10">
              Únete a miles de personas que ya están encontrando trabajos o profesionales 
              para sus tareas del día a día.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <>
                  <Button 
                    size="lg" 
                    className="bg-background text-foreground hover:bg-background/90 shadow-xl"
                    asChild
                  >
                    <Link to="/jobs">
                      Explorar trabajos
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                    asChild
                  >
                    <Link to="/jobs/create">
                      Publicar trabajo
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="bg-background text-foreground hover:bg-background/90 shadow-xl"
                    asChild
                  >
                    <Link to="/auth?mode=signup">
                      Crear cuenta gratis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                    asChild
                  >
                    <Link to="/auth">
                      Iniciar sesión
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
