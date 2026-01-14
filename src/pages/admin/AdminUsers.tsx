import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { PROVINCES, type Province } from "@/lib/constants";
import { Loader2, Pencil, Shield, Search, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { ManageRolesDialog } from "@/components/admin/ManageRolesDialog";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  dni_nie: string | null;
  address: string | null;
  province: Province | null;
  birth_date: string | null;
  account_status: "active" | "suspended" | "pending";
  payment_method: string | null;
  collection_method: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: "user" | "admin";
}

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      if (usersRes.error) throw usersRes.error;
      setUsers((usersRes.data as Profile[]) || []);

      // Build roles map
      const rolesMap = new Map<string, string[]>();
      (rolesRes.data as UserRole[] || []).forEach((r) => {
        const existing = rolesMap.get(r.user_id) || [];
        rolesMap.set(r.user_id, [...existing, r.role]);
      });
      setUserRoles(rolesMap);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: Profile) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleManageRoles = (user: Profile) => {
    setSelectedUserId(user.user_id);
    setSelectedUserName(`${user.first_name} ${user.last_name}`);
    setRolesDialogOpen(true);
  };

  const handleToggleStatus = async (user: Profile) => {
    const newStatus = user.account_status === "active" ? "suspended" : "active";
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: newStatus })
        .eq("id", user.id);

      if (error) throw error;

      setUsers(users.map((u) => 
        u.id === user.id ? { ...u, account_status: newStatus } : u
      ));
      toast.success(`Usuario ${newStatus === "active" ? "activado" : "suspendido"}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchQuery.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(search) ||
      user.last_name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.dni_nie && user.dni_nie.toLowerCase().includes(search))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success">Activo</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspendido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Lista de usuarios ({filteredUsers.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>DNI/NIE</TableHead>
                  <TableHead>Provincia</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.dni_nie || "-"}</TableCell>
                    <TableCell>
                      {user.province ? PROVINCES[user.province] : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {(userRoles.get(user.user_id) || []).map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role === "admin" ? "Admin" : "Usuario"}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.account_status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(user.created_at), "d MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                          title="Editar usuario"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleManageRoles(user)}
                          title="Gestionar roles"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(user)}
                          title={user.account_status === "active" ? "Suspender" : "Activar"}
                        >
                          {user.account_status === "active" ? (
                            <UserX className="h-4 w-4 text-destructive" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-success" />
                          )}
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

      <EditUserDialog
        user={editingUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={fetchUsers}
      />

      <ManageRolesDialog
        userId={selectedUserId}
        userName={selectedUserName}
        open={rolesDialogOpen}
        onOpenChange={setRolesDialogOpen}
        onSave={fetchUsers}
      />
    </div>
  );
}
