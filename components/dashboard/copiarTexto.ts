/**
 * Copia texto al portapapeles y devuelve si lo logró.
 *
 * `navigator.clipboard` solo existe en contextos seguros (HTTPS o localhost). Si el dashboard
 * se abre por http://IP:puerto no está disponible, así que se usa el método clásico con un
 * <textarea> oculto y document.execCommand("copy").
 */
export async function copiarTexto(texto: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // Si el navegador lo rechaza, se intenta con el método clásico.
    }
  }

  if (typeof document === "undefined") return false;

  const campo = document.createElement("textarea");
  campo.value = texto;
  campo.setAttribute("readonly", "");
  campo.style.position = "fixed";
  campo.style.top = "0";
  campo.style.left = "-9999px";
  campo.style.opacity = "0";
  document.body.appendChild(campo);

  const seleccionPrevia = document.getSelection()?.rangeCount ? document.getSelection()!.getRangeAt(0) : null;
  campo.select();
  campo.setSelectionRange(0, texto.length);

  let copiado = false;
  try {
    copiado = document.execCommand("copy");
  } catch {
    copiado = false;
  }

  document.body.removeChild(campo);
  if (seleccionPrevia) {
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(seleccionPrevia);
  }

  return copiado;
}
