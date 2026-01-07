import { UserPlus, Search, Handshake, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Crea tu cuenta",
    description: "Regístrate gratis en menos de un minuto con tu email.",
  },
  {
    icon: Search,
    title: "Busca o publica",
    description: "Encuentra trabajos disponibles o publica el que necesites.",
  },
  {
    icon: Handshake,
    title: "Conecta",
    description: "Postúlate a trabajos o revisa las solicitudes recibidas.",
  },
  {
    icon: CheckCircle,
    title: "Completa el trabajo",
    description: "Realiza el trabajo y recibe tu pago de forma segura.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            En cuatro sencillos pasos puedes empezar a trabajar o encontrar a la persona ideal para tu tarea.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-lg">
                    <step.icon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
