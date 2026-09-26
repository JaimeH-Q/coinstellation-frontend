"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

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

  return (
    <header>
      <div className="logo">
        <div className="logo-icon">C</div>
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
              className={`dropdown-medium ${
                dropdownActivo === "productsDropdown" ? "is-open" : ""
              }`}
              id="productsDropdown"
              onMouseEnter={() => mantenerDropdownAbierto("productsDropdown")}
              onMouseLeave={programarCierreDropdown}
            ></div>
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
              className={`dropdown-medium ${
                dropdownActivo === "solutionsDropdown" ? "is-open" : ""
              }`}
              id="solutionsDropdown"
              onMouseEnter={() => mantenerDropdownAbierto("solutionsDropdown")}
              onMouseLeave={programarCierreDropdown}
            ></div>
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
              className={`dropdown-medium ${
                dropdownActivo === "developersDropdown" ? "is-open" : ""
              }`}
              id="developersDropdown"
              onMouseEnter={() => mantenerDropdownAbierto("developersDropdown")}
              onMouseLeave={programarCierreDropdown}
            ></div>
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
              className={`dropdown-medium ${
                dropdownActivo === "pricingDropdown" ? "is-open" : ""
              }`}
              id="pricingDropdown"
              onMouseEnter={() => mantenerDropdownAbierto("pricingDropdown")}
              onMouseLeave={programarCierreDropdown}
            ></div>
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