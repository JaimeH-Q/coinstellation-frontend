"use client";

import { useEffect, useState } from "react";
import SeccionHistorialPagos from "@/components/dashboard/SeccionHistorialPagos";
import type { Payment } from "@/backend/payments/PaymentsHistory";

export default function HistorialPagosPage() {
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [cargandoPagos, setCargandoPagos] = useState(true);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let vigente = true;

    fetch("/api/payments?count=200", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Error ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (vigente) setPagos(data.payments ?? []);
      })
      .catch(() => {
        if (vigente) setPagos([]);
      })
      .finally(() => {
        if (vigente) setCargandoPagos(false);
      });

    return () => {
      vigente = false;
    };
  }, [recarga]);

  const cargarPagos = () => {
    setCargandoPagos(true);
    setRecarga((actual) => actual + 1);
  };

  return (
    <SeccionHistorialPagos
      pagos={pagos}
      cargandoPagos={cargandoPagos}
      alActualizarPagos={cargarPagos}
    />
  );
}