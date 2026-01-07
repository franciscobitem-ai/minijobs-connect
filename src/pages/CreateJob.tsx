import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { JOB_CATEGORIES, PROVINCES } from "@/lib/constants";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const jobSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  category: z.string().min(1, "Selecciona una categoría"),
  province: z.string().min(1, "Selecciona una provincia"),
  budget: z.number().min(1, "El presupuesto debe ser mayor a 0"),
  estimatedDate: z.string().optional(),
});

export default function CreateJob() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    province: "",
    budget: "",
    estimatedDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        province: formData.province,
        budget: parseFloat(formData.budget) || 0,
        estimatedDate: formData.estimatedDate || undefined,
      };

      const result = jobSchema.safeParse(data);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("jobs").insert({
        publisher_id: user!.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        province: formData.province,
        budget: parseFloat(formData.budget),
        estimated_date: formData.estimatedDate || null,
        status: "open",
      });

      if (error) throw error;

      toast.success("¡Trabajo publicado correctamente!");
      navigate("/dashboard/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Error al publicar el trabajo");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Publicar un nuevo trabajo</CardTitle>
            <CardDescription>
              Describe el trabajo que necesitas realizar. Cuantos más detalles proporciones, 
              mejores candidatos recibirás.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título del trabajo *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Reparación de grifo en cocina"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe en detalle el trabajo que necesitas..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(JOB_CATEGORIES).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Provincia *</Label>
                  <Select
                    value={formData.province}
                    onValueChange={(value) => setFormData({ ...formData, province: value })}
                  >
                    <SelectTrigger className={errors.province ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecciona una provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROVINCES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.province && <p className="text-xs text-destructive">{errors.province}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Presupuesto (€) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="50"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className={errors.budget ? "border-destructive" : ""}
                  />
                  {errors.budget && <p className="text-xs text-destructive">{errors.budget}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDate">Fecha estimada</Label>
                  <Input
                    id="estimatedDate"
                    type="date"
                    value={formData.estimatedDate}
                    onChange={(e) => setFormData({ ...formData, estimatedDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" variant="hero" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    "Publicar trabajo"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
