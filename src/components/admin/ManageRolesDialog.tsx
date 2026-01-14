import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ManageRolesDialogProps {
  userId: string | null;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const ROLES = {
  user: "Usuario",
  admin: "Administrador",
};

type AppRole = "user" | "admin";

export function ManageRolesDialog({ userId, userName, open, onOpenChange, onSave }: ManageRolesDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingRoles, setFetchingRoles] = useState(false);
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    if (open && userId) {
      fetchUserRoles();
    }
  }, [open, userId]);

  const fetchUserRoles = async () => {
    if (!userId) return;
    
    setFetchingRoles(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) throw error;
      setUserRoles((data || []).map((r) => r.role as AppRole));
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Error al cargar los roles");
    } finally {
      setFetchingRoles(false);
    }
  };

  const handleRoleToggle = async (role: AppRole, checked: boolean) => {
    if (!userId) return;

    setLoading(true);
    try {
      if (checked) {
        // Add role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });

        if (error) throw error;
        setUserRoles([...userRoles, role]);
      } else {
        // Remove role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role);

        if (error) throw error;
        setUserRoles(userRoles.filter((r) => r !== role));
      }
      toast.success(`Rol ${checked ? "añadido" : "eliminado"} correctamente`);
      onSave();
    } catch (error) {
      console.error("Error updating roles:", error);
      toast.error("Error al actualizar el rol");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gestionar Roles - {userName}</DialogTitle>
        </DialogHeader>
        {fetchingRoles ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {Object.entries(ROLES).map(([role, label]) => (
              <div key={role} className="flex items-center space-x-3">
                <Checkbox
                  id={role}
                  checked={userRoles.includes(role as AppRole)}
                  onCheckedChange={(checked) => handleRoleToggle(role as AppRole, checked as boolean)}
                  disabled={loading}
                />
                <Label htmlFor={role} className="cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>
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
