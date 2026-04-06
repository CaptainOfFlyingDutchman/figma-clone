export function CanvasViewport() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_30%),linear-gradient(to_bottom,#171717,#0a0a0a)]">
      <div className="absolute top-4 left-4 rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-300 backdrop-blur">
        100%
      </div>

      <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/60 px-8 py-10 text-center shadow-2xl">
        <p className="text-sm tracking-[0.2em] text-cyan-400 uppercase">
          Canvas Area
        </p>

        <h2 className="mt-3 text-2xl font-semibold text-white">
          Camera model comes next
        </h2>

        <p className="mt-3 max-w-md text-sm leading-6 text-neutral-400">
          We will soon add pan and zoom state here, then place real editor
          content inside the viewport.
        </p>
      </div>
    </section>
  );
}
