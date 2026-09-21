"use client";

import React, { useState } from "react";

interface Servicio {
  id: number;
  icono: string;
  titulo: string;
  descripcion: string;
}

const servicios: Servicio[] = [
  {
    id: 0,
    icono: "▦",
    titulo: "TIENDA ONLINE",
    descripcion:
      "Creá una tienda personalizada para vender rangos, kits, monedas, cosméticos y mucho más.",
  },
  {
    id: 1,
    icono: "$",
    titulo: "PAGOS Y MONETIZACIÓN",
    descripcion:
      "Gestioná tus ventas y ofrecé a tu comunidad una experiencia de compra rápida y sencilla.",
  },
  {
    id: 2,
    icono: "↗",
    titulo: "ENTREGA AUTOMÁTICA",
    descripcion:
      "Entregá automáticamente los productos comprados directamente a tus jugadores.",
  },
  {
    id: 3,
    icono: "⌁",
    titulo: "GESTIÓN DE SERVIDORES",
    descripcion:
      "Administrá tus servidores, jugadores y estado desde un único panel.",
  },
  {
    id: 4,
    icono: "◌",
    titulo: "ESTADÍSTICAS",
    descripcion:
      "Conocé tus ventas, ingresos, jugadores y crecimiento mediante estadísticas detalladas.",
  },
];

export default function Servicios() {
  const [indiceActivo, setIndiceActivo] = useState(0);

  const obtenerPosicion = (index: number) => {
    const total = servicios.length;
    const diferencia = (index - indiceActivo + total) % total;
    if (diferencia === 0) return "active";
    if (diferencia === 1) return "next";
    if (diferencia === total - 1) return "prev";
    return "hidden";
  };

  const moverCarrusel = (direccion: number) => {
    const total = servicios.length;
    setIndiceActivo((actual) => (actual + direccion + total) % total);
  };

  return (
    <section
      className="coin-services"
      aria-label="Servicios principales de Coinstellation"
    >
      <h2 className="coin-services-title">
        Todo lo que necesitas para hacer crecer tu servidor
      </h2>

      <div className="coin-services-carousel">
        <button
          type="button"
          className="coin-services-control"
          id="coin-services-prev"
          aria-label="Servicio anterior"
          onClick={() => moverCarrusel(-1)}
        >
          &lt;
        </button>

        <div className="coin-services-track">
          {servicios.map((servicio, index) => {
            const posicion = obtenerPosicion(index);
            return (
              <article
                key={servicio.id}
                className={`coin-service-card ${posicion}`}
                data-service-index={index}
                tabIndex={0}
                role="button"
                aria-label={`Ver ${servicio.titulo}`}
                aria-hidden={posicion === "hidden"}
                onClick={() => {
                  if (posicion === "prev") moverCarrusel(-1);
                  if (posicion === "next") moverCarrusel(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") moverCarrusel(-1);
                  if (e.key === "ArrowRight") moverCarrusel(1);
                  if (e.key === "Enter" && posicion !== "active") {
                    moverCarrusel(posicion === "prev" ? -1 : 1);
                  }
                }}
              >
                <div className="coin-service-icon">{servicio.icono}</div>
                <h3>{servicio.titulo}</h3>
                <p>{servicio.descripcion}</p>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className="coin-services-control"
          id="coin-services-next"
          aria-label="Siguiente servicio"
          onClick={() => moverCarrusel(1)}
        >
          &gt;
        </button>
      </div>
    </section>
  );
}
