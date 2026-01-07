import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { JOB_CATEGORIES, PROVINCES, JOB_STATUS, type JobCategory, type Province, type JobStatus } from "@/lib/constants";
import { Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  category: JobCategory;
  province: Province;
  budget: number;
  status: JobStatus;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          profiles:publisher_id (first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs((data as Job[]) || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId);

      if (error) throw error;
      
      setJobs(jobs.map((job) => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
      toast.success("Estado actualizado");
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Error al actualizar el estado");
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
        <h2 className="font-display text-2xl font-bold">Trabajos</h2>
        <p className="text-muted-foreground">Gestiona todos los trabajos de la plataforma</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de trabajos ({jobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Publicado por</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Provincia</TableHead>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {job.title}
                    </TableCell>
                    <TableCell>
                      {job.profiles?.first_name} {job.profiles?.last_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {JOB_CATEGORIES[job.category].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{PROVINCES[job.province]}</TableCell>
                    <TableCell>{job.budget}€</TableCell>
                    <TableCell>
                      <Select
                        value={job.status}
                        onValueChange={(value) => handleStatusChange(job.id, value as JobStatus)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(JOB_STATUS).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(job.created_at), "d MMM", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/jobs/${job.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
