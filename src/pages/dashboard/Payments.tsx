import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function Payments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Pagos y cobros</h1>
        <p className="text-muted-foreground">Gestiona tus transacciones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <ArrowDownLeft className="h-6 w-6 text-success" />
            </div>
            <div>
              <CardTitle className="text-lg">Ingresos</CardTitle>
              <CardDescription>Por trabajos realizados</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0,00 €</p>
            <p className="text-sm text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <ArrowUpRight className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-lg">Gastos</CardTitle>
              <CardDescription>Por trabajos contratados</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0,00 €</p>
            <p className="text-sm text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de transacciones</CardTitle>
          <CardDescription>Todas tus transacciones en un solo lugar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Sin transacciones</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Las transacciones de tus trabajos completados aparecerán aquí. 
              Empieza publicando o realizando trabajos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
