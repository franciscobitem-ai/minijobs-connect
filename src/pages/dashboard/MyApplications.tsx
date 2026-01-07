import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { JOB_CATEGORIES, PROVINCES, JOB_STATUS, type JobCategory, type Province, type JobStatus } from "@/lib/constants";
import { Loader2, FileText, MapPin, Euro, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Application {
  id: string;
  message: string | null;
  status: string;
  created_at: string;
  jobs: {
    id: string;
    title: string;
    category: JobCategory;
    province: Province;
    budget: number;
    status: JobStatus;
    estimated_date: string | null;
  };
}

export default function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          id,
          message,
          status,
          created_at,
          jobs:job_id (
            id,
            title,
            category,
            province,
            budget,
            status,
            estimated_date
          )
        `)
        .eq("applicant_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications((data as Application[]) || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Mis postulaciones</h1>
        <p className="text-muted-foreground">Historial de trabajos a los que te has postulado</p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Sin postulaciones</h3>
            <p className="text-muted-foreground text-center mb-4">
              Aún no te has postulado a ningún trabajo
            </p>
            <Button variant="hero" asChild>
              <Link to="/jobs">Explorar trabajos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const job = application.jobs;
            const categoryInfo = JOB_CATEGORIES[job.category];
            const jobStatusInfo = JOB_STATUS[job.status];
            
            return (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {categoryInfo.label}
                        </Badge>
                        <Badge 
                          variant={job.status === "open" ? "default" : "outline"}
                          className={job.status === "open" ? "bg-success" : ""}
                        >
                          {jobStatusInfo.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {application.status === "pending" ? "Pendiente" : application.status}
                        </Badge>
                      </div>
                      <Link 
                        to={`/jobs/${job.id}`}
                        className="font-display text-lg font-semibold hover:text-primary transition-colors"
                      >
                        {job.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {PROVINCES[job.province]}
                        </div>
                        {job.estimated_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(job.estimated_date), "d MMM yyyy", { locale: es })}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          {job.budget}€
                        </div>
                      </div>
                      {application.message && (
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          <span className="font-medium">Tu mensaje:</span> {application.message}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        Postulado el {format(new Date(application.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/jobs/${job.id}`}>Ver trabajo</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
