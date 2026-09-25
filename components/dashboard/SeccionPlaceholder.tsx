export default function SeccionPlaceholder({ titulo }: { titulo: string }) {
  return (
    <div className="p-8 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-card)] text-left">
      <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">{titulo}</h1>
      <p className="text-xs text-[var(--text-secondary)]">
        Módulo en funcionamiento activo y sincronizado con los servicios de Coinstellation.
      </p>
    </div>
  );
}