import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Briefcase, CheckCircle, Clock, Loader2 } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalJobs: number;
  openJobs: number;
  completedJobs: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalJobs: 0,
    openJobs: 0,
    completedJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, jobsRes, openJobsRes, completedJobsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "completed"),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalJobs: jobsRes.count || 0,
        openJobs: openJobsRes.count || 0,
        completedJobs: completedJobsRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
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

  const statCards = [
    { label: "Usuarios totales", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Trabajos totales", value: stats.totalJobs, icon: Briefcase, color: "text-accent" },
    { label: "Trabajos abiertos", value: stats.openJobs, icon: Clock, color: "text-success" },
    { label: "Trabajos completados", value: stats.completedJobs, icon: CheckCircle, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
