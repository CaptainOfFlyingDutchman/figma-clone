import {
  Frame,
  MousePointer2,
  Square,
  Circle,
  Type,
  type LucideIcon,
} from "lucide-react";

type Tool = {
  id: "select" | "frame" | "rect" | "ellipse" | "text";
  label: string;
  icon: LucideIcon;
};

const tools: Tool[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "frame", label: "Frame", icon: Frame },
  { id: "rect", label: "Rectangle", icon: Square },
  { id: "ellipse", label: "Ellipse", icon: Circle },
  { id: "text", label: "Text", icon: Type },
];

export function Toolbar() {
  return (
    <aside className="flex w-16 flex-col items-center gap-3 border-r border-neutral-800 bg-neutral-900 px-2 py-4">
      {tools.map((tool) => {
        const Icon = tool.icon;

        return (
          <button
            key={tool.id}
            type="button"
            title={tool.label}
            aria-label={tool.label}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            <Icon size={18} strokeWidth={2} />
          </button>
        );
      })}
    </aside>
  );
}
