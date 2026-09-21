import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link className="footer-logo" href="#">
            Coinstellation
          </Link>
          <p>
            La infraestructura moderna para crear tu Webstore y aceptar pagos
            globales.
          </p>
          <div className="footer-socials" aria-label="Redes sociales">
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
            >
              Discord
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X / Twitter"
            >
              X
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h2>Plataforma</h2>
          <a href="#webstores">Webstores</a>
          <a href="#payments">Pasarela de Pagos</a>
          <a href="#pricing">Precios</a>
        </div>

        <div className="footer-column">
          <h2>Soporte</h2>
          <a href="#documentation">Documentación</a>
          <a href="#faq">Preguntas Frecuentes</a>
          <a href="#contact">Contacto</a>
        </div>

        <div className="footer-column">
          <h2>Legal</h2>
          <Link href="/legal">Términos y Condiciones</Link>
          <Link href="/legal">Privacidad</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Coinstellation. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
}
