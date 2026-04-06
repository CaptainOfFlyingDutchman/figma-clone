import Link from "next/link";

export default function HomePage() {
  const demoFileId = "demo-file-1";

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-cyan-400">
          MVP Foundation
        </p>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          Build a Figma-style editor step by step.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
          This project will start as a clean single-player editor and then grow
          into collaboration, comments, mentions, and persistence.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href={`/file/${demoFileId}`}
            className="rounded-xl bg-cyan-400 px-5 py-3 font-medium text-neutral-950 transition hover:bg-cyan-300"
          >
            Open Demo File
          </Link>
        </div>
      </section>
    </main>
  );
}
