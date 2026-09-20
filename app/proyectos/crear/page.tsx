"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TipoProyecto, Proyecto } from "@/components/dashboard/SeccionProyectos";

// Divisas disponibles
type Divisa = "USD - U.S. Dollar" | "EUR - Euro" | "GBP - Pound Sterling";

// Tipos de negocio / Tu proyecto
interface OpcionProyecto {
  id: TipoProyecto;
  titulo: string;
  descripcion: string;
  icono: string;
}

const OPCIONES_PROYECTO: OpcionProyecto[] = [
  {
    id: "Opero un servidor de juegos",
    titulo: "Opero un servidor de juegos",
    descripcion: "Para servidores multijugador, redes de comunidades y servidores dedicados.",
    icono: "fa-solid fa-server",
  },
  {
    id: "Modelador o creador de activos",
    titulo: "Modelador o creador de activos",
    descripcion: "Para creadores de modelos 3D, mapas, texturas y assets digitales.",
    icono: "fa-solid fa-cubes",
  },
  {
    id: "Vendedor de claves de juego",
    titulo: "Vendedor de claves de juego",
    descripcion: "Para distribución de licencias de activación Steam, Epic Games y consolas.",
    icono: "fa-solid fa-key",
  },
  {
    id: "Monetizar mi propio juego aplicacion o sitio web",
    titulo: "Monetizar mi propio juego aplicación o sitio web",
    descripcion: "Para desarrolladores independientes con juegos propios o aplicaciones web.",
    icono: "fa-solid fa-coins",
  },
  {
    id: "Plataforma de mercado",
    titulo: "Plataforma de mercado",
    descripcion: "Para marketplaces de compraventa entre usuarios y creadores de contenido.",
    icono: "fa-solid fa-store",
  },
  {
    id: "Venta de productos fisicos",
    titulo: "Venta de productos físicos",
    descripcion: "Para merchandising oficial, ropa, periféricos y artículos físicos de marca.",
    icono: "fa-solid fa-box-open",
  },
];

// Juegos disponibles para servidores
interface JuegoServidor {
  id: string;
  nombre: string;
  badge?: string;
  icono: string;
  imagen: string;
}

const JUEGOS_DISPONIBLES: JuegoServidor[] = [
  {
    id: "minecraft",
    nombre: "Minecraft",
    badge: "Más Popular",
    icono: "fa-solid fa-cube",
    imagen: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "rust",
    nombre: "Rust",
    icono: "fa-solid fa-fire",
    imagen: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ark",
    nombre: "ARK: Survival Evolved",
    icono: "fa-solid fa-dragon",
    imagen: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "cs2",
    nombre: "Counter-Strike 2 (CS2)",
    icono: "fa-solid fa-crosshairs",
    imagen: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "gmod",
    nombre: "Garry's Mod",
    icono: "fa-solid fa-wrench",
    imagen: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "unturned",
    nombre: "Unturned",
    icono: "fa-solid fa-skull",
    imagen: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "terraria",
    nombre: "Terraria",
    icono: "fa-solid fa-tree",
    imagen: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "fivem",
    nombre: "FiveM / GTA V",
    icono: "fa-solid fa-car",
    imagen: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "valheim",
    nombre: "Valheim",
    icono: "fa-solid fa-shield",
    imagen: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80",
  },
];

// Opciones de plataforma Minecraft
interface PlataformaMinecraft {
  id: string;
  titulo: string;
  subtitulo: string;
  icono: string;
}

const PLATAFORMAS_MINECRAFT: PlataformaMinecraft[] = [
  {
    id: "Minecraft edicion Java",
    titulo: "Minecraft edición Java",
    subtitulo: "Para jugadores en PC con Java Edition. Admite Paper, Spigot, Bukkit, Purpur y mods Fabric/Forge.",
    icono: "fa-solid fa-cube",
  },
  {
    id: "Minecraft (Bedrock)",
    titulo: "Minecraft (Bedrock)",
    subtitulo: "Para jugadores en consolas (Xbox, PlayStation, Switch), dispositivos móviles y Windows 10/11.",
    icono: "fa-solid fa-mobile-screen",
  },
  {
    id: "Minecraft (sin conexion/geiser)",
    titulo: "Minecraft (sin conexión / Geyser)",
    subtitulo: "Compatibilidad crossplay simultánea de cuentas Java y Bedrock a través del protocolo GeyserMC.",
    icono: "fa-solid fa-network-wired",
  },
];

export default function CrearProyectoPage() {
  const router = useRouter();

  // Paso actual del asistente (1, 2 o 3)
  const [pasoActual, setPasoActual] = useState<number>(1);

  // Datos del Paso 1
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [divisa, setDivisa] = useState<Divisa>("USD - U.S. Dollar");
  const [tipoProyecto, setTipoProyecto] = useState<TipoProyecto>("Opero un servidor de juegos");
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [errorPaso1, setErrorPaso1] = useState("");

  // Datos del Paso 2 (Selecciona tu juego)
  const [juegoSeleccionado, setJuegoSeleccionado] = useState<string>("minecraft");

  // Datos del Paso 3 (Plataforma de Minecraft)
  const [plataformaMinecraft, setPlataformaMinecraft] = useState<string>("Minecraft edicion Java");

  // Modal de confirmación final
  const [modalConfirmarAbierto, setModalConfirmarAbierto] = useState(false);

  // Manejador Continuar desde Paso 1
  const manejarContinuarPaso1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPaso1("");

    if (!nombreProyecto.trim()) {
      setErrorPaso1("Por favor ingresa un nombre para el proyecto.");
      return;
    }
    if (!aceptoTerminos) {
      setErrorPaso1("Debes aceptar el acuerdo de creador de Coinstellation para continuar.");
      return;
    }

    setPasoActual(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Manejador Continuar desde Paso 2
  const manejarContinuarPaso2 = () => {
    // Si eligió Minecraft pasa a seleccionar plataforma Minecraft, o si eligió otro pasa con la configuración respectiva
    setPasoActual(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Manejador Continuar desde Paso 3 (Abre la ventana emergente solicitada)
  const manejarContinuarPaso3 = () => {
    setModalConfirmarAbierto(true);
  };

  // Confirmar creación definitiva del proyecto
  const manejarConfirmarCreacion = () => {
    const slug = nombreProyecto.trim().toLowerCase().replace(/\s+/g, "-");
    const nuevoProyecto: Proyecto = {
      id: "proy-" + Date.now(),
      nombre: nombreProyecto.trim(),
      tipo: tipoProyecto,
      webstoreUrl: `https://webstore.coinstellation.com/${slug}`,
      creadoEn: new Date().toLocaleDateString("es-ES"),
    };

    if (typeof window !== "undefined") {
      const guardados = localStorage.getItem("coinstellation_proyectos_lista");
      let lista: Proyecto[] = [];
      if (guardados) {
        try {
          lista = JSON.parse(guardados);
        } catch {
          lista = [];
        }
      }
      localStorage.setItem("coinstellation_proyectos_lista", JSON.stringify([nuevoProyecto, ...lista]));
    }

    setModalConfirmarAbierto(false);
    // Redirigir al dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col selection:bg-neutral-800 selection:text-white">
      {/* Header fijo con fondo negro, logo y título Coinstellation */}
      <header className="w-full border-b border-[#222226] px-6 py-3.5 sticky top-0 z-40 bg-black/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-[22px] h-[22px] rounded-[6px] bg-[var(--accent-gray)] flex items-center justify-center text-white font-extrabold text-[11px]">
              C
            </div>
            <span className="font-extrabold tracking-tight text-white text-base">coinstellation</span>
          </Link>

          <Link
            href="/dashboard"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-[4px] border border-[#26262c] hover:border-neutral-600 bg-[#111114]"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
            <span>Salir</span>
          </Link>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* ======================================================== */}
        {/* PASO 1: Formulario Inicial de Detalles del Proyecto       */}
        {/* ======================================================== */}
        {pasoActual === 1 && (
          <div className="animate-in fade-in duration-200">
            {/* Título Principal */}
            <div className="mb-8 text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1.5">
                Crear Proyecto
              </h1>
              <p className="text-neutral-400 text-xs sm:text-sm">
                Cuéntanos algunos detalles para continuar.
              </p>
            </div>

            {errorPaso1 && (
              <div className="mb-6 p-3.5 rounded-[4px] bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center gap-2.5 text-left">
                <i className="fa-solid fa-circle-exclamation text-sm shrink-0"></i>
                <span>{errorPaso1}</span>
              </div>
            )}

            <form onSubmit={manejarContinuarPaso1} className="flex flex-col gap-7 text-left">
              {/* Cuadro 1: Nombre del proyecto */}
              <div className="p-6 rounded-[6px] border border-[#26262e] bg-[#0e0e12] flex flex-col gap-2">
                <label className="text-sm font-bold text-white">
                  Nombre del proyecto
                </label>
                <p className="text-xs text-neutral-400 mb-2">
                  Esto se mostrará durante el pago, en su tienda y en los recibos de pago
                </p>
                <input
                  type="text"
                  placeholder="Ej. Servidor Mythic Network"
                  value={nombreProyecto}
                  onChange={(e) => setNombreProyecto(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-[4px] border border-[#2d2d38] bg-[#15151b] text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-neutral-300 transition-colors"
                />
              </div>

              {/* Cuadro 2: Divisa */}
              <div className="p-6 rounded-[6px] border border-[#26262e] bg-[#0e0e12] flex flex-col gap-2">
                <label className="text-sm font-bold text-white">
                  Divisa
                </label>
                <p className="text-xs text-neutral-400 mb-3">
                  Puede vender en otras monedas, sin embargo, esta se establecerá como predeterminada y se utilizará en informes
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(["USD - U.S. Dollar", "EUR - Euro", "GBP - Pound Sterling"] as Divisa[]).map((moneda) => (
                    <button
                      key={moneda}
                      type="button"
                      onClick={() => setDivisa(moneda)}
                      className={`p-3.5 rounded-[4px] border text-left flex items-center justify-between transition-all cursor-pointer ${
                        divisa === moneda
                          ? "border-white bg-[#1c1c24] text-white shadow-xs"
                          : "border-[#2a2a35] bg-[#14141a] text-neutral-400 hover:border-neutral-500 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-bold">{moneda}</span>
                      {divisa === moneda && (
                        <i className="fa-solid fa-circle-check text-xs text-white"></i>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuadro 3: Tu Proyecto (diferentes tipos de negocios en cuadros uno al lado del otro) */}
              <div className="p-6 rounded-[6px] border border-[#26262e] bg-[#0e0e12] flex flex-col gap-2">
                <label className="text-sm font-bold text-white">
                  Tu Proyecto
                </label>
                <p className="text-xs text-neutral-400 mb-4">
                  Elige la opción que te defina a ti o a tu negocio con mayor precisión
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {OPCIONES_PROYECTO.map((opcion) => {
                    const seleccionado = tipoProyecto === opcion.id;
                    return (
                      <div
                        key={opcion.id}
                        onClick={() => setTipoProyecto(opcion.id)}
                        className={`p-4 rounded-[4px] border transition-all cursor-pointer flex flex-col justify-between ${
                          seleccionado
                            ? "border-white bg-[#1c1c24] shadow-md ring-1 ring-white/20"
                            : "border-[#282834] bg-[#131319] hover:border-neutral-500 hover:bg-[#181820]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-[4px] flex items-center justify-center text-sm ${
                            seleccionado ? "bg-white text-black" : "bg-[#20202a] text-neutral-300"
                          }`}>
                            <i className={opcion.icono}></i>
                          </div>
                          {seleccionado && (
                            <i className="fa-solid fa-circle-check text-xs text-white"></i>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white mb-1.5 leading-snug">
                          {opcion.titulo}
                        </h4>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          {opcion.descripcion}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Check list al final */}
              <div className="p-4 rounded-[6px] border border-[#26262e] bg-[#0e0e12] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terminos-creador"
                  checked={aceptoTerminos}
                  onChange={(e) => setAceptoTerminos(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded-[3px] accent-white cursor-pointer"
                />
                <label htmlFor="terminos-creador" className="text-xs text-neutral-300 cursor-pointer select-none leading-relaxed">
                  He leído y acepto el acuerdo de creador de Coinstellation y las cláusulas contractuales.
                </label>
              </div>

              {/* Botones de navegación inferiores */}
              <div className="flex items-center justify-between pt-4 border-t border-[#222228]">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="px-6 py-2.5 rounded-[4px] border border-[#33333e] bg-[#121216] hover:bg-[#1a1a20] text-neutral-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-[4px] bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASO 2: Selecciona tu juego                              */}
        {/* ======================================================== */}
        {pasoActual === 2 && (
          <div className="animate-in fade-in duration-200 text-left">
            {/* Título Principal */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1.5">
                Selecciona tu juego
              </h1>
              <p className="text-neutral-400 text-xs sm:text-sm">
                Selecciona el juego para el cual está diseñado tu servidor de juegos
              </p>
            </div>

            {/* Cuadro que dice selecciona el tipo de juego */}
            <div className="p-6 rounded-[6px] border border-[#26262e] bg-[#0e0e12] mb-8">
              <label className="text-sm font-bold text-white block mb-1">
                Selecciona el tipo de juego en el que alojas un servidor de juegos
              </label>
              <p className="text-xs text-neutral-400 mb-6">
                Configuraremos automáticamente los plugins, webhooks y la integración del catálogo para este juego
              </p>

              {/* Cuadrícula de varios juegos (con Minecraft obligatorio) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {JUEGOS_DISPONIBLES.map((juego) => {
                  const seleccionado = juegoSeleccionado === juego.id;
                  return (
                    <div
                      key={juego.id}
                      onClick={() => setJuegoSeleccionado(juego.id)}
                      className={`relative rounded-[4px] border overflow-hidden transition-all cursor-pointer flex flex-col ${
                        seleccionado
                          ? "border-white bg-[#1c1c24] ring-2 ring-white/30 shadow-lg scale-[1.01]"
                          : "border-[#2a2a36] bg-[#14141b] hover:border-neutral-500 hover:bg-[#191922]"
                      }`}
                    >
                      {/* Imagen representativa */}
                      <div className="w-full h-28 overflow-hidden relative bg-neutral-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={juego.imagen}
                          alt={juego.nombre}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#14141b] via-transparent to-transparent"></div>

                        {juego.badge && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-[3px] bg-emerald-500 text-black text-[10px] font-extrabold uppercase tracking-wide">
                            {juego.badge}
                          </span>
                        )}

                        {seleccionado && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px] shadow">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        )}
                      </div>

                      {/* Nombre del juego */}
                      <div className="p-3.5 flex items-center gap-2.5">
                        <i className={`${juego.icono} text-xs text-neutral-400`}></i>
                        <span className="text-xs font-bold text-white">{juego.nombre}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botones de navegación inferiores */}
            <div className="flex items-center justify-between pt-4 border-t border-[#222228]">
              <button
                type="button"
                onClick={() => setPasoActual(1)}
                className="px-6 py-2.5 rounded-[4px] border border-[#33333e] bg-[#121216] hover:bg-[#1a1a20] text-neutral-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={manejarContinuarPaso2}
                className="px-8 py-2.5 rounded-[4px] bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASO 3: Seleccione su plataforma de servidor de Minecraft */}
        {/* ======================================================== */}
        {pasoActual === 3 && (
          <div className="animate-in fade-in duration-200 text-left">
            {/* Título Principal */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1.5">
                Seleccione su plataforma de servidor de Minecraft
              </h1>
              <p className="text-neutral-400 text-xs sm:text-sm">
                Cuéntanos qué tipo de jugadores pueden unirse a su servidor de Minecraft
              </p>
            </div>

            {/* Cuadro: Tipo de servidor de Minecraft con las 3 opciones */}
            <div className="p-6 rounded-[6px] border border-[#26262e] bg-[#0e0e12] mb-8">
              <label className="text-sm font-bold text-white block mb-1">
                Tipo de servidor de Minecraft
              </label>
              <p className="text-xs text-neutral-400 mb-6">
                Elige la arquitectura que mejor coincida con tu servidor para sincronizar paquetes y comandos en tiempo real
              </p>

              <div className="flex flex-col gap-4">
                {PLATAFORMAS_MINECRAFT.map((plat) => {
                  const seleccionada = plataformaMinecraft === plat.id;
                  return (
                    <div
                      key={plat.id}
                      onClick={() => setPlataformaMinecraft(plat.id)}
                      className={`p-5 rounded-[4px] border transition-all cursor-pointer flex items-start gap-4 ${
                        seleccionada
                          ? "border-white bg-[#1a1a22] ring-1 ring-white/20 shadow-md"
                          : "border-[#2a2a35] bg-[#131319] hover:border-neutral-500 hover:bg-[#171720]"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-[4px] flex items-center justify-center text-sm shrink-0 mt-0.5 ${
                        seleccionada ? "bg-white text-black" : "bg-[#22222d] text-neutral-300"
                      }`}>
                        <i className={plat.icono}></i>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-white">{plat.titulo}</h4>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
                            seleccionada ? "border-white bg-white text-black" : "border-neutral-600"
                          }`}>
                            {seleccionada && <i className="fa-solid fa-check"></i>}
                          </div>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          {plat.subtitulo}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botones de navegación inferiores */}
            <div className="flex items-center justify-between pt-4 border-t border-[#222228]">
              <button
                type="button"
                onClick={() => setPasoActual(2)}
                className="px-6 py-2.5 rounded-[4px] border border-[#33333e] bg-[#121216] hover:bg-[#1a1a20] text-neutral-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={manejarContinuarPaso3}
                className="px-8 py-2.5 rounded-[4px] bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Continuar
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* VENTANA EMERGENTE DE CONFIRMACIÓN REQUERIDA             */}
      {/* "¿Estás seguro de crear un proyecto de (tipo elegido)?" */}
      {/* "Una vez creado el proyecto, no podrás convertirlo a    */}
      {/*  otro juego. Tendrás que volver aquí y crear uno nuevo." */}
      {/* ======================================================== */}
      {modalConfirmarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full rounded-[6px] border border-[#33333f] bg-[#111116] shadow-2xl p-6 text-left relative">
            {/* Icono de Advertencia */}
            <div className="w-12 h-12 rounded-[4px] bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>

            {/* Título de la ventana emergente */}
            <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
              ¿Estás seguro de crear un proyecto de {plataformaMinecraft}?
            </h3>

            {/* Texto de advertencia exacto */}
            <p className="text-xs text-neutral-300 mb-6 leading-relaxed">
              Una vez creado el proyecto, no podrás convertirlo a otro juego. Tendrás que volver aquí y crear uno nuevo.
            </p>

            {/* Resumen de configuración del proyecto */}
            <div className="p-3.5 rounded-[4px] bg-[#181820] border border-[#262632] mb-6 flex flex-col gap-1.5 text-xs text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Proyecto:</span>
                <span className="font-bold text-white">{nombreProyecto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Moneda:</span>
                <span className="font-bold text-white">{divisa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Juego / Plataforma:</span>
                <span className="font-bold text-white">{plataformaMinecraft}</span>
              </div>
            </div>

            {/* Botones: Cancelar y Confirmar */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalConfirmarAbierto(false)}
                className="px-4 py-2 rounded-[4px] border border-[#363644] bg-[#16161c] hover:bg-[#1f1f28] text-neutral-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={manejarConfirmarCreacion}
                className="px-5 py-2 rounded-[4px] bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-colors cursor-pointer shadow"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
