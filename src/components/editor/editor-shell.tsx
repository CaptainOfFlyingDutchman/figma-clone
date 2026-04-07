import { CanvasViewport } from "./canvas-viewport";
import { InspectorPanel } from "./inspector-panel";
import { Toolbar } from "./toolbar";

type EditorShellProps = {
  fileId: string;
};

export function EditorShell({ fileId }: EditorShellProps) {
  return (
    <main className="flex h-screen overflow-hidden bg-neutral-950 text-white">
      <Toolbar />

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-neutral-500 uppercase">
              File
            </p>
            <h1 className="text-sm font-medium text-neutral-100">{fileId}</h1>
          </div>

          <div className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
            Single Player Mode
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[1fr_280px] overflow-hidden">
          <CanvasViewport />
          <InspectorPanel />
        </div>
      </section>
    </main>
  );
}
