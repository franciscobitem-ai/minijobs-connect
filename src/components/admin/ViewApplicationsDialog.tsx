import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Application {
  id: string;
  message: string | null;
  status: string;
  created_at: string;
  applicant: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

interface ViewApplicationsDialogProps {
  jobId: string | null;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const APPLICATION_STATUSES = {
  pending: { label: "Pendiente", color: "bg-warning" },
  accepted: { label: "Aceptada", color: "bg-success" },
  rejected: { label: "Rechazada", color: "bg-destructive" },
};

export function ViewApplicationsDialog({ jobId, jobTitle, open, onOpenChange }: ViewApplicationsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (open && jobId) {
      fetchApplications();
    }
  }, [open, jobId]);

  const fetchApplications = async () => {
    if (!jobId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch applicant profiles
      const applicantIds = [...new Set((data || []).map((a) => a.applicant_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email")
        .in("user_id", applicantIds);

      const profilesMap = new Map(
        (profilesData || []).map((p) => [p.user_id, { first_name: p.first_name, last_name: p.last_name, email: p.email }])
      );

      setApplications(
        (data || []).map((app) => ({
          ...app,
          applicant: profilesMap.get(app.applicant_id) || null,
        }))
      );
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Error al cargar las postulaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      setApplications(applications.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      toast.success("Estado actualizado");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  if (!jobId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Postulaciones - {jobTitle}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : applications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay postulaciones para este trabajo
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Postulante</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    {app.applicant?.first_name} {app.applicant?.last_name}
                  </TableCell>
                  <TableCell>{app.applicant?.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {app.message || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(app.created_at), "d MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={app.status}
                      onValueChange={(value) => handleStatusChange(app.id, value)}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(APPLICATION_STATUSES).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
