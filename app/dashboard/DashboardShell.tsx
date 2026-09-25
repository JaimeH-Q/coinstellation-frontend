"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import BarraLateral from "@/components/dashboard/BarraLateral";
import NavbarSuperior from "@/components/dashboard/NavbarSuperior";

export interface UsuarioSesion {
  id: string;
  name: string;
  email: string;
}

interface DashboardLayoutContextValue {
  esModoOscuro: boolean;
  usuario: UsuarioSesion;
}

const DashboardLayoutContext = createContext<DashboardLayoutContextValue | null>(null);
const subscribeToTheme = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("coinstellation-theme-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("coinstellation-theme-change", onStoreChange);
  };
};
const getThemeSnapshot = () => localStorage.getItem("coinstellation-theme") === "dark";
const getServerThemeSnapshot = () => false;

export function useDashboardLayout() {
  const context = useContext(DashboardLayoutContext);

  if (!context) {
    throw new Error("useDashboardLayout debe usarse dentro del layout del dashboard.");
  }

  return context;
}

export default function DashboardShell({
  usuario,
  children,
}: {
  usuario: UsuarioSesion;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const seccionActiva = pathname === "/dashboard"
    ? "dashboard"
    : pathname.replace(/^\/dashboard\//, "");
  const esModoOscuro = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    document.body.classList.toggle("dark-theme", esModoOscuro);
  }, [esModoOscuro]);

  const alternarModoOscuro = () => {
    localStorage.setItem("coinstellation-theme", esModoOscuro ? "light" : "dark");
    window.dispatchEvent(new Event("coinstellation-theme-change"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-(--bg-main)">
      <NavbarSuperior
        seccionActiva={seccionActiva}
        usuario={usuario}
        esModoOscuro={esModoOscuro}
        alAlternarModoOscuro={alternarModoOscuro}
      />

      <div className="app-container flex-1">
        <DashboardLayoutContext.Provider value={{ esModoOscuro, usuario }}>
          <BarraLateral seccionActiva={seccionActiva} />
          <main className="main-content">{children}</main>
        </DashboardLayoutContext.Provider>
      </div>
    </div>
  );
}