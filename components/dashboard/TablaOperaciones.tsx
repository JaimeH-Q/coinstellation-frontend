import React from "react";

export interface Operacion {
  id: string;
  objetoEvento: string;
  nodo: string;
  prioridad: "Alta" | "Normal" | "Baja";
}

interface TablaOperacionesProps {
  operaciones?: Operacion[];
  alHacerClicVerTodas?: () => void;
}

// Datos de prueba por defecto (los mismos del diseño original)
const OPERACIONES_POR_DEFECTO: Operacion[] = [
  { id: "TX-98421", objetoEvento: "Filtro_Drop_Raro.yaml", nodo: "Nodo-Alpha-01", prioridad: "Alta" },
  { id: "TX-98420", objetoEvento: "AutoTransfer_Gem_04", nodo: "Nodo-Beta-03", prioridad: "Normal" },
  { id: "TX-98419", objetoEvento: "Sync_Auction_Items", nodo: "Nodo-Alpha-02", prioridad: "Baja" },
  { id: "TX-98418", objetoEvento: "RuleUpdate_Weapon_V2", nodo: "Nodo-Gamma-01", prioridad: "Alta" },
  { id: "TX-98417", objetoEvento: "CleanCache_Filter_Logs", nodo: "Nodo-Beta-01", prioridad: "Normal" },
];

/**
 * Componente TablaOperaciones
 * 
 * ¿Cómo funciona en React?
 * - En vez de escribir 5 bloques `<tr>` idénticos a mano, definimos una lista de datos (`operaciones`)
 *   y usamos la función `.map()` de JavaScript.
 * - Siempre que renderizamos listas en React debemos proveer un `key` único (en este caso `operacion.id`)
 *   para que React identifique qué elementos cambiaron o se eliminaron de manera eficiente.
 */
export default function TablaOperaciones({
  operaciones = OPERACIONES_POR_DEFECTO,
  alHacerClicVerTodas,
}: TablaOperacionesProps) {
  // Función auxiliar para obtener la clase CSS según el nivel de prioridad
  const obtenerClaseBadge = (prioridad: Operacion["prioridad"]) => {
    switch (prioridad) {
      case "Alta":
        return "badge-alta";
      case "Normal":
        return "badge-normal";
      case "Baja":
        return "badge-baja";
      default:
        return "";
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Ultimas Operaciones del ItemFilter</h2>
        <button
          type="button"
          onClick={alHacerClicVerTodas}
          className="panel-action cursor-pointer bg-transparent border-none"
        >
          Ver todas <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      <div className="table-container">
        <table className="operations-table">
          <thead>
            <tr>
              <th>ID Transaccion</th>
              <th>Objeto / Evento</th>
              <th>Nodo</th>
              <th>Prioridad</th>
            </tr>
          </thead>
          <tbody>
            {operaciones.map((op) => (
              <tr key={op.id}>
                <td className="tx-id">{op.id}</td>
                <td>{op.objetoEvento}</td>
                <td>{op.nodo}</td>
                <td>
                  <span className={`badge ${obtenerClaseBadge(op.prioridad)}`}>
                    {op.prioridad}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
