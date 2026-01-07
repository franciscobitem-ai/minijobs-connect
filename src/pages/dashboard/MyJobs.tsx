import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { JOB_CATEGORIES, PROVINCES, JOB_STATUS, type JobCategory, type Province, type JobStatus } from "@/lib/constants";
import { Plus, Loader2, Briefcase, MapPin, Calendar, Euro, Users } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  province: Province;
  estimated_date: string | null;
  budget: number;
  status: JobStatus;
  created_at: string;
  _count?: { applications: number };
}

export default function MyJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("publisher_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs((data as Job[]) || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = filter === "all" 
    ? jobs 
    : jobs.filter((job) => job.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Mis trabajos publicados</h1>
          <p className="text-muted-foreground">Gestiona los trabajos que has publicado</p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/jobs/create">
            <Plus className="h-4 w-4 mr-2" />
            Publicar trabajo
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">Todos ({jobs.length})</TabsTrigger>
          <TabsTrigger value="open">
            Abiertos ({jobs.filter((j) => j.status === "open").length})
          </TabsTrigger>
          <TabsTrigger value="assigned">
            Asignados ({jobs.filter((j) => j.status === "assigned").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completados ({jobs.filter((j) => j.status === "completed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No hay trabajos</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {filter === "all"
                    ? "Aún no has publicado ningún trabajo"
                    : `No tienes trabajos con estado "${JOB_STATUS[filter as JobStatus].label}"`}
                </p>
                <Button variant="hero" asChild>
                  <Link to="/jobs/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Publicar trabajo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const categoryInfo = JOB_CATEGORIES[job.category];
                const statusInfo = JOB_STATUS[job.status];
                
                return (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
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
                              {statusInfo.label}
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
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/jobs/${job.id}`}>Ver detalles</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
