import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { PROVINCES, type Province } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
}

interface EditUserDialogProps {
  user: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const ACCOUNT_STATUSES = {
  active: "Activo",
  suspended: "Suspendido",
  pending: "Pendiente",
};

export function EditUserDialog({ user, open, onOpenChange, onSave }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && user) {
      setFormData({ ...user });
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          dni_nie: formData.dni_nie,
          address: formData.address,
          province: formData.province,
          birth_date: formData.birth_date,
          account_status: formData.account_status,
          payment_method: formData.payment_method,
          collection_method: formData.collection_method,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Usuario actualizado correctamente");
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error al actualizar el usuario");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input
                id="first_name"
                value={formData.first_name || ""}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellidos</Label>
              <Input
                id="last_name"
                value={formData.last_name || ""}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni_nie">DNI/NIE</Label>
              <Input
                id="dni_nie"
                value={formData.dni_nie || ""}
                onChange={(e) => setFormData({ ...formData, dni_nie: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">Fecha de nacimiento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date || ""}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Provincia</Label>
              <Select
                value={formData.province || ""}
                onValueChange={(value) => setFormData({ ...formData, province: value as Province })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona provincia" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVINCES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_status">Estado de cuenta</Label>
              <Select
                value={formData.account_status || "active"}
                onValueChange={(value) => setFormData({ ...formData, account_status: value as Profile["account_status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACCOUNT_STATUSES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de pago</Label>
              <Input
                id="payment_method"
                value={formData.payment_method || ""}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection_method">Método de cobro</Label>
              <Input
                id="collection_method"
                value={formData.collection_method || ""}
                onChange={(e) => setFormData({ ...formData, collection_method: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
