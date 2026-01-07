import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Wrench, 
  Truck, 
  TreePine, 
  Heart, 
  GraduationCap, 
  Laptop, 
  MoreHorizontal 
} from "lucide-react";
import { JOB_CATEGORIES } from "@/lib/constants";

const iconMap = {
  Sparkles,
  Wrench,
  Truck,
  TreePine,
  Heart,
  GraduationCap,
  Laptop,
  MoreHorizontal,
};

export function CategoriesSection() {
  return (
    <section className="py-20 bg-card">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold mb-4">
            Explora por categoría
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encuentra trabajos en la categoría que mejor se adapte a tus habilidades
            o publica el que necesites.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(JOB_CATEGORIES).map(([key, { label, icon }]) => {
            const Icon = iconMap[icon as keyof typeof iconMap];
            return (
              <Link
                key={key}
                to={`/jobs?category=${key}`}
                className="group flex flex-col items-center gap-4 rounded-2xl bg-background p-6 shadow-sm border border-border transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary transition-colors group-hover:bg-primary/10">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <span className="font-medium text-center group-hover:text-primary transition-colors">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
