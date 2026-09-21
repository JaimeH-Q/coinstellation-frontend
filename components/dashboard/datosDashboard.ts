import { TipoRangoTiempo } from "./SelectorTiempo";
import { DatosGraficoLineas } from "./GraficoLineasEvolucion";
import { DatosDistribucion } from "./GraficoDonasMetodosYPaquetes";
import { TarjetaEstadisticaProps } from "./TarjetaEstadistica";

export interface DatosCompletosDashboard {
  kpis: TarjetaEstadisticaProps[];
  graficoLineas: DatosGraficoLineas;
  graficoDonas: DatosDistribucion;
}

export function obtenerDatosDashboard(
  rango: TipoRangoTiempo,
  fechaSeleccionada: Date = new Date()
): DatosCompletosDashboard {
  switch (rango) {
    case "hoy": {
      return {
        kpis: [
          {
            titulo: "Ingresos netos",
            valor: "$4,820.50",
            tendencia: "+12.8%",
            descripcion: "vs. ayer a esta hora",
            icono: "fa-solid fa-dollar-sign",
          },
          {
            titulo: "Pedidos completados",
            valor: "62",
            tendencia: "+8.1%",
            descripcion: "hoy",
            icono: "fa-solid fa-cart-shopping",
          },
          {
            titulo: "Valor medio del pedido",
            valor: "$77.75",
            tendencia: "+4.3%",
            descripcion: "ticket promedio",
            icono: "fa-solid fa-receipt",
          },
          {
            titulo: "Tasa de conversión",
            valor: "3.65%",
            tendencia: "+0.4%",
            descripcion: "visitas a pedidos",
            icono: "fa-solid fa-arrow-trend-up",
          },
        ],
        graficoLineas: {
          etiquetas: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "Ahora"],
          ingresos: [180, 90, 120, 450, 920, 1150, 840, 680, 390],
          pedidos: [2, 1, 2, 6, 12, 15, 11, 8, 5],
          totalIngresos: "$4,820.50",
          totalPedidos: 62,
        },
        graficoDonas: {
          metodosPago: [
            { nombre: "PayPal", porcentaje: 44, monto: "$2,121.00", color: "#095a86" },
            { nombre: "Stripe", porcentaje: 30, monto: "$1,446.15", color: "#0284c7" },
            { nombre: "Pix / OXXO", porcentaje: 18, monto: "$867.70", color: "#10b981" },
            { nombre: "Cripto / Otros", porcentaje: 8, monto: "$385.65", color: "#f59e0b" },
          ],
          categoriasPaquetes: [
            { nombre: "Rangos VIP", porcentaje: 48, monto: "$2,313.84", color: "#095a86" },
            { nombre: "Cosméticos", porcentaje: 25, monto: "$1,205.12", color: "#8b5cf6" },
            { nombre: "Monedas / Gemas", porcentaje: 17, monto: "$819.50", color: "#ec4899" },
            { nombre: "Pases de Batalla", porcentaje: 10, monto: "$482.04", color: "#10b981" },
          ],
        },
      };
    }

    case "ayer": {
      return {
        kpis: [
          {
            titulo: "Ingresos netos",
            valor: "$5,240.00",
            tendencia: "+6.5%",
            descripcion: "vs. mismo día sem. pasada",
            icono: "fa-solid fa-dollar-sign",
          },
          {
            titulo: "Pedidos completados",
            valor: "68",
            tendencia: "+4.2%",
            descripcion: "cerrados ayer",
            icono: "fa-solid fa-cart-shopping",
          },
          {
            titulo: "Valor medio del pedido",
            valor: "$77.05",
            tendencia: "+2.2%",
            descripcion: "ticket promedio",
            icono: "fa-solid fa-receipt",
          },
          {
            titulo: "Tasa de conversión",
            valor: "3.51%",
            tendencia: "+0.2%",
            descripcion: "visitas a pedidos",
            icono: "fa-solid fa-arrow-trend-up",
          },
        ],
        graficoLineas: {
          etiquetas: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "23:59"],
          ingresos: [210, 130, 80, 380, 890, 1240, 1020, 810, 480],
          pedidos: [3, 2, 1, 5, 11, 16, 14, 10, 6],
          totalIngresos: "$5,240.00",
          totalPedidos: 68,
        },
        graficoDonas: {
          metodosPago: [
            { nombre: "PayPal", porcentaje: 42, monto: "$2,200.80", color: "#095a86" },
            { nombre: "Stripe", porcentaje: 32, monto: "$1,676.80", color: "#0284c7" },
            { nombre: "Pix / OXXO", porcentaje: 19, monto: "$995.60", color: "#10b981" },
            { nombre: "Cripto / Otros", porcentaje: 7, monto: "$366.80", color: "#f59e0b" },
          ],
          categoriasPaquetes: [
            { nombre: "Rangos VIP", porcentaje: 45, monto: "$2,358.00", color: "#095a86" },
            { nombre: "Cosméticos", porcentaje: 27, monto: "$1,414.80", color: "#8b5cf6" },
            { nombre: "Monedas / Gemas", porcentaje: 18, monto: "$943.20", color: "#ec4899" },
            { nombre: "Pases de Batalla", porcentaje: 10, monto: "$524.00", color: "#10b981" },
          ],
        },
      };
    }

    case "mes": {
      return {
        kpis: [
          {
            titulo: "Ingresos netos",
            valor: "$184,350.00",
            tendencia: "+18.6%",
            descripcion: "vs. mes anterior",
            icono: "fa-solid fa-dollar-sign",
          },
          {
            titulo: "Pedidos completados",
            valor: "2,095",
            tendencia: "+11.4%",
            descripcion: "acumulado del mes",
            icono: "fa-solid fa-cart-shopping",
          },
          {
            titulo: "Valor medio del pedido",
            valor: "$88.00",
            tendencia: "+6.4%",
            descripcion: "ticket promedio",
            icono: "fa-solid fa-receipt",
          },
          {
            titulo: "Tasa de conversión",
            valor: "3.94%",
            tendencia: "+0.7%",
            descripcion: "visitas a pedidos",
            icono: "fa-solid fa-arrow-trend-up",
          },
        ],
        graficoLineas: {
          etiquetas: ["Semana 1", "Semana 2", "Semana 3", "Semana 4", "Semana 5"],
          ingresos: [34200, 41500, 38900, 45600, 24150],
          pedidos: [388, 471, 442, 518, 276],
          totalIngresos: "$184,350.00",
          totalPedidos: 2095,
        },
        graficoDonas: {
          metodosPago: [
            { nombre: "PayPal", porcentaje: 45, monto: "$82,957.50", color: "#095a86" },
            { nombre: "Stripe", porcentaje: 30, monto: "$55,305.00", color: "#0284c7" },
            { nombre: "Pix / OXXO", porcentaje: 18, monto: "$33,183.00", color: "#10b981" },
            { nombre: "Cripto / Otros", porcentaje: 7, monto: "$12,904.50", color: "#f59e0b" },
          ],
          categoriasPaquetes: [
            { nombre: "Rangos VIP", porcentaje: 47, monto: "$86,644.50", color: "#095a86" },
            { nombre: "Cosméticos", porcentaje: 25, monto: "$46,087.50", color: "#8b5cf6" },
            { nombre: "Monedas / Gemas", porcentaje: 18, monto: "$33,183.00", color: "#ec4899" },
            { nombre: "Pases de Batalla", porcentaje: 10, monto: "$18,435.00", color: "#10b981" },
          ],
        },
      };
    }

    case "personalizado": {
      const dia = fechaSeleccionada.getDate();
      const mes = fechaSeleccionada.getMonth() + 1;
      const baseMult = (dia % 5) + 1;
      const totalIng = 4200 + baseMult * 580;
      const totalPed = 50 + baseMult * 8;
      const aov = (totalIng / totalPed).toFixed(2);

      return {
        kpis: [
          {
            titulo: "Ingresos netos",
            valor: `$${totalIng.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            tendencia: "+9.4%",
            descripcion: `el ${dia}/${mes}/${fechaSeleccionada.getFullYear()}`,
            icono: "fa-solid fa-dollar-sign",
          },
          {
            titulo: "Pedidos completados",
            valor: totalPed.toString(),
            tendencia: "+6.2%",
            descripcion: "completados en el día",
            icono: "fa-solid fa-cart-shopping",
          },
          {
            titulo: "Valor medio del pedido",
            valor: `$${aov}`,
            tendencia: "+3.0%",
            descripcion: "ticket promedio",
            icono: "fa-solid fa-receipt",
          },
          {
            titulo: "Tasa de conversión",
            valor: "3.72%",
            tendencia: "+0.3%",
            descripcion: "visitas a pedidos",
            icono: "fa-solid fa-arrow-trend-up",
          },
        ],
        graficoLineas: {
          etiquetas: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "23:59"],
          ingresos: [
            Math.round(totalIng * 0.04),
            Math.round(totalIng * 0.02),
            Math.round(totalIng * 0.03),
            Math.round(totalIng * 0.1),
            Math.round(totalIng * 0.22),
            Math.round(totalIng * 0.26),
            Math.round(totalIng * 0.17),
            Math.round(totalIng * 0.11),
            Math.round(totalIng * 0.05),
          ],
          pedidos: [
            Math.max(1, Math.round(totalPed * 0.04)),
            Math.max(1, Math.round(totalPed * 0.02)),
            Math.max(1, Math.round(totalPed * 0.03)),
            Math.max(2, Math.round(totalPed * 0.1)),
            Math.max(3, Math.round(totalPed * 0.22)),
            Math.max(4, Math.round(totalPed * 0.26)),
            Math.max(3, Math.round(totalPed * 0.17)),
            Math.max(2, Math.round(totalPed * 0.11)),
            Math.max(1, Math.round(totalPed * 0.05)),
          ],
          totalIngresos: `$${totalIng.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          totalPedidos: totalPed,
        },
        graficoDonas: {
          metodosPago: [
            { nombre: "PayPal", porcentaje: 43, monto: `$${(totalIng * 0.43).toFixed(2)}`, color: "#095a86" },
            { nombre: "Stripe", porcentaje: 31, monto: `$${(totalIng * 0.31).toFixed(2)}`, color: "#0284c7" },
            { nombre: "Pix / OXXO", porcentaje: 18, monto: `$${(totalIng * 0.18).toFixed(2)}`, color: "#10b981" },
            { nombre: "Cripto / Otros", porcentaje: 8, monto: `$${(totalIng * 0.08).toFixed(2)}`, color: "#f59e0b" },
          ],
          categoriasPaquetes: [
            { nombre: "Rangos VIP", porcentaje: 46, monto: `$${(totalIng * 0.46).toFixed(2)}`, color: "#095a86" },
            { nombre: "Cosméticos", porcentaje: 26, monto: `$${(totalIng * 0.26).toFixed(2)}`, color: "#8b5cf6" },
            { nombre: "Monedas / Gemas", porcentaje: 18, monto: `$${(totalIng * 0.18).toFixed(2)}`, color: "#ec4899" },
            { nombre: "Pases de Batalla", porcentaje: 10, monto: `$${(totalIng * 0.1).toFixed(2)}`, color: "#10b981" },
          ],
        },
      };
    }

    case "7dias":
    default: {
      return {
        kpis: [
          {
            titulo: "Ingresos netos",
            valor: "$45,210.00",
            tendencia: "+14.2%",
            descripcion: "vs. 7 días anteriores",
            icono: "fa-solid fa-dollar-sign",
          },
          {
            titulo: "Pedidos completados",
            valor: "524",
            tendencia: "+9.8%",
            descripcion: "últimos 7 días",
            icono: "fa-solid fa-cart-shopping",
          },
          {
            titulo: "Valor medio del pedido",
            valor: "$86.27",
            tendencia: "+4.0%",
            descripcion: "promedio por compra",
            icono: "fa-solid fa-receipt",
          },
          {
            titulo: "Tasa de conversión",
            valor: "3.82%",
            tendencia: "+0.5%",
            descripcion: "visitas a pedidos",
            icono: "fa-solid fa-arrow-trend-up",
          },
        ],
        graficoLineas: {
          etiquetas: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
          ingresos: [4200, 5100, 4800, 6300, 8900, 9400, 6510],
          pedidos: [48, 59, 56, 73, 102, 109, 77],
          totalIngresos: "$45,210.00",
          totalPedidos: 524,
        },
        graficoDonas: {
          metodosPago: [
            { nombre: "PayPal", porcentaje: 42, monto: "$18,988.20", color: "#095a86" },
            { nombre: "Stripe", porcentaje: 31, monto: "$14,015.10", color: "#0284c7" },
            { nombre: "Pix / OXXO", porcentaje: 19, monto: "$8,589.90", color: "#10b981" },
            { nombre: "Cripto / Otros", porcentaje: 8, monto: "$3,616.80", color: "#f59e0b" },
          ],
          categoriasPaquetes: [
            { nombre: "Rangos VIP", porcentaje: 46, monto: "$20,796.60", color: "#095a86" },
            { nombre: "Cosméticos", porcentaje: 26, monto: "$11,754.60", color: "#8b5cf6" },
            { nombre: "Monedas / Gemas", porcentaje: 18, monto: "$8,137.80", color: "#ec4899" },
            { nombre: "Pases de Batalla", porcentaje: 10, monto: "$4,521.00", color: "#10b981" },
          ],
        },
      };
    }
  }
}
