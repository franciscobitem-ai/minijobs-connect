import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { JOB_CATEGORIES, PROVINCES, JOB_STATUS, type JobCategory, type Province, type JobStatus } from "@/lib/constants";
import { MapPin, Calendar, Euro, User, ArrowLeft, Loader2, Send, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

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
  publisher_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) {
      fetchJob();
      if (user) {
        checkApplication();
      }
    }
  }, [id, user]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        // Fetch publisher profile separately
        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", data.publisher_id)
          .maybeSingle();
        
        setJob({
          ...data,
          profiles: profileData || undefined,
        } as Job);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("No se pudo cargar el trabajo");
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", id)
        .eq("applicant_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setHasApplied(true);
      }
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setApplying(true);
    try {
      const { error } = await supabase
        .from("job_applications")
        .insert({
          job_id: id,
          applicant_id: user.id,
          message: message || null,
        });

      if (error) throw error;
      
      toast.success("¡Solicitud enviada correctamente!");
      setHasApplied(true);
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Ya te has postulado a este trabajo");
        setHasApplied(true);
      } else {
        toast.error("Error al enviar la solicitud");
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Trabajo no encontrado</h1>
          <Button asChild>
            <Link to="/jobs">Volver a trabajos</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const categoryInfo = JOB_CATEGORIES[job.category];
  const provinceName = PROVINCES[job.province];
  const statusInfo = JOB_STATUS[job.status];
  const isOwner = user?.id === job.publisher_id;

  return (
    <Layout>
      <div className="bg-secondary/30 py-8">
        <div className="container">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="secondary">{categoryInfo.label}</Badge>
            <Badge variant={job.status === "open" ? "default" : "outline"} className={job.status === "open" ? "bg-success" : ""}>
              {statusInfo.label}
            </Badge>
          </div>
          
          <h1 className="font-display text-3xl lg:text-4xl font-bold mb-4">{job.title}</h1>
          
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{provinceName}</span>
            </div>
            {job.estimated_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{format(new Date(job.estimated_date), "d MMMM yyyy", { locale: es })}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <span>
                {job.profiles?.first_name} {job.profiles?.last_name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Descripción del trabajo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{job.description}</p>
              </CardContent>
            </Card>

            {job.status === "open" && !isOwner && user && (
              <Card>
                <CardHeader>
                  <CardTitle>Postularse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasApplied ? (
                    <div className="flex items-center gap-3 text-success">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Ya te has postulado a este trabajo</span>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        placeholder="Escribe un mensaje al cliente explicando por qué eres la persona ideal para este trabajo... (opcional)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                      />
                      <Button onClick={handleApply} disabled={applying}>
                        {applying ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar solicitud
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Presupuesto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-primary">{job.budget}</span>
                  <Euro className="h-6 w-6 text-primary" />
                </div>
                
                {!user && job.status === "open" && (
                  <div className="space-y-3">
                    <Button className="w-full" asChild>
                      <Link to="/auth?mode=signup">Crear cuenta para postularse</Link>
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      ¿Ya tienes cuenta?{" "}
                      <Link to="/auth" className="text-primary hover:underline">
                        Iniciar sesión
                      </Link>
                    </p>
                  </div>
                )}

                {isOwner && (
                  <div className="text-center text-sm text-muted-foreground">
                    Este es tu trabajo publicado
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
                  <p>Publicado el {format(new Date(job.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
