type FilePageProps = {
    params: Promise<{
      fileId: string;
    }>;
  };
  
  export default async function FilePage({ params }: FilePageProps) {
    const { fileId } = await params;
  
    return (
      <main className="flex min-h-screen bg-neutral-950 text-white">
        <aside className="flex w-16 items-center justify-center border-r border-neutral-800 bg-neutral-900">
          <span className="-rotate-90 text-xs uppercase tracking-[0.3em] text-neutral-500">
            Tools
          </span>
        </aside>
  
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                File
              </p>
              <h1 className="text-sm font-medium text-neutral-100">{fileId}</h1>
            </div>
  
            <div className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
              Single Player Mode
            </div>
          </header>
  
          <div className="grid min-h-0 flex-1 grid-cols-[1fr_280px]">
            <div className="flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_30%),linear-gradient(to_bottom,#171717,#0a0a0a)]">
              <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/60 px-8 py-10 text-center shadow-2xl">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">
                  Canvas Area
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Editor surface comes next
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-neutral-400">
                  In the next step, we’ll replace this placeholder with the first
                  real editor shell and start building the camera model.
                </p>
              </div>
            </div>
  
            <aside className="border-l border-neutral-800 bg-neutral-900 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Inspector
              </p>
              <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-sm text-neutral-300">Nothing selected yet.</p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    );
  }
  