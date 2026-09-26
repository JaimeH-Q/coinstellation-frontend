"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface NavbarProps {
  esModoClaro: boolean;
  onAlternarTema: () => void;
  onAbrirRegistro?: () => void;
}

export default function Navbar({
  esModoClaro,
  onAlternarTema,
  onAbrirRegistro,
}: NavbarProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [dropdownActivo, setDropdownActivo] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const cierreDropdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cerrar dropdown al hacer click fuera o presionar Escape
  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setDropdownActivo(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownActivo(null);
        setMenuAbierto(false);
      }
    };

    document.addEventListener("click", handleClickFuera);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClickFuera);
      document.removeEventListener("keydown", handleKeyDown);
      if (cierreDropdownRef.current) {
        clearTimeout(cierreDropdownRef.current);
      }
    };
  }, []);

  const cancelarCierreDropdown = () => {
    if (cierreDropdownRef.current) {
      clearTimeout(cierreDropdownRef.current);
      cierreDropdownRef.current = null;
    }
  };

  const programarCierreDropdown = () => {
    cancelarCierreDropdown();
    cierreDropdownRef.current = setTimeout(() => {
      setDropdownActivo(null);
      cierreDropdownRef.current = null;
    }, 300);
  };

  const mantenerDropdownAbierto = (id: string) => {
    cancelarCierreDropdown();
    setDropdownActivo(id);
  };

  const alternarDropdown = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cancelarCierreDropdown();
    setDropdownActivo((actual) => (actual === id ? null : id));
  };

  const cerrarTodo = () => {
    cancelarCierreDropdown();
    setDropdownActivo(null);
    setMenuAbierto(false);
  };

  return (
    <header>
      <div className="logo">
        <Image
          className="logo-icon logo-image"
          src="/coinstellation_logo_ai.png"
          alt=""
          width={32}
          height={32}
        />
        Coinstellation
      </div>

      <button
        className={`nav-toggle ${menuAbierto ? "is-open" : ""}`}
        type="button"
        aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuAbierto}
        aria-controls="mainNav"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav
        id="mainNav"
        ref={navRef}
        className={menuAbierto ? "is-open" : ""}
      >
        <ul>
          {/* PRODUCTOS */}
          <li
            className="products-nav-item dropdown-nav-item"
            onMouseEnter={() => mantenerDropdownAbierto("productsDropdown")}
            onMouseLeave={programarCierreDropdown}
          >
            <a
              href="#coin-services"
              className="dropdown-trigger"
              data-dropdown="productsDropdown"
              aria-expanded={dropdownActivo === "productsDropdown"}
              aria-controls="productsDropdown"
              onClick={(e) => alternarDropdown("productsDropdown", e)}
            >
              Productos
            </a>
            <div
              className={`dropdown-medium ${dropdownActivo === "productsDropdown" ? "is-open" : ""
                }`}
              id="productsDropdown"
              onMouseEnter={() => mantenerDropdownAbierto("productsDropdown")}
              onMouseLeave={programarCierreDropdown}
            >
              <div className="menu-grid-2col">
                <div className="menu-group">
                  <h2>Tienda Online</h2>
                  <a href="#webstores" onClick={cerrarTodo}>
                    <strong>Webstores</strong>
                    <span>Crea tu plataforma de venta personalizada</span>
                  </a>
                  <a href="#catalog" onClick={cerrarTodo}>
                    <strong>Catálogo Digital</strong>
                    <span>Gestión de productos y activos digitales</span>
                  </a>
                </div>
                <div className="menu-group">
                  <h2>Pagos</h2>
                  <a href="#stellar-gateway" onClick={cerrarTodo}>
                    <strong>Pasarela Stellar</strong>
                    <span>Procesa pagos globales</span>
                  </a>
                  <a href="#payment-links" onClick={cerrarTodo}>
                    <strong>Enlaces de Pago</strong>
                    <span>Cobra sin necesidad de código</span>
                  </a>
                </div>
              </div>
              <aside className="card-highlight">
                <span>Coinstellation</span>
                <h2>Coinstation 2026</h2>
                <p>Descubre la nueva infraestructura para tiendas y pagos.</p>
                <a href="#create-store" onClick={cerrarTodo}>
                  Crear Tienda <span aria-hidden="true">&gt;</span>
                </a>
              </aside>
            </div>
          </li>

          {/* SOLUCIONES */}
          <li
            className="dropdown-nav-item"
            onMouseEnter={() => mantenerDropdownAbierto("solutionsDropdown")}
            onMouseLeave={programarCierreDropdown}
          >
            <a
              href="#solutions"
              className="dropdown-trigger"
              data-dropdown="solutionsDropdown"
              aria-expanded={dropdownActivo === "solutionsDropdown"}
              aria-controls="solutionsDropdown"
              onClick={(e) => alternarDropdown("solutionsDropdown", e)}
            >
              Soluciones
            </a>
            <div
              className={`dropdown-medium ${dropdownActivo === "solutionsDropdown" ? "is-open" : ""
                }`}
              id="solutionsDropdown"
              onMouseEnter={() => mantenerDropdownAbierto("solutionsDropdown")}
              onMouseLeave={programarCierreDropdown}
            >
              <div className="menu-grid-2col">
                <div className="menu-group">
                  <h2>Para Creadores</h2>
                  <a href="#digital-content" onClick={cerrarTodo}>
                    <strong>Venta de Contenido Digital</strong>
                    <span>Convierte tu contenido en ingresos</span>
                  </a>
                  <a href="#memberships" onClick={cerrarTodo}>
                    <strong>Membresías</strong>
                    <span>Ofrece acceso exclusivo a tu comunidad</span>
                  </a>
                </div>
                <div className="menu-group">
                  <h2>Para Negocios</h2>
                  <a href="#global-commerce" onClick={cerrarTodo}>
                    <strong>Comercio Global</strong>
                    <span>Vende a clientes en cualquier lugar</span>
                  </a>
                  <a href="#recurring-payments" onClick={cerrarTodo}>
                    <strong>Pagos Recurrentes</strong>
                    <span>Automatiza tus cobros</span>
                  </a>
                </div>
              </div>
              <aside className="card-highlight">
                <span>Coinstellation</span>
                <h2>Casos de Uso</h2>
                <p>Diseñado para adaptarse a cualquier modelo digital.</p>
                <a href="#use-cases" onClick={cerrarTodo}>
                  Explorar <span aria-hidden="true">&gt;</span>
                </a>
              </aside>
            </div>
          </li>

          {/* DESARROLLADORES */}
          <li
            className="dropdown-nav-item"
            onMouseEnter={() => mantenerDropdownAbierto("developersDropdown")}
            onMouseLeave={programarCierreDropdown}
          >
            <a
              href="#documentation"
              className="dropdown-trigger"
              data-dropdown="developersDropdown"
              aria-expanded={dropdownActivo === "developersDropdown"}
              aria-controls="developersDropdown"
              onClick={(e) => alternarDropdown("developersDropdown", e)}
            >
              Desarrolladores
            </a>
            <div
              className={`dropdown-medium ${dropdownActivo === "developersDropdown" ? "is-open" : ""
                }`}
              id="developersDropdown"
              onMouseEnter={() => mantenerDropdownAbierto("developersDropdown")}
              onMouseLeave={programarCierreDropdown}
            >
              <div className="menu-grid-2col">
                <div className="menu-group">
                  <h2>Comenzar</h2>
                  <a href="#quickstart" onClick={cerrarTodo}>
                    <strong>Guía de Inicio Rápido</strong>
                    <span>Construye tu primera integración</span>
                  </a>
                  <a href="#api-reference" onClick={cerrarTodo}>
                    <strong>Referencia de la API</strong>
                    <span>Consulta endpoints y parámetros</span>
                  </a>
                </div>
                <div className="menu-group">
                  <h2>Herramientas</h2>
                  <a href="#sdk" onClick={cerrarTodo}>
                    <strong>SDK &amp; Bibliotecas</strong>
                    <span>Acelera tu desarrollo</span>
                  </a>
                  <a href="#webhooks" onClick={cerrarTodo}>
                    <strong>Webhooks</strong>
                    <span>Recibe eventos en tiempo real</span>
                  </a>
                </div>
              </div>
              <aside className="card-highlight">
                <span>Coinstellation</span>
                <h2>Developer Hub</h2>
                <p>Entorno de pruebas Sandbox disponible.</p>
                <a href="#developer-hub" onClick={cerrarTodo}>
                  Visitar Hub <span aria-hidden="true">&gt;</span>
                </a>
              </aside>
            </div>
          </li>

          {/* PRECIOS */}
          <li
            className="dropdown-nav-item"
            onMouseEnter={() => mantenerDropdownAbierto("pricingDropdown")}
            onMouseLeave={programarCierreDropdown}
          >
            <a
              href="#pricing"
              className="dropdown-trigger"
              data-dropdown="pricingDropdown"
              aria-expanded={dropdownActivo === "pricingDropdown"}
              aria-controls="pricingDropdown"
              onClick={(e) => alternarDropdown("pricingDropdown", e)}
            >
              Precios
            </a>
            <div
              className={`dropdown-medium ${dropdownActivo === "pricingDropdown" ? "is-open" : ""
                }`}
              id="pricingDropdown"
              onMouseEnter={() => mantenerDropdownAbierto("pricingDropdown")}
              onMouseLeave={programarCierreDropdown}
            >
              <div className="menu-grid-2col">
                <div className="menu-group">
                  <h2>Planes</h2>
                  <a href="#starter-plan" onClick={cerrarTodo}>
                    <strong>Starter</strong>
                    <span>Herramientas esenciales para comenzar</span>
                  </a>
                  <a href="#creator-plan" onClick={cerrarTodo}>
                    <strong>Creator</strong>
                    <span>Más capacidad para tiendas en crecimiento</span>
                  </a>
                </div>
                <div className="menu-group">
                  <h2>Incluido</h2>
                  <a href="#online-store" onClick={cerrarTodo}>
                    <strong>Tienda Online</strong>
                    <span>Publica tu catálogo y empieza a vender</span>
                  </a>
                  <a href="#stellar-payments" onClick={cerrarTodo}>
                    <strong>Pagos Stellar</strong>
                    <span>Procesa transacciones globales</span>
                  </a>
                </div>
              </div>
              <aside className="card-highlight">
                <span>Planes Coinstellation</span>
                <h2>Comienza gratis</h2>
                <p>Elige el plan ideal para hacer crecer tu proyecto digital.</p>
                <a href="#start-now" onClick={cerrarTodo}>
                  Ver planes <span aria-hidden="true">&gt;</span>
                </a>
              </aside>
            </div>
          </li>
        </ul>
      </nav>

      <div className="nav-actions">
        <button
          type="button"
          onClick={onAlternarTema}
          className="header-action-btn cursor-pointer"
          id="themeToggle"
          aria-label={esModoClaro ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
          aria-pressed={!esModoClaro}
          title={esModoClaro ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
        >
          <i className={esModoClaro ? "fa-solid fa-moon" : "fa-solid fa-sun"}></i>
        </button>

        <Link href="/login" className="btn-login">
          Iniciar sesión
        </Link>

        <button
          type="button"
          className="btn-primary"
          onClick={onAbrirRegistro}
        >
          Crear Tienda
        </button>
      </div>
    </header>
  );
}
