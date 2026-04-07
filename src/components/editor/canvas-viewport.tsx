"use client";

import { useRef } from "react";

import { useCamera } from "../../features/editor/hooks/use-camera";

export function CanvasViewport() {
  const { camera, panBy, zoomByDelta, resetCamera } = useCamera();

  const isPanningRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    if (event.button !== 0 && event.button !== 1) {
      return;
    }

    isPanningRef.current = true;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!isPanningRef.current || !lastPointerRef.current) {
      return;
    }

    const dx = event.clientX - lastPointerRef.current.x;
    const dy = event.clientY - lastPointerRef.current.y;

    panBy(dx, dy);
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
  }

  function stopPanning(event: React.PointerEvent<HTMLElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    isPanningRef.current = false;
    lastPointerRef.current = null;
  }

  function handleWheel(event: React.WheelEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();

    zoomByDelta(event.deltaY, event.deltaMode);
  }

  function stopCanvasPointerPropagation(
    event: React.PointerEvent<HTMLDivElement | HTMLButtonElement>,
  ) {
    event.stopPropagation();
  }

  return (
    <section
      className="relative h-full touch-none overflow-hidden overscroll-none bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_30%),linear-gradient(to_bottom,#171717,#0a0a0a)]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopPanning}
      onPointerCancel={stopPanning}
      onWheel={handleWheel}
    >
      <div
        className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-300 backdrop-blur"
        onPointerDown={stopCanvasPointerPropagation}
      >
        <span>{Math.round(camera.zoom * 100)}%</span>

        <button
          type="button"
          onClick={resetCamera}
          onPointerDown={stopCanvasPointerPropagation}
          className="rounded-md border border-neutral-700 px-2 py-0.5 text-[11px] transition hover:border-cyan-400 hover:text-cyan-300"
        >
          Reset
        </button>
      </div>

      <div
        className="absolute top-4 right-4 z-20 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-xs text-neutral-400 backdrop-blur"
        onPointerDown={stopCanvasPointerPropagation}
      >
        <p>x: {Math.round(camera.x)}</p>
        <p>y: {Math.round(camera.y)}</p>
      </div>

      <div className="flex h-full w-full items-center justify-center">
        <div
          className="relative h-[1600px] w-[1600px] rounded-[32px] border border-neutral-800 bg-neutral-950 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_rgba(0,0,0,0.45)]"
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
            transformOrigin: "center center",
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            backgroundPosition: "center center",
          }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-32 w-48 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-sm font-medium text-cyan-200">
            World Origin Area
          </div>
        </div>
      </div>
    </section>
  );
}
