"use client";

import React, { useState } from "react";

interface Transaccion {
  id: string;
  text: string;
  amount: string;
  status: string;
}

const transaccionesIniciales: Transaccion[] = [
  { id: "1", text: "USDC → Wallet", amount: "+$24.99", status: "Approved" },
  { id: "2", text: "API Call /checkout", amount: "2.1s", status: "Synced" },
  { id: "3", text: "KYC Validation", amount: "Passed", status: "Verified" },
];

export default function Hero() {
  const [tabActiva, setTabActiva] = useState<"dev" | "store">("dev");
  const [transacciones, setTransacciones] = useState<Transaccion[]>(transaccionesIniciales);

  const agregarTransaccion = (texto: string) => {
    const nuevaTx: Transaccion = {
      id: Date.now().toString(),
      text: texto,
      amount: "+$24.99",
      status: "Approved",
    };
    setTransacciones((prev) => [nuevaTx, ...prev].slice(0, 5));
  };

  return (
    <section className="hero">
      <div className="hero-bg-glow"></div>
      
      <div className="hero-text">
        <h1>
          Tu flujo de pagos <span>sin fricción</span>
        </h1>
        <p>
          Una infraestructura moderna para aceptar pagos, activar servicios y
          conectar experiencias digitales con rapidez, claridad y control.
        </p>
        <div className="hero-cta">
          <button
            type="button"
            className="btn-primary"
            id="btnTriggerPayment"
            onClick={() => agregarTransaccion("Demo Payment Triggered")}
          >
            Simular pago
          </button>
          <a href="#documentation" className="btn-secondary">
            Ver documentación
          </a>
        </div>
      </div>

      <div className="api-intro">
        <h2>Integra Coinstellation en minutos</h2>
        <p>Procesa pagos Stellar desde tu aplicación.</p>
      </div>

      <div className="interactive-container">
        <div className="mode-switch">
          <button
            type="button"
            className={`switch-btn ${tabActiva === "dev" ? "active" : ""}`}
            id="tabDev"
            onClick={() => setTabActiva("dev")}
          >
            Developer API
          </button>
          <button
            type="button"
            className={`switch-btn ${tabActiva === "store" ? "active" : ""}`}
            id="tabStore"
            onClick={() => setTabActiva("store")}
          >
            Webstore Preview
          </button>
        </div>

        {/* Panel Desarrollador */}
        <div
          className={`landing-panel ${tabActiva === "dev" ? "active" : ""}`}
          id="panelDev"
        >
          <div className="panel-layout">
            <div className="visual-box">
              <div className="visual-header">
                <span className="status-dot"></span>
                <span>API ready</span>
              </div>
              <div className="visual-grid">
                <div className="visual-item">
                  <label>Key</label>
                  <strong>cs_live_99</strong>
                </div>
                <div className="visual-item">
                  <label>Route</label>
                  <strong>/checkout</strong>
                </div>
                <div className="visual-item wide">
                  <label>Result</label>
                  <strong>Approved • $24.99 USD</strong>
                </div>
              </div>
            </div>

            <div className="code-column">
              <div className="mini-code-box">
                <pre>
                  <code>{`import { Coinstellation } from '@coinstellation/sdk';

const pay = new Coinstellation({ apiKey: 'cs_live_99' });

await pay.checkout.process({
  amount: 24.99,
  currency: 'USD'
});`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Vista Previa Tienda */}
        <div
          className={`landing-panel ${tabActiva === "store" ? "active" : ""}`}
          id="panelStore"
        >
          <div className="store-item">
            <div className="store-info">
              <h4>Cosmic Pass V2</h4>
              <p>Instant activation • Global access</p>
            </div>
            <strong className="price">$24.99 USD</strong>
          </div>
          <button
            type="button"
            className="btn-primary buy-button"
            id="buyButton"
            onClick={() => agregarTransaccion("Checkout / Cosmic Pass V2")}
          >
            Buy Now with Coinstellation
          </button>
        </div>

        {/* Feed de Actividad en Red en Vivo */}
        <div className="live-feed">
          <div className="live-title">
            <span>Live Network Activity</span>
            <span className="transaction-count" id="txCount">
              {transacciones.length} transaction
              {transacciones.length === 1 ? "" : "s"}
            </span>
          </div>
          <ul className="tx-list" id="txList">
            {transacciones.map((item) => (
              <li key={item.id} className="tx-item">
                <span>{item.text}</span>
                <div className="tx-status">
                  <span>{item.status}</span>
                  <span>{item.amount}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
