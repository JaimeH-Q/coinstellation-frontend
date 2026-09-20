"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Los 6 tipos exactos solicitados por el usuario
export type TipoProyecto =
  | "Opero un servidor de juegos"
  | "Modelador o creador de activos"
  | "Vendedor de claves de juego"
  | "Monetizar mi propio juego aplicacion o sitio web"
  | "Plataforma de mercado"
  | "Venta de productos fisicos";

export interface Proyecto {
  id: string;
  nombre: string;
  tipo: TipoProyecto;
  webstoreUrl: string;
  creadoEn: string;
}

// Configuración de logos e íconos por cada tipo de proyecto
export const CONFIG_TIPOS: Record<
  TipoProyecto,
  { icono: string; colorBg: string; colorTexto: string; etiquetaCorta: string }
> = {
  "Opero un servidor de juegos": {
    icono: "fa-solid fa-server",
    colorBg: "bg-purple-500/10 border-purple-500/30",
    colorTexto: "text-purple-600 dark:text-purple-400",
    etiquetaCorta: "Servidor de Juegos",
  },
  "Modelador o creador de activos": {
    icono: "fa-solid fa-cubes",
    colorBg: "bg-cyan-500/10 border-cyan-500/30",
    colorTexto: "text-cyan-600 dark:text-cyan-400",
    etiquetaCorta: "Activos 3D",
  },
  "Vendedor de claves de juego": {
    icono: "fa-solid fa-key",
    colorBg: "bg-amber-500/10 border-amber-500/30",
    colorTexto: "text-amber-600 dark:text-amber-400",
    etiquetaCorta: "Keys de Juegos",
  },
  "Monetizar mi propio juego aplicacion o sitio web": {
    icono: "fa-solid fa-coins",
    colorBg: "bg-emerald-500/10 border-emerald-500/30",
    colorTexto: "text-emerald-600 dark:text-emerald-400",
    etiquetaCorta: "Monetización App",
  },
  "Plataforma de mercado": {
    icono: "fa-solid fa-store",
    colorBg: "bg-pink-500/10 border-pink-500/30",
    colorTexto: "text-pink-600 dark:text-pink-400",
    etiquetaCorta: "Marketplace",
  },
  "Venta de productos fisicos": {
    icono: "fa-solid fa-box-open",
    colorBg: "bg-orange-500/10 border-orange-500/30",
    colorTexto: "text-orange-600 dark:text-orange-400",
    etiquetaCorta: "Productos Físicos",
  },
};

const PROYECTOS_INICIALES: Proyecto[] = [
  {
    id: "proy-1",
    nombre: "Rust Apocalypse Survival",
    tipo: "Opero un servidor de juegos",
    webstoreUrl: "https://webstore.coinstellation.com/rust-apocalypse",
    creadoEn: "12/09/2026",
  },
  {
    id: "proy-2",
    nombre: "Cyberpunk 3D Asset Vault",
    tipo: "Modelador o creador de activos",
    webstoreUrl: "https://webstore.coinstellation.com/cyberpunk-assets",
    creadoEn: "15/09/2026",
  },
  {
    id: "proy-3",
    nombre: "Steam & Epic Keys Center",
    tipo: "Vendedor de claves de juego",
    webstoreUrl: "https://webstore.coinstellation.com/keys-center",
    creadoEn: "18/09/2026",
  },
  {
    id: "proy-4",
    nombre: "Space Odyssey RPG Engine",
    tipo: "Monetizar mi propio juego aplicacion o sitio web",
    webstoreUrl: "https://webstore.coinstellation.com/space-odyssey",
    creadoEn: "19/09/2026",
  },
];

export default function SeccionProyectos() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<Proyecto[]>(PROYECTOS_INICIALES);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalLoginProyecto, setModalLoginProyecto] = useState<Proyecto | null>(null);

  // Formulario nuevo proyecto
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState<TipoProyecto>("Opero un servidor de juegos");
  const [nuevoWebstore, setNuevoWebstore] = useState("");
  const [errorForm, setErrorForm] = useState("");

  // Cargar proyectos guardados en localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const guardados = localStorage.getItem("coinstellation_proyectos_lista");
      if (guardados) {
        try {
          const parsed = JSON.parse(guardados);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProyectos(parsed);
          }
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Guardar en localStorage al cambiar proyectos
  const actualizarProyectos = (nuevos: Proyecto[]) => {
    setProyectos(nuevos);
    if (typeof window !== "undefined") {
      localStorage.setItem("coinstellation_proyectos_lista", JSON.stringify(nuevos));
    }
  };

  // Eliminar proyecto por ID
  const eliminarProyecto = (id: string) => {
    const filtrados = proyectos.filter((p) => p.id !== id);
    actualizarProyectos(filtrados);
  };

  // Crear nuevo proyecto
  const manejarCrearProyecto = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm("");

    if (!nuevoNombre.trim()) {
      setErrorForm("Por favor ingresa un nombre para el proyecto.");
      return;
    }

    const slug = nuevoNombre.trim().toLowerCase().replace(/\s+/g, "-");
    const nuevo: Proyecto = {
      id: "proy-" + Date.now(),
      nombre: nuevoNombre.trim(),
      tipo: nuevoTipo,
      webstoreUrl: nuevoWebstore.trim() || `https://webstore.coinstellation.com/${slug}`,
      creadoEn: new Date().toLocaleDateString("es-ES"),
    };

    actualizarProyectos([nuevo, ...proyectos]);
    setNuevoNombre("");
    setNuevoWebstore("");
    setModalCrearAbierto(false);
  };

  return (
    <section className="w-full">
      {/* Encabezado de la Sección con el botón Crear Proyecto a la derecha */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="text-left">
          <h1 className="page-title text-2xl font-extrabold">Proyectos</h1>
          <p className="page-subtitle text-xs sm:text-sm">
            Gestiona tus plataformas, tiendas y servicios vinculados a Coinstellation
          </p>
        </div>

        {/* Botón de Crear Proyecto del lado derecho superior */}
        <button
          type="button"
          onClick={() => router.push("/proyectos/crear")}
          className="px-4 py-2 h-9 rounded-[4px] bg-[var(--accent-gray)] hover:opacity-90 text-white text-xs font-bold shadow flex items-center gap-2 cursor-pointer transition-opacity"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Crear Proyecto</span>
        </button>
      </div>

      {/* Grid de cuadros de proyectos */}
      {proyectos.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[var(--border-color)] rounded-[6px] bg-[var(--bg-card)]">
          <div className="w-12 h-12 rounded-[4px] bg-[var(--bg-main)] text-[var(--text-muted)] flex items-center justify-center mx-auto mb-3 text-xl">
            <i className="fa-solid fa-folder-open"></i>
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">No hay proyectos registrados</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            Crea tu primer proyecto para comenzar a operar tu webstore y servicios.
          </p>
          <button
            type="button"
            onClick={() => router.push("/proyectos/crear")}
            className="px-4 py-2 rounded-[4px] bg-[var(--accent-gray)] text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Crear Primer Proyecto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {proyectos.map((proyecto) => {
            const configTipo =
              CONFIG_TIPOS[proyecto.tipo] || CONFIG_TIPOS["Opero un servidor de juegos"];

            return (
              <div
                key={proyecto.id}
                className="panel relative p-5 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between text-left"
              >
                {/* Botón X en rojo a la derecha para eliminar el proyecto */}
                <button
                  type="button"
                  onClick={() => eliminarProyecto(proyecto.id)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 hover:bg-red-500/10 w-7 h-7 rounded-[4px] flex items-center justify-center transition-colors cursor-pointer"
                  title="Eliminar proyecto"
                  aria-label={`Eliminar ${proyecto.nombre}`}
                >
                  <i className="fa-solid fa-xmark text-sm font-bold"></i>
                </button>

                {/* Cabecera del cuadro: Logo según tipo y nombre */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {/* Logo/Icono representativo según el tipo */}
                    <div
                      className={`w-11 h-11 rounded-[4px] border flex items-center justify-center text-lg ${configTipo.colorBg} ${configTipo.colorTexto}`}
                      title={proyecto.tipo}
                    >
                      <i className={configTipo.icono}></i>
                    </div>

                    <div className="pr-6 overflow-hidden">
                      <h3
                        className="text-sm font-bold text-[var(--text-primary)] truncate"
                        title={proyecto.nombre}
                      >
                        {proyecto.nombre}
                      </h3>
                      <span className="text-[10px] font-semibold text-[var(--text-secondary)] block truncate">
                        {configTipo.etiquetaCorta}
                      </span>
                    </div>
                  </div>

                  {/* Detalle del Tipo completo */}
                  <div className="mb-4">
                    <span className="inline-block text-[11px] leading-snug px-2 py-1 rounded-[4px] bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-medium">
                      {proyecto.tipo}
                    </span>
                  </div>
                </div>

                {/* Abajo: Botón para ver la Webstore y Botón de Login */}
                <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)] mt-2">
                  <a
                    href={proyecto.webstoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 text-center rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-[var(--text-secondary)]"></i>
                    <span>Ver Webstore</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setModalLoginProyecto(proyecto)}
                    className="flex-1 py-2 px-3 rounded-[4px] bg-[var(--accent-gray)] hover:opacity-90 text-white text-xs font-bold transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <i className="fa-solid fa-right-to-bracket text-[10px]"></i>
                    <span>Login</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: CREAR PROYECTO ================= */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="panel w-full max-w-lg shadow-2xl relative rounded-[6px] text-left max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={() => setModalCrearAbierto(false)}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-[4px] hover:bg-[var(--bg-main)] transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>

            <div className="mb-5">
              <h3 className="page-title text-xl font-extrabold mb-1">Crear Nuevo Proyecto</h3>
              <p className="page-subtitle text-xs">
                Selecciona la categoría de tu proyecto e ingresa sus datos
              </p>
            </div>

            {errorForm && (
              <div className="mb-3 text-red-500 text-xs font-semibold flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-sm"></i>
                <span>{errorForm}</span>
              </div>
            )}

            <form onSubmit={manejarCrearProyecto} className="flex flex-col gap-4">
              {/* Nombre del proyecto */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  placeholder="Ej. Servidor Minecraft Valhalla"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent-gray)] transition-colors"
                />
              </div>

              {/* Selector con los 6 tipos exactos */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Tipo de Proyecto
                </label>
                <select
                  value={nuevoTipo}
                  onChange={(e) => setNuevoTipo(e.target.value as TipoProyecto)}
                  className="w-full px-3 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent-gray)] transition-colors cursor-pointer"
                >
                  <option value="Opero un servidor de juegos">Opero un servidor de juegos</option>
                  <option value="Modelador o creador de activos">Modelador o creador de activos</option>
                  <option value="Vendedor de claves de juego">Vendedor de claves de juego</option>
                  <option value="Monetizar mi propio juego aplicacion o sitio web">
                    Monetizar mi propio juego aplicacion o sitio web
                  </option>
                  <option value="Plataforma de mercado">Plataforma de mercado</option>
                  <option value="Venta de productos fisicos">Venta de productos fisicos</option>
                </select>
              </div>

              {/* URL de Webstore opcional */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  URL de la Webstore (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://webstore.coinstellation.com/mi-proyecto"
                  value={nuevoWebstore}
                  onChange={(e) => setNuevoWebstore(e.target.value)}
                  className="w-full px-3 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent-gray)] transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)] mt-2">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  className="px-4 py-2 rounded-[4px] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[4px] bg-[var(--accent-gray)] hover:opacity-90 text-white text-xs font-bold transition-opacity cursor-pointer"
                >
                  Guardar Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOGIN DEL PROYECTO ================= */}
      {modalLoginProyecto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="panel w-full max-w-sm shadow-2xl relative rounded-[6px] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalLoginProyecto(null)}
              className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-[4px] hover:bg-[var(--bg-main)] transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div
                className={`w-9 h-9 rounded-[4px] border flex items-center justify-center text-sm ${
                  CONFIG_TIPOS[modalLoginProyecto.tipo].colorBg
                } ${CONFIG_TIPOS[modalLoginProyecto.tipo].colorTexto}`}
              >
                <i className={CONFIG_TIPOS[modalLoginProyecto.tipo].icono}></i>
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                  {modalLoginProyecto.nombre}
                </h3>
                <span className="text-[10px] text-[var(--text-secondary)]">Portal de Administración</span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Ingresa al panel de control de este proyecto para gestionar cobros, licencias y métricas.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Sesión iniciada con éxito en el proyecto: ${modalLoginProyecto.nombre}`);
                  setModalLoginProyecto(null);
                }}
                className="w-full py-2.5 rounded-[4px] bg-[var(--accent-gray)] hover:opacity-90 text-white font-bold text-xs transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-right-to-bracket text-xs"></i>
                <span>Acceder con Coinstellation SSO</span>
              </button>

              <button
                type="button"
                onClick={() => setModalLoginProyecto(null)}
                className="w-full py-2 rounded-[4px] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
