export function PageHeader({
  titre,
  sousTitre,
}: {
  titre: string;
  sousTitre?: string | undefined;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{titre}</h1>
      {sousTitre ? <p className="mt-1 text-sm text-muted-foreground">{sousTitre}</p> : null}
    </div>
  );
}
