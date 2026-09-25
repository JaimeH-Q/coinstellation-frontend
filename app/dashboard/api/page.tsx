import SeccionApi from "@/components/dashboard/SeccionApi";
import TarjetaServidor from "@/components/dashboard/TarjetaServidor";

export default function ApiPage() {
  return (
    <div className="space-y-6">
      <SeccionApi />
      <TarjetaServidor />
    </div>
  );
}
