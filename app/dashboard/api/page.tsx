import SeccionApi from "@/components/dashboard/SeccionApi";
import TarjetaServidor from "@/components/dashboard/TarjetaServidor";

export default function ApiPage() {
  // Se lee en el servidor en cada solicitud: cambiar el .env y reiniciar alcanza (sin recompilar).
  const urlPublica = process.env.PUBLIC_API_URL?.trim().replace(/\/+$/, "") || null;

  return (
    <div className="space-y-6">
      <SeccionApi urlPublica={urlPublica} />
      <TarjetaServidor />
    </div>
  );
}
