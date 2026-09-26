"use client";

import React, { useState } from "react";

export default function Hero() {
  const [tabActiva, setTabActiva] = useState<"faq" | "why">("faq");
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);

  const preguntasFrecuentes = [
    {
      pregunta: "¿Cómo se entregan los rangos y productos en el juego?",
      respuesta:
        "La entrega es 100% automática. Al confirmar el pago, nuestro plugin o RCON ejecuta los comandos en tu servidor en cuestión de segundos.",
    },
    {
      pregunta: "¿Qué métodos de pago puedo ofrecer a mis jugadores?",
      respuesta:
        "Aceptamos tarjetas de crédito/débito, transferencias locales (como Mercado Pago) y criptomonedas con conversión automática.",
    },
    {
      pregunta: "¿Necesito conocimientos de programación para configurarlo?",
      respuesta:
        "No. Todo se gestiona desde un panel intuitivo y visual, listo para conectar tu tienda sin escribir código.",
    },
    {
      pregunta: "¿Cuándo recibo el dinero de mis ventas?",
      respuesta:
        "Los fondos se acreditan directamente en tus cuentas vinculadas según cada pasarela de pago, sin retenciones innecesarias.",
    },
  ];

  const beneficios = [
    "Entregas automáticas las 24/7 sin soporte manual",
    "Protección y validación anti-fraudes en cada transacción",
    "Panel analítico con métricas de ventas e ingresos en tiempo real",
  ];

  return (
    <section className="hero">
      <div className="hero-bg-glow"></div>

      <div className="hero-text">
        <h1>
          Tu flujo de pagos <span>sin complicaciones</span>
        </h1>
        <p>
          Infraestructura moderna de pagos y entregas automáticas: cobra a tus jugadores, activa sus rangos en segundos y
          mantén el control total de tus ingresos desde un solo lugar.
        </p>
      </div>

      <div className="api-intro">
        <h2>Preguntas Frecuentes</h2>
        <p>Resuelve todas tus dudas sobre la monetización y automatización de tu servidor.</p>
      </div>

      <div className="interactive-container">
        <div className="mode-switch">
          <button
            type="button"
            className={`switch-btn ${tabActiva === "faq" ? "active" : ""}`}
            id="tabFaq"
            onClick={() => setTabActiva("faq")}
          >
            Preguntas Frecuentes
          </button>
          <button
            type="button"
            className={`switch-btn ${tabActiva === "why" ? "active" : ""}`}
            id="tabWhyCoinstellation"
            onClick={() => setTabActiva("why")}
          >
            ¿Por qué Coinstellation?
          </button>
        </div>

        <div
          className={`landing-panel ${tabActiva === "faq" ? "active" : ""}`}
          id="panelFaq"
        >
          <div className="faq-list">
            {preguntasFrecuentes.map((item, indice) => {
              const estaAbierta = faqAbierta === indice;

              return (
                <div className={`faq-item ${estaAbierta ? "is-open" : ""}`} key={item.pregunta}>
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={estaAbierta}
                    aria-controls={`faq-answer-${indice}`}
                    onClick={() => setFaqAbierta(estaAbierta ? null : indice)}
                  >
                    <span>{item.pregunta}</span>
                    <span className="faq-icon" aria-hidden="true">
                      {estaAbierta ? "−" : "+"}
                    </span>
                  </button>
                  <div className="faq-answer" id={`faq-answer-${indice}`} hidden={!estaAbierta}>
                    <p>{item.respuesta}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`landing-panel ${tabActiva === "why" ? "active" : ""}`}
          id="panelWhyCoinstellation"
        >
          <ul className="benefits-list">
            {beneficios.map((beneficio) => (
              <li key={beneficio}>
                <span className="benefit-icon" aria-hidden="true">✓</span>
                <span>{beneficio}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
}
