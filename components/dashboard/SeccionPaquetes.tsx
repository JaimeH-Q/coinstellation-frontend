"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PACKAGE_CURRENCIES,
  type PackageCategoryDTO,
  type PackageDTO,
} from "@/backend/packages/PackageTypes";

const IMAGEN_PAQUETE_DEFECTO =
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80";
const IMAGEN_CATEGORIA_DEFECTO =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";
const ID_SIN_CATEGORIA = "__sin-categoria__";

/** Grupo del catálogo: una categoría real o el grupo virtual "Sin categoría". */
interface GrupoCatalogo {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  esVirtual: boolean;
  paquetes: PackageDTO[];
}

async function leerError(respuesta: Response, porDefecto: string) {
  try {
    const data: { error?: string } = await respuesta.json();
    return data.error ?? porDefecto;
  } catch {
    return porDefecto;
  }
}

export default function SeccionPaquetes() {
  // Vista activa: 'catalogo' (primero se ve cada categoría con sus paquetes), 'crear-paquete' o 'crear-categoria'
  const [vistaActual, setVistaActual] = useState<"catalogo" | "crear-paquete" | "crear-categoria">("catalogo");

  // Control del menú desplegable "Añadir nuevo"
  const [menuAnadirAbierto, setMenuAnadirAbierto] = useState<boolean>(false);
  const refMenuAnadir = useRef<HTMLDivElement>(null);

  // Control del menú desplegable de 3 puntitos de cada categoría
  const [menuCatAbierto, setMenuCatAbierto] = useState<string | null>(null);

  // Estados de datos (vienen de /api/packages)
  const [paquetes, setPaquetes] = useState<PackageDTO[]>([]);
  const [categorias, setCategorias] = useState<PackageCategoryDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Campos del formulario de Paquete
  const [nombrePaquete, setNombrePaquete] = useState("");
  const [descPaquete, setDescPaquete] = useState("");
  const [imagenPaquete, setImagenPaquete] = useState("");
  const [catSeleccionada, setCatSeleccionada] = useState("");
  const [precioPaquete, setPrecioPaquete] = useState("");
  const [monedaPaquete, setMonedaPaquete] = useState<string>(PACKAGE_CURRENCIES[0]);
  const [comandosPaquete, setComandosPaquete] = useState("");
  const refComandos = useRef<HTMLTextAreaElement>(null);

  // Campos del formulario de Categoría
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [descCategoria, setDescCategoria] = useState("");
  const [imagenCategoria, setImagenCategoria] = useState("");

  // Alertas
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [errorCarga, setErrorCarga] = useState("");

  // Cargar paquetes y categorías del usuario
  useEffect(() => {
    let vigente = true;

    fetch("/api/packages", { cache: "no-store" })
      .then(async (respuesta) => {
        if (!respuesta.ok) throw new Error(await leerError(respuesta, "No se pudieron cargar los paquetes."));
        return respuesta.json() as Promise<{ packages: PackageDTO[]; categories: PackageCategoryDTO[] }>;
      })
      .then((data) => {
        if (!vigente) return;
        setPaquetes(data.packages);
        setCategorias(data.categories);
      })
      .catch((error: unknown) => {
        if (vigente) setErrorCarga(error instanceof Error ? error.message : "No se pudieron cargar los paquetes.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const manejarClickFuera = (e: MouseEvent) => {
      if (refMenuAnadir.current && !refMenuAnadir.current.contains(e.target as Node)) {
        setMenuAnadirAbierto(false);
      }
    };
    document.addEventListener("mousedown", manejarClickFuera);
    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
    };
  }, []);

  const mostrarExito = (mensaje: string) => {
    setMensajeExito(mensaje);
    setTimeout(() => {
      setMensajeExito("");
    }, 3500);
  };

  // Categorías reales + grupo "Sin categoría" para paquetes sin categoría asignada
  const idsCategorias = new Set(categorias.map((c) => c.id));
  const paquetesSinCategoria = paquetes.filter((p) => !p.categoryId || !idsCategorias.has(p.categoryId));
  const grupos: GrupoCatalogo[] = [
    ...categorias.map((cat) => ({
      id: cat.id,
      nombre: cat.name,
      descripcion: cat.description ?? "",
      imagen: cat.imageUrl ?? IMAGEN_CATEGORIA_DEFECTO,
      esVirtual: false,
      paquetes: paquetes.filter((p) => p.categoryId === cat.id),
    })),
    ...(paquetesSinCategoria.length > 0
      ? [{
          id: ID_SIN_CATEGORIA,
          nombre: "Sin categoría",
          descripcion: "Paquetes que todavía no pertenecen a ninguna categoría.",
          imagen: IMAGEN_CATEGORIA_DEFECTO,
          esVirtual: true,
          paquetes: paquetesSinCategoria,
        }]
      : []),
  ];

  // Subida de imagen para paquete
  const manejarSubidaImagenPaquete = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImagenPaquete(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Subida de imagen para categoría
  const manejarSubidaImagenCategoria = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImagenCategoria(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Inserta un placeholder (%p% o %am%) en la posición del cursor del editor de comandos
  const insertarPlaceholder = (placeholder: string) => {
    const editor = refComandos.current;
    if (!editor) {
      setComandosPaquete((actual) => actual + placeholder);
      return;
    }
    const inicio = editor.selectionStart;
    const fin = editor.selectionEnd;
    const nuevo = comandosPaquete.slice(0, inicio) + placeholder + comandosPaquete.slice(fin);
    setComandosPaquete(nuevo);
    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(inicio + placeholder.length, inicio + placeholder.length);
    });
  };

  // Abrir creación de paquete con categoría opcionalmente preseleccionada
  const abrirCrearPaquete = (categoriaPrevia?: string) => {
    if (categoriaPrevia && categoriaPrevia !== ID_SIN_CATEGORIA) {
      setCatSeleccionada(categoriaPrevia);
    } else if (!categoriaPrevia && categorias.length > 0 && !catSeleccionada) {
      setCatSeleccionada(categorias[0].id);
    } else if (categoriaPrevia === ID_SIN_CATEGORIA) {
      setCatSeleccionada("");
    }
    setErrorForm("");
    setVistaActual("crear-paquete");
    setMenuAnadirAbierto(false);
  };

  // Abrir creación de categoría
  const abrirCrearCategoria = () => {
    setErrorForm("");
    setVistaActual("crear-categoria");
    setMenuAnadirAbierto(false);
  };

  // Guardar nuevo Paquete
  const manejarCrearPaquete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm("");

    const comandos = comandosPaquete
      .split("\n")
      .map((linea) => linea.trim())
      .filter(Boolean);

    if (!nombrePaquete.trim()) {
      setErrorForm("El nombre del paquete es obligatorio.");
      return;
    }
    if (!descPaquete.trim()) {
      setErrorForm("La descripción del paquete es obligatoria.");
      return;
    }
    if (!/^\d+(\.\d{1,7})?$/.test(precioPaquete.trim()) || Number(precioPaquete) <= 0) {
      setErrorForm("Ingresa un precio mayor a 0 (hasta 7 decimales).");
      return;
    }
    if (comandos.length === 0) {
      setErrorForm("Agrega al menos un comando para ejecutar cuando se complete el pago.");
      return;
    }

    setGuardando(true);
    try {
      const respuesta = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nombrePaquete.trim(),
          description: descPaquete.trim(),
          imageUrl: imagenPaquete || null,
          price: precioPaquete.trim(),
          currency: monedaPaquete,
          categoryId: catSeleccionada || null,
          commands: comandos,
        }),
      });

      if (!respuesta.ok) {
        setErrorForm(await leerError(respuesta, "No se pudo crear el paquete."));
        return;
      }

      const { package: nuevoPaquete }: { package: PackageDTO } = await respuesta.json();
      setPaquetes((actuales) => [nuevoPaquete, ...actuales]);
      setNombrePaquete("");
      setDescPaquete("");
      setImagenPaquete("");
      setPrecioPaquete("");
      setComandosPaquete("");
      setVistaActual("catalogo");
      mostrarExito(`¡Paquete "${nuevoPaquete.name}" creado exitosamente!`);
    } catch {
      setErrorForm("Error de conexión al crear el paquete.");
    } finally {
      setGuardando(false);
    }
  };

  // Guardar nueva Categoría
  const manejarCrearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm("");

    if (!nombreCategoria.trim()) {
      setErrorForm("El nombre de la categoría es obligatorio.");
      return;
    }
    if (!descCategoria.trim()) {
      setErrorForm("La descripción de la categoría es obligatoria.");
      return;
    }

    setGuardando(true);
    try {
      const respuesta = await fetch("/api/packages/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nombreCategoria.trim(),
          description: descCategoria.trim(),
          imageUrl: imagenCategoria || null,
        }),
      });

      if (!respuesta.ok) {
        setErrorForm(await leerError(respuesta, "No se pudo crear la categoría."));
        return;
      }

      const { category: nuevaCategoria }: { category: PackageCategoryDTO } = await respuesta.json();
      setCategorias((actuales) => [...actuales, nuevaCategoria]);
      setCatSeleccionada(nuevaCategoria.id);
      setNombreCategoria("");
      setDescCategoria("");
      setImagenCategoria("");
      setVistaActual("catalogo");
      mostrarExito(`¡Categoría "${nuevaCategoria.name}" creada exitosamente!`);
    } catch {
      setErrorForm("Error de conexión al crear la categoría.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarPaquete = async (paquete: PackageDTO) => {
    if (!window.confirm(`¿Eliminar el paquete "${paquete.name}"? Los pagos anteriores se conservan.`)) return;

    const respuesta = await fetch(`/api/packages/${encodeURIComponent(paquete.id)}`, { method: "DELETE" });
    if (respuesta.ok) {
      setPaquetes((actuales) => actuales.filter((p) => p.id !== paquete.id));
    } else {
      setErrorCarga(await leerError(respuesta, "No se pudo eliminar el paquete."));
    }
  };

  const eliminarCategoria = async (id: string, nombreCat: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${nombreCat}"? Sus paquetes quedarán sin categoría.`)) return;

    const respuesta = await fetch(`/api/packages/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (respuesta.ok) {
      setCategorias((actuales) => actuales.filter((c) => c.id !== id));
      setPaquetes((actuales) => actuales.map((p) => (p.categoryId === id ? { ...p, categoryId: null } : p)));
      if (catSeleccionada === id) setCatSeleccionada("");
    } else {
      setErrorCarga(await leerError(respuesta, "No se pudo eliminar la categoría."));
    }
  };

  return (
    <section className="w-full text-left">
      {/* Encabezado Superior: Título descriptivo y Botón del lado derecho "Añadir nuevo" */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-3">
            {vistaActual !== "catalogo" && (
              <button
                type="button"
                onClick={() => setVistaActual("catalogo")}
                className="w-8 h-8 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
                title="Volver al catálogo"
              >
                <i className="fa-solid fa-arrow-left text-xs"></i>
              </button>
            )}
            <h1 className="page-title text-2xl font-extrabold">
              {vistaActual === "catalogo"
                ? "Paquetes"
                : vistaActual === "crear-paquete"
                ? "Crea un Paquete"
                : "Crea una Categoría"}
            </h1>
          </div>
          <p className="page-subtitle text-xs sm:text-sm mt-1">
            {vistaActual === "catalogo"
              ? "Revisa cada categoría y los paquetes asociados antes de añadir nuevos artículos"
              : vistaActual === "crear-paquete"
              ? "Define los productos, beneficios y precios que tus clientes podrán adquirir en tu webstore"
              : "Crea una nueva categoría para organizar y agrupar tus paquetes"}
          </p>
        </div>

        {/* Botón del lado derecho: Añadir nuevo con menú desplegable (Categoría o Paquete) */}
        <div className="flex items-center gap-2 shrink-0">
          {vistaActual !== "catalogo" && (
            <button
              type="button"
              onClick={() => setVistaActual("catalogo")}
              className="px-3.5 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold text-xs transition-colors cursor-pointer"
            >
              Ver Catálogo
            </button>
          )}

          <div className="relative" ref={refMenuAnadir}>
            <button
              type="button"
              onClick={() => setMenuAnadirAbierto(!menuAnadirAbierto)}
              className="px-4 py-2 rounded-[4px] bg-[#095a86] hover:bg-[#07476b] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>Añadir nuevo</span>
              <i
                className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${
                  menuAnadirAbierto ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {/* Menú de opciones: Categoría o Paquete */}
            {menuAnadirAbierto && (
              <div className="absolute right-0 mt-2 w-48 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl p-1.5 z-50 animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={() => abrirCrearPaquete()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer"
                >
                  <i className="fa-solid fa-box-archive text-xs"></i>
                  <span>Paquete</span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirCrearCategoria()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-left transition-colors cursor-pointer mt-1"
                >
                  <i className="fa-solid fa-tags text-xs"></i>
                  <span>Categoría</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerta de Éxito Global */}
      {mensajeExito && (
        <div className="mb-6 p-3 rounded-[4px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-sm"></i>
          <span>{mensajeExito}</span>
        </div>
      )}

      {errorCarga && (
        <div className="mb-6 p-3 rounded-[4px] bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation text-sm"></i>
          <span>{errorCarga}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 1: CATÁLOGO DE CATEGORÍAS CON SUS PAQUETES         */}
      {/* "primero se vea cada categoria ya creada con su o sus     */}
      {/*  paquetes antes de acceder a crear mediante el boton"     */}
      {/* ======================================================== */}
      {vistaActual === "catalogo" && (
        <div className="flex flex-col gap-8">
          {cargando ? (
            <div className="p-12 text-center text-xs text-[var(--text-muted)]">
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              Cargando paquetes...
            </div>
          ) : grupos.length === 0 ? (
            <div className="p-12 text-center rounded-[6px] border border-dashed border-[var(--border-color)] bg-[var(--bg-card)]">
              <i className="fa-solid fa-layer-group text-3xl text-[var(--text-muted)] mb-3"></i>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                No hay categorías creadas
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4 max-w-sm mx-auto">
                Comienza creando tu primera categoría para organizar los paquetes de tu tienda.
              </p>
              <button
                type="button"
                onClick={() => abrirCrearCategoria()}
                className="px-4 py-2 rounded-[4px] bg-[#095a86] hover:bg-[#07476b] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Crear Primera Categoría
              </button>
            </div>
          ) : (
            grupos.map((cat) => {
              const paquetesDeCategoria = cat.paquetes;

              return (
                <div
                  key={cat.id}
                  className="rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs overflow-hidden"
                >
                  {/* Banner de la Categoría */}
                  <div className="p-4 sm:p-5 bg-[var(--bg-main)]/60 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {/* Miniatura / Icono de la categoría */}
                      <div className="w-12 h-12 rounded-[4px] overflow-hidden bg-[var(--bg-card)] border border-[var(--border-subtle)] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cat.imagen}
                          alt={cat.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-[var(--text-primary)]">
                            {cat.nombre}
                          </h2>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] bg-[var(--accent-gray)]/10 text-[var(--text-primary)] border border-[var(--border-color)]">
                            {paquetesDeCategoria.length} {paquetesDeCategoria.length === 1 ? "paquete" : "paquetes"}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                          {cat.descripcion}
                        </p>
                      </div>
                    </div>

                    {/* Acciones para la categoría: Botón de 3 puntitos desplegable */}
                    <div className="relative self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setMenuCatAbierto(menuCatAbierto === cat.id ? null : cat.id)}
                        className="w-8 h-8 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                        title="Opciones de categoría"
                        aria-label="Opciones de categoría"
                      >
                        <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
                      </button>

                      {/* Menú desplegable de 3 puntitos */}
                      {menuCatAbierto === cat.id && (
                        <div className="absolute right-0 mt-1.5 w-44 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl p-1 z-30 animate-in fade-in duration-100">
                          <button
                            type="button"
                            onClick={() => {
                              setMenuCatAbierto(null);
                              abrirCrearPaquete(cat.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-[3px] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-left cursor-pointer transition-colors"
                          >
                            <i className="fa-solid fa-plus text-[10px]"></i>
                            <span>Añadir paquete</span>
                          </button>
                          {!cat.esVirtual && (
                            <button
                              type="button"
                              onClick={() => {
                                setMenuCatAbierto(null);
                                eliminarCategoria(cat.id, cat.nombre);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-[3px] text-xs font-semibold text-red-500 hover:bg-red-500/10 text-left cursor-pointer transition-colors mt-0.5"
                            >
                              <i className="fa-solid fa-trash-can text-[10px]"></i>
                              <span>Eliminar categoría</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Listado / Cuadros de los paquetes de esta categoría */}
                  <div className="p-4 sm:p-5">
                    {paquetesDeCategoria.length === 0 ? (
                      <div className="p-6 text-center rounded-[4px] border border-dashed border-[var(--border-color)] bg-[var(--bg-main)]/30">
                        <p className="text-xs text-[var(--text-muted)] mb-2">
                          No hay paquetes registrados en la categoría {cat.nombre}.
                        </p>
                        <button
                          type="button"
                          onClick={() => abrirCrearPaquete(cat.id)}
                          className="text-xs font-bold text-[var(--accent-gray)] hover:underline cursor-pointer"
                        >
                          + Crear el primer paquete para esta categoría
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {paquetesDeCategoria.map((paq) => (
                          <div
                            key={paq.id}
                            className="p-4 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] hover:border-[var(--text-secondary)] transition-all flex flex-col justify-between group"
                          >
                            <div>
                              {/* Fila superior: Título y Botón eliminar (X roja) separados para evitar superposición */}
                              <div className="flex items-start justify-between gap-2 mb-2.5">
                                <h4 className="text-xs font-bold text-[var(--text-primary)] truncate" title={paq.name}>
                                  {paq.name}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => eliminarPaquete(paq)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-500/10 p-1 rounded-[4px] transition-colors cursor-pointer shrink-0"
                                  title="Eliminar paquete"
                                >
                                  <i className="fa-solid fa-xmark text-xs"></i>
                                </button>
                              </div>

                              {/* Imagen del paquete (con ancho controlado/menos ancha para no superponerse a la X) */}
                              <div className="w-40 max-w-full h-28 mx-auto rounded-[4px] overflow-hidden bg-[var(--bg-card)] border border-[var(--border-subtle)] mb-3 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={paq.imageUrl ?? IMAGEN_PAQUETE_DEFECTO}
                                  alt={paq.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              {/* Descripción */}
                              <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-3">
                                {paq.description}
                              </p>
                            </div>

                            {/* Pie de tarjeta: precio y cantidad de comandos */}
                            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                              <span className="text-xs font-extrabold text-[var(--text-primary)]">
                                {paq.price} {paq.currency}
                              </span>
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-[3px] bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] inline-flex items-center gap-1"
                                title={paq.commands?.join("\n")}
                              >
                                <i className="fa-solid fa-terminal text-[9px]"></i>
                                {paq.commands?.length ?? 0} {paq.commands?.length === 1 ? "comando" : "comandos"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: CREA UN PAQUETE                                 */}
      {/* Requerimiento: precio abajo de categoria                 */}
      {/* ======================================================== */}
      {vistaActual === "crear-paquete" && (
        <div className="max-w-2xl mx-auto panel p-6 sm:p-8 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Datos del Nuevo Paquete
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Completa los campos para publicar un nuevo paquete en tu tienda
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVistaActual("catalogo")}
              className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          {errorForm && (
            <div className="mb-4 p-3 rounded-[4px] bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-sm"></i>
              <span>{errorForm}</span>
            </div>
          )}

          <form onSubmit={manejarCrearPaquete} className="flex flex-col gap-4">
            {/* 1. Nombre */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Nombre del Paquete
              </label>
              <input
                type="text"
                placeholder="Ej. Paquete Diamante Deluxe"
                value={nombrePaquete}
                onChange={(e) => setNombrePaquete(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent-gray)] transition-colors"
              />
            </div>

            {/* 2. Descripción */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Descripción
              </label>
              <textarea
                rows={3}
                placeholder="Describe los beneficios, objetos incluidos o características de este paquete..."
                value={descPaquete}
                onChange={(e) => setDescPaquete(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent-gray)] transition-colors resize-none"
              />
            </div>

            {/* 3. Imagen */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Imagen del Paquete
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={manejarSubidaImagenPaquete}
                  id="subir-imagen-paquete"
                  className="hidden"
                />
                <label
                  htmlFor="subir-imagen-paquete"
                  className="w-full sm:w-auto px-4 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-upload text-xs"></i>
                  <span>Subir Imagen</span>
                </label>

                <input
                  type="url"
                  placeholder="O pega una URL de imagen (https://...)"
                  value={imagenPaquete}
                  onChange={(e) => setImagenPaquete(e.target.value)}
                  className="flex-1 w-full px-3 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent-gray)] transition-colors"
                />
              </div>

              {/* Vista previa de imagen */}
              {imagenPaquete && (
                <div className="mt-2 relative w-full h-44 rounded-[4px] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-main)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagenPaquete} alt="Vista previa paquete" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagenPaquete("")}
                    className="absolute top-2 right-2 p-1 rounded-[4px] bg-black/70 text-white text-xs hover:bg-black transition-colors cursor-pointer"
                    title="Eliminar imagen"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Categoría */}
            <div className="flex flex-col gap-1 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Categoría
                </label>
                <button
                  type="button"
                  onClick={() => abrirCrearCategoria()}
                  className="text-[11px] text-[var(--accent-gray)] hover:underline font-semibold cursor-pointer"
                >
                  + Crear nueva categoría
                </button>
              </div>
              <select
                value={catSeleccionada}
                onChange={(e) => setCatSeleccionada(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent-gray)] transition-colors cursor-pointer"
              >
                <option value="">Sin categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Precio y activo (ABAJO de categoría según requerimiento explícito) */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Precio
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="19.99"
                  value={precioPaquete}
                  onChange={(e) => setPrecioPaquete(e.target.value)}
                  required
                  className="flex-1 w-full px-3 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent-gray)] transition-colors"
                />
                <select
                  value={monedaPaquete}
                  onChange={(e) => setMonedaPaquete(e.target.value)}
                  aria-label="Activo con el que se cobra"
                  className="w-28 px-3 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs font-bold focus:outline-none focus:border-[var(--accent-gray)] transition-colors cursor-pointer"
                >
                  {PACKAGE_CURRENCIES.map((moneda) => (
                    <option key={moneda} value={moneda}>
                      {moneda}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Es el monto exacto que se cobrará en Stellar al comprar el paquete.
              </p>
            </div>

            {/* 6. Comandos a ejecutar en el servidor al completarse el pago */}
            <div className="flex flex-col gap-1 text-left">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="comandos-paquete"
                  className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Comandos
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => insertarPlaceholder("%p%")}
                    className="px-2 py-0.5 rounded-[3px] border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] text-[10px] font-mono font-bold text-[var(--text-primary)] cursor-pointer"
                    title="Nombre del jugador que compró"
                  >
                    + %p%
                  </button>
                  <button
                    type="button"
                    onClick={() => insertarPlaceholder("%am%")}
                    className="px-2 py-0.5 rounded-[3px] border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] text-[10px] font-mono font-bold text-[var(--text-primary)] cursor-pointer"
                    title="Monto que pagó el jugador"
                  >
                    + %am%
                  </button>
                </div>
              </div>
              <textarea
                id="comandos-paquete"
                ref={refComandos}
                rows={5}
                spellCheck={false}
                placeholder={"lp user %p% parent add vip\ngive %p% diamond 64\nbroadcast %p% apoyó al servidor con %am% XLM"}
                value={comandosPaquete}
                onChange={(e) => setComandosPaquete(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs font-mono focus:outline-none focus:border-[var(--accent-gray)] transition-colors resize-y"
              />
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Un comando por línea, sin la <code>/</code> inicial. Se ejecutan en la consola de tu servidor, en
                orden, cuando se confirma el pago. <code className="font-bold">%p%</code> se reemplaza por el
                nombre del jugador y <code className="font-bold">%am%</code> por el monto pagado.
              </p>
            </div>

            {/* Botón de Enviar */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 py-2.5 px-4 rounded-[4px] bg-[#095a86] hover:bg-[#07476b] text-white font-bold text-xs shadow cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-plus text-xs"></i>
                <span>{guardando ? "Creando..." : "Crear Paquete"}</span>
              </button>
              <button
                type="button"
                onClick={() => setVistaActual("catalogo")}
                className="py-2.5 px-4 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 3: CREA UNA CATEGORÍA                              */}
      {/* Requerimiento: nombre, descripcion, imagen y boton crear */}
      {/* ======================================================== */}
      {vistaActual === "crear-categoria" && (
        <div className="max-w-2xl mx-auto panel p-6 sm:p-8 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Datos de la Nueva Categoría
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Define una nueva categoría para agrupar paquetes en tu catálogo
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVistaActual("catalogo")}
              className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          {errorForm && (
            <div className="mb-4 p-3 rounded-[4px] bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-sm"></i>
              <span>{errorForm}</span>
            </div>
          )}

          <form onSubmit={manejarCrearCategoria} className="flex flex-col gap-4">
            {/* 1. Nombre */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Nombre de la Categoría
              </label>
              <input
                type="text"
                placeholder="Ej. Armas y Equipamiento, Suscripciones VIP..."
                value={nombreCategoria}
                onChange={(e) => setNombreCategoria(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent-gray)] transition-colors"
              />
            </div>

            {/* 2. Descripción */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Descripción
              </label>
              <textarea
                rows={3}
                placeholder="Describe el tipo de artículos o beneficios que pertenecerán a esta categoría..."
                value={descCategoria}
                onChange={(e) => setDescCategoria(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent-gray)] transition-colors resize-none"
              />
            </div>

            {/* 3. Imagen */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Imagen de la Categoría
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={manejarSubidaImagenCategoria}
                  id="subir-imagen-categoria"
                  className="hidden"
                />
                <label
                  htmlFor="subir-imagen-categoria"
                  className="w-full sm:w-auto px-4 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-upload text-xs"></i>
                  <span>Subir Imagen</span>
                </label>

                <input
                  type="url"
                  placeholder="O pega una URL de imagen (https://...)"
                  value={imagenCategoria}
                  onChange={(e) => setImagenCategoria(e.target.value)}
                  className="flex-1 w-full px-3 py-2 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent-gray)] transition-colors"
                />
              </div>

              {/* Vista previa de imagen */}
              {imagenCategoria && (
                <div className="mt-2 relative w-full h-44 rounded-[4px] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-main)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagenCategoria} alt="Vista previa categoría" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagenCategoria("")}
                    className="absolute top-2 right-2 p-1 rounded-[4px] bg-black/70 text-white text-xs hover:bg-black transition-colors cursor-pointer"
                    title="Eliminar imagen"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Botón Crear */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 py-2.5 px-4 rounded-[4px] bg-[#095a86] hover:bg-[#07476b] text-white font-bold text-xs shadow cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-check text-xs"></i>
                <span>{guardando ? "Creando..." : "Crear Categoría"}</span>
              </button>
              <button
                type="button"
                onClick={() => setVistaActual("catalogo")}
                className="py-2.5 px-4 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
