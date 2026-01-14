import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { JOB_CATEGORIES, PROVINCES, JOB_STATUS, type JobCategory, type Province, type JobStatus } from "@/lib/constants";
import { Loader2, ExternalLink, Pencil, Users, Search, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { EditJobDialog } from "@/components/admin/EditJobDialog";
import { ViewApplicationsDialog } from "@/components/admin/ViewApplicationsDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  province: Province;
  budget: number;
  status: JobStatus;
  estimated_date: string | null;
  created_at: string;
  publisher_id: string;
  assigned_to: string | null;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Dialog states
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [applicationsDialogOpen, setApplicationsDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for all publishers
      const publisherIds = [...new Set((data || []).map((j) => j.publisher_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", publisherIds);

      const profilesMap = new Map(
        (profilesData || []).map((p) => [p.user_id, { first_name: p.first_name, last_name: p.last_name }])
      );

      setJobs(
        (data || []).map((job) => ({
          ...job,
          profiles: profilesMap.get(job.publisher_id),
        })) as Job[]
      );
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Error al cargar trabajos");
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

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setEditDialogOpen(true);
  };

  const handleViewApplications = (job: Job) => {
    setSelectedJobId(job.id);
    setSelectedJobTitle(job.title);
    setApplicationsDialogOpen(true);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      // First delete related applications
      await supabase
        .from("job_applications")
        .delete()
        .eq("job_id", jobToDelete.id);

      // Then delete the job
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobToDelete.id);

      if (error) throw error;

      setJobs(jobs.filter((j) => j.id !== jobToDelete.id));
      toast.success("Trabajo eliminado");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Error al eliminar el trabajo");
    } finally {
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || job.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: JobStatus) => {
    const config = JOB_STATUS[status];
    const colorClass = {
      open: "bg-success",
      assigned: "bg-warning",
      in_progress: "bg-primary",
      completed: "bg-muted",
      cancelled: "bg-destructive",
    }[status];

    return <Badge className={colorClass}>{config.label}</Badge>;
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
          <div className="flex flex-col gap-4">
            <CardTitle>Lista de trabajos ({filteredJobs.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar trabajos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(JOB_STATUS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(JOB_CATEGORIES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditJob(job)}
                          title="Editar trabajo"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewApplications(job)}
                          title="Ver postulaciones"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Ver detalle">
                          <Link to={`/jobs/${job.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setJobToDelete(job);
                            setDeleteDialogOpen(true);
                          }}
                          title="Eliminar trabajo"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EditJobDialog
        job={editingJob}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={fetchJobs}
      />

      <ViewApplicationsDialog
        jobId={selectedJobId}
        jobTitle={selectedJobTitle}
        open={applicationsDialogOpen}
        onOpenChange={setApplicationsDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar trabajo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el trabajo "{jobToDelete?.title}" y todas sus postulaciones asociadas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
