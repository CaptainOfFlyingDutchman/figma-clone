export function InspectorPanel() {
  return (
    <aside className="border-l border-neutral-800 bg-neutral-900 p-4">
      <p className="text-xs tracking-[0.2em] text-neutral-500 uppercase">
        Inspector
      </p>

      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <p className="text-sm text-neutral-300">Nothing selected yet.</p>
      </div>

      <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <p className="text-xs tracking-[0.2em] text-neutral-500 uppercase">
          Upcoming
        </p>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          This panel will later show position, size, rotation, fill, stroke, and
          text properties for the selected node.
        </p>
      </div>
    </aside>
  );
}
