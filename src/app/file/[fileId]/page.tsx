import { EditorShell } from "@/components/editor/editor-shell";

type FilePageProps = {
  params: Promise<{
    fileId: string;
  }>;
};

export default async function FilePage({ params }: FilePageProps) {
  const { fileId } = await params;

  return <EditorShell fileId={fileId} />;
}
