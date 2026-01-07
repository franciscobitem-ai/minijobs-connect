import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { JobCard } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { JOB_CATEGORIES, PROVINCES, type JobCategory, type Province, type JobStatus } from "@/lib/constants";
import { Search, Filter, Plus, Loader2, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
}

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(searchParams.get("category") || "all");
  const [province, setProvince] = useState<string>("all");
  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, [category, province]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("jobs")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }
      if (province && province !== "all") {
        query = query.eq("province", province);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs((data as Job[]) || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    if (value === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", value);
    }
    setSearchParams(searchParams);
  };

  return (
    <Layout>
      <div className="bg-secondary/30 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Trabajos disponibles</h1>
              <p className="text-muted-foreground">
                Encuentra el trabajo perfecto para ti entre {jobs.length} ofertas
              </p>
            </div>
            {user && (
              <Button variant="hero" asChild>
                <Link to="/jobs/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Publicar trabajo
                </Link>
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(JOB_CATEGORIES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Provincia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las provincias</SelectItem>
                {Object.entries(PROVINCES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-6">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No hay trabajos disponibles</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              No hemos encontrado trabajos con los filtros seleccionados. 
              Prueba a cambiar los filtros o sé el primero en publicar uno.
            </p>
            {user && (
              <Button variant="hero" asChild>
                <Link to="/jobs/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Publicar trabajo
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                description={job.description}
                category={job.category}
                province={job.province}
                estimatedDate={job.estimated_date || undefined}
                budget={job.budget}
                status={job.status}
                createdAt={job.created_at}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
