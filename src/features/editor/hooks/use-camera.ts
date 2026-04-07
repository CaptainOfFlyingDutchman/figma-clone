"use client";

import { useCallback } from "react";
import { useImmer } from "use-immer";

import { INITIAL_CAMERA, type Camera } from "../types/camera";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const PIXEL_ZOOM_FACTOR = 0.0025;
const LINE_ZOOM_FACTOR = 0.06;

function clampZoom(zoom: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

function getZoomDelta(deltaY: number, deltaMode: number) {
  if (deltaMode === 1) {
    return deltaY * LINE_ZOOM_FACTOR;
  }

  return deltaY * PIXEL_ZOOM_FACTOR;
}

export function useCamera() {
  const [camera, updateCamera] = useImmer<Camera>(INITIAL_CAMERA);

  const panBy = useCallback(
    (dx: number, dy: number) => {
      updateCamera((draft) => {
        draft.x += dx;
        draft.y += dy;
      });
    },
    [updateCamera],
  );

  const zoomByDelta = useCallback(
    (deltaY: number, deltaMode: number) => {
      updateCamera((draft) => {
        const zoomDelta = getZoomDelta(deltaY, deltaMode);
        draft.zoom = clampZoom(draft.zoom - zoomDelta);
      });
    },
    [updateCamera],
  );

  const resetCamera = useCallback(() => {
    updateCamera((draft) => {
      draft.x = INITIAL_CAMERA.x;
      draft.y = INITIAL_CAMERA.y;
      draft.zoom = INITIAL_CAMERA.zoom;
    });
  }, [updateCamera]);

  return {
    camera,
    panBy,
    zoomByDelta,
    resetCamera,
  };
}
