export type NodeId = string;

type BaseNode = {
  id: NodeId;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
};

export type RectangleNode = BaseNode & {
  type: "rect";
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
};

export type CanvasNode = RectangleNode;
