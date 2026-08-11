import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listeClients,
  listeGuichetsAdmin,
  reassignerGuichetClient,
  type ClientDetail,
} from "@/lib/jiropay/admin-api";
import { ApiError } from "@/lib/jiropay/http";
import { useConfirm } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, ArrowLeftRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  component: ClientsAdmin,
});

function messageErreur(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.payload as { message?: string } | undefined;
    return payload?.message ?? error.message ?? fallback;
  }
  return fallback;
}

function ClientsAdmin() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: listeClients,
  });
  const { data: guichets = [] } = useQuery({
    queryKey: ["admin-guichets"],
    queryFn: listeGuichetsAdmin,
  });

  const [clientEnEdition, setClientEnEdition] = useState<ClientDetail | null>(null);
  const [nouveauGuichetId, setNouveauGuichetId] = useState<string>("");

  const reassignerMutation = useMutation({
    mutationFn: (payload: { clientId: number; guichetId: number }) =>
      reassignerGuichetClient(payload.clientId, payload.guichetId),
    onSuccess: () => {
      toast.success("Guichet référent modifié.");
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      setClientEnEdition(null);
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible de modifier le guichet.")),
  });

  function ouvrirReassignation(client: ClientDetail) {
    setClientEnEdition(client);
    setNouveauGuichetId(String(client.guichet_referent_id));
  }

  async function confirmerReassignation() {
    if (!clientEnEdition) return;
    const guichetId = Number(nouveauGuichetId);
    const guichet = guichets.find((g) => g.id === guichetId);
    const ok = await confirm({
      titre: "Changer le guichet référent ?",
      description: `${clientEnEdition.user.name} sera rattaché à ${guichet?.nom ?? "ce guichet"} — ses commissions futures iront à ce guichet. Réservé aux cas de litige.`,
      confirmLabel: "Confirmer le changement",
      destructif: true,
    });
    if (!ok) return;
    reassignerMutation.mutate({ clientId: clientEnEdition.id, guichetId });
  }

  return (
    <>
      <PageHeader
        titre="Clients"
        sousTitre="L'ensemble des clients inscrits, tous guichets confondus."
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Users className="size-6" />
              </span>
              <p className="text-sm font-medium text-foreground">Aucun client pour l'instant</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Les clients apparaîtront ici dès qu'ils s'inscriront eux-mêmes ou seront enregistrés
                par un guichet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>N° abonné JIRAMA</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Guichet référent</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.user.name}</TableCell>
                    <TableCell>{c.user.email}</TableCell>
                    <TableCell>{c.user.phone ?? "—"}</TableCell>
                    <TableCell>{c.numero_abonne_jirama}</TableCell>
                    <TableCell>{c.adresse ?? "—"}</TableCell>
                    <TableCell>
                      {c.guichet_referent.nom} — {c.guichet_referent.lieu}
                    </TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => ouvrirReassignation(c)}>
                        <ArrowLeftRight className="mr-2 size-4" />
                        Réassigner
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!clientEnEdition} onOpenChange={(open) => !open && setClientEnEdition(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réassigner {clientEnEdition?.user.name}</DialogTitle>
            <DialogDescription>
              Change le guichet référent de ce client — réservé aux cas de litige. Les commissions
              déjà créditées restent au guichet d'origine ; seules les futures iront au nouveau
              guichet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={nouveauGuichetId} onValueChange={setNouveauGuichetId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un guichet" />
              </SelectTrigger>
              <SelectContent>
                {guichets.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.nom} — {g.lieu}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              disabled={reassignerMutation.isPending}
              onClick={confirmerReassignation}
            >
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
