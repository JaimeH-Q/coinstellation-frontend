"use client";

import { useState } from "react";

export default function Costos() {
  const [montoVenta, setMontoVenta] = useState<string>("100");

  const montoNumerico = parseFloat(montoVenta);
  const valorValido = !isNaN(montoNumerico) && montoNumerico >= 0 ? montoNumerico : 0;

  const comisionCoinst = valorValido * 0.01;
  const totalNeto = valorValido - comisionCoinst;

  return (
    <section className="coin-costs" id="pricing" aria-label="Costos y comisiones de Coinstellation">
      <div className="coin-costs-header">
        <h2>Costos y Comisiones</h2>
        <p className="coin-costs-copy">
          Sin suscripciones mensuales ni costos ocultos. Solo pagás por lo que procesás.
        </p>
      </div>

      {/* TARJETAS PRINCIPALES */}
      <div className="coin-costs-grid">
        {/* Tarjeta 1: CoinStellation */}
        <article className="coin-cost-card">
          <span className="cost-tag">CoinStellation</span>
          <div className="cost-amount-wrapper">
            <span className="cost-value">1%</span>
            <span className="cost-unit">por transacción</span>
          </div>
          <p className="cost-desc">
            Comisión fija por el uso de la plataforma, tiendas online e infraestructura de pagos.
          </p>
        </article>

        {/* Tarjeta 2: Red Stellar */}
        <article className="coin-cost-card">
          <span className="cost-tag">Red Stellar</span>
          <div className="cost-amount-wrapper">
            <span className="cost-value">
              0.000005 <small>XLM</small>
            </span>
          </div>
          <p className="cost-desc">
            Costo de red ultra bajo ejecutado directamente en la blockchain de Stellar.
          </p>
        </article>
      </div>

      {/* CALCULADORA DE SIMULACIÓN */}
      <div className="cost-calc-container">
        <h3>Simula tu tarifa en tiempo real</h3>
        <p className="calc-sub">
          Ingresa el monto de tu venta para calcular el desglose exacto de la operación.
        </p>

        <div className="calc-box">
          <div className="calc-input-group">
            <label htmlFor="saleAmount">Monto de la venta ($ USD)</label>
            <div className="input-prefix-wrapper">
              <span className="prefix">$</span>
              <input
                type="number"
                id="saleAmount"
                value={montoVenta}
                min="0"
                step="0.5"
                placeholder="100"
                onChange={(e) => setMontoVenta(e.target.value)}
              />
            </div>
          </div>

          <div className="calc-results-grid">
            <div className="calc-res-item">
              <span>Comisión CoinStellation (1%)</span>
              <strong id="feeCoinst">${comisionCoinst.toFixed(2)} USD</strong>
            </div>
            <div className="calc-res-item">
              <span>Comisión Red Stellar</span>
              <strong id="feeStellar">0.000005 XLM</strong>
            </div>
            <div className="calc-res-item total-item">
              <span>Recibes neto aproximado</span>
              <strong id="netAmount">${totalNeto.toFixed(2)} USD</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
