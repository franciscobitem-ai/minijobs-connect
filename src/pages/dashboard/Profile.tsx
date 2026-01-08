import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PROVINCES } from "@/lib/constants";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  first_name: string;
  last_name: string;
  dni_nie: string | null;
  birth_date: string | null;
  address: string | null;
  province: string | null;
  email: string;
  phone: string | null;
  payment_method: string | null;
  collection_method: string | null;
}

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    first_name: "",
    last_name: "",
    dni_nie: "",
    birth_date: "",
    address: "",
    province: "",
    email: "",
    phone: "",
    payment_method: "",
    collection_method: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          dni_nie: data.dni_nie || "",
          birth_date: data.birth_date || "",
          address: data.address || "",
          province: data.province || "",
          email: data.email || "",
          phone: data.phone || "",
          payment_method: data.payment_method || "",
          collection_method: data.collection_method || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        dni_nie: profile.dni_nie || null,
        birth_date: profile.birth_date || null,
        address: profile.address || null,
        phone: profile.phone || null,
        payment_method: profile.payment_method || null,
        collection_method: profile.collection_method || null,
      };

      if (profile.province) {
        updateData.province = profile.province as "alava" | "albacete" | "alicante" | "almeria" | "asturias" | "avila" | "badajoz" | "barcelona" | "burgos" | "caceres" | "cadiz" | "cantabria" | "castellon" | "ciudad_real" | "cordoba" | "cuenca" | "girona" | "granada" | "guadalajara" | "guipuzcoa" | "huelva" | "huesca" | "islas_baleares" | "jaen" | "la_coruna" | "la_rioja" | "las_palmas" | "leon" | "lleida" | "lugo" | "madrid" | "malaga" | "murcia" | "navarra" | "ourense" | "palencia" | "pontevedra" | "salamanca" | "santa_cruz_tenerife" | "segovia" | "sevilla" | "soria" | "tarragona" | "teruel" | "toledo" | "valencia" | "valladolid" | "vizcaya" | "zamora" | "zaragoza" | "ceuta" | "melilla";
      } else {
        updateData.province = null;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user!.id);

      if (error) throw error;
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setSaving(false);
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
        <h1 className="font-display text-2xl font-bold">Mi perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>Esta información será visible para otros usuarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos *</Label>
              <Input
                id="lastName"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dniNie">DNI/NIE</Label>
              <Input
                id="dniNie"
                value={profile.dni_nie || ""}
                onChange={(e) => setProfile({ ...profile, dni_nie: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                value={profile.birth_date || ""}
                onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={profile.address || ""}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provincia</Label>
              <Select
                value={profile.province || ""}
                onValueChange={(value) => setProfile({ ...profile, province: value })}
              >
                <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métodos de pago y cobro</CardTitle>
          <CardDescription>Configura cómo recibir y realizar pagos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de pago</Label>
            <Input
              id="paymentMethod"
              placeholder="Ej: Tarjeta terminada en 1234"
              value={profile.payment_method || ""}
              onChange={(e) => setProfile({ ...profile, payment_method: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="collectionMethod">Método de cobro</Label>
            <Input
              id="collectionMethod"
              placeholder="Ej: IBAN ES12 1234 5678..."
              value={profile.collection_method || ""}
              onChange={(e) => setProfile({ ...profile, collection_method: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
