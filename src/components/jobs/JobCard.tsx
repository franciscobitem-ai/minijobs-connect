import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Euro, ArrowRight } from "lucide-react";
import { JOB_CATEGORIES, PROVINCES, JOB_STATUS, type JobCategory, type Province, type JobStatus } from "@/lib/constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface JobCardProps {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  province: Province;
  estimatedDate?: string;
  budget: number;
  status: JobStatus;
  createdAt: string;
}

export function JobCard({
  id,
  title,
  description,
  category,
  province,
  estimatedDate,
  budget,
  status,
  createdAt,
}: JobCardProps) {
  const categoryInfo = JOB_CATEGORIES[category];
  const provinceName = PROVINCES[province];
  const statusInfo = JOB_STATUS[status];

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {categoryInfo.label}
              </Badge>
              <Badge 
                variant={status === "open" ? "default" : "outline"} 
                className={`text-xs ${status === "open" ? "bg-success" : ""}`}
              >
                {statusInfo.label}
              </Badge>
            </div>
            <h3 className="font-display text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{budget}€</p>
            <p className="text-xs text-muted-foreground">Presupuesto</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{provinceName}</span>
          </div>
          {estimatedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(new Date(estimatedDate), "d MMM yyyy", { locale: es })}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t border-border">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted-foreground">
            Publicado {format(new Date(createdAt), "d MMM", { locale: es })}
          </span>
          <Button variant="ghost" size="sm" className="gap-1 group-hover:text-primary" asChild>
            <Link to={`/jobs/${id}`}>
              Ver detalles
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
