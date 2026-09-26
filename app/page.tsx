"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Roadmap from "@/components/landing/Roadmap";
import Costos from "@/components/landing/Costos";
import Servicios from "@/components/landing/Servicios";
import Footer from "@/components/landing/Footer";
import ModalRegistro from "@/components/landing/ModalRegistro";
export default function PaginaInicio() {
  const [esModoClaro, setEsModoClaro] = useState(false);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  // Sincroniza clases en el body para la landing page y el tema claro/oscuro
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.add("landing-body");
      const savedTheme = localStorage.getItem("coinstellation-theme");
      if (savedTheme === "light") {
        setEsModoClaro(true);
        document.body.classList.add("light-mode");
      } else {
        setEsModoClaro(false);
        document.body.classList.remove("light-mode");
      }
    }
    return () => {
      if (typeof window !== "undefined") {
        document.body.classList.remove("landing-body");
        document.body.classList.remove("light-mode");
      }
    };
  }, []);
  const alternarTema = () => {
    setEsModoClaro((prev) => {
      const nuevo = !prev;
      if (typeof window !== "undefined") {
        document.body.classList.toggle("light-mode", nuevo);
        localStorage.setItem("coinstellation-theme", nuevo ? "light" : "dark");
      }
      return nuevo;
    });
  };
  // Si llega con query param ?registro=true (ej. desde el login), abre el modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("registro") === "true") {
        setModalRegistroAbierto(true);
      }
    }
  }, []);
  return (
    <div className={`landing-page ${esModoClaro ? "light-mode" : ""}`}>
      {/* 1. Barra de Navegación superior */}
      <Navbar
        esModoClaro={esModoClaro}
        onAlternarTema={alternarTema}
        onAbrirRegistro={() => setModalRegistroAbierto(true)}
      />
      {/* 2. Sección Principal / Hero y Simulador Interactivo */}
      <Hero />
      {/* 3. Roadmap / Pasos de Configuración */}
      <Roadmap />
      {/* 4. Costos y Comisiones / Simulador */}
      <Costos />
      {/* 5. Carrusel 3D de Servicios */}
      <Servicios />
      {/* 6. Pie de Página */}
      <Footer />
      {/* 6. Modal de Registro */}
      <ModalRegistro
        estaAbierto={modalRegistroAbierto}
        onCerrar={() => setModalRegistroAbierto(false)}
      />
    </div>
  );
} 
