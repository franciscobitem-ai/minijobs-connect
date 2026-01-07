import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { PROVINCES } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  province: string | null;
  account_status: string;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers((data as Profile[]) || []);
    } catch (error) {
      console.error("Error fetching users:", error);
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
        <h2 className="font-display text-2xl font-bold">Usuarios</h2>
        <p className="text-muted-foreground">Gestiona todos los usuarios de la plataforma</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de usuarios ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Provincia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.province ? PROVINCES[user.province as keyof typeof PROVINCES] : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.account_status === "active" ? "default" : "destructive"}
                        className={user.account_status === "active" ? "bg-success" : ""}
                      >
                        {user.account_status === "active" ? "Activo" : user.account_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(user.created_at), "d MMM yyyy", { locale: es })}
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
