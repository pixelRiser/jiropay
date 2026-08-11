import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { listeCommissions, reverserCommission } from "@/lib/jiropay/admin-api";
import { ApiError } from "@/lib/jiropay/http";
import { useConfirm } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, PiggyBank, MoreVertical, Undo2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/commissions")({
  component: CommissionsAdmin,
});

function messageErreur(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.payload as { message?: string } | undefined;
    return payload?.message ?? error.message ?? fallback;
  }
  return fallback;
}

function CommissionsAdmin() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-commissions"],
    queryFn: listeCommissions,
  });

  const commissions = data?.data ?? [];
  const soldeParGuichet = data?.solde_par_guichet ?? [];

  const reverserMutation = useMutation({
    mutationFn: reverserCommission,
    onSuccess: () => {
      toast.success("Commission marquée comme reversée.");
      queryClient.invalidateQueries({ queryKey: ["admin-commissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-guichets"] });
    },
    onError: (error) =>
      toast.error(messageErreur(error, "Impossible de reverser cette commission.")),
  });

  async function demanderReversement(id: number, nomGuichet: string, montant: number) {
    const ok = await confirm({
      titre: `Marquer cette commission comme reversée ?`,
      description: `${montant.toLocaleString("fr-FR")} Ar seront retirés du solde non reversé de ${nomGuichet}. Ceci ne déclenche aucun virement — c'est une trace comptable, le versement réel se fait hors plateforme.`,
      confirmLabel: "Marquer reversée",
    });
    if (ok) reverserMutation.mutate(id);
  }

  return (
    <>
      <PageHeader
        titre="Commissions"
        sousTitre="Historique des commissions créditées, tous guichets confondus."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total commissions créditées
            </CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(data?.total_creditee ?? 0).toLocaleString("fr-FR")} Ar
            </p>
            <p className="text-xs text-muted-foreground">Toutes commissions, tous guichets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Guichets actifs</CardTitle>
            <PiggyBank className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{soldeParGuichet.length}</p>
            <p className="text-xs text-muted-foreground">Avec un solde de commission</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Solde par guichet</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guichet</TableHead>
                <TableHead className="text-right">Solde non reversé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {soldeParGuichet.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">
                    {g.nom} — {g.lieu}
                  </TableCell>
                  <TableCell className="text-right">
                    {g.solde_commission.toLocaleString("fr-FR")} Ar
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Historique des commissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : commissions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucune commission créditée pour l'instant.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guichet</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Montant facture</TableHead>
                  <TableHead>Frais</TableHead>
                  <TableHead>Part plateforme</TableHead>
                  <TableHead>Commission guichet</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.guichet.nom} — {c.guichet.lieu}
                    </TableCell>
                    <TableCell>{c.paiement.client.user.name}</TableCell>
                    <TableCell>
                      {c.paiement.facture.type === "carte" ? "Carte" : "Facture"} —{" "}
                      {c.paiement.facture.reference_facture ?? "—"}
                    </TableCell>
                    <TableCell>{c.montant_facture.toLocaleString("fr-FR")} Ar</TableCell>
                    <TableCell>{c.montant_frais.toLocaleString("fr-FR")} Ar</TableCell>
                    <TableCell>{c.part_plateforme.toLocaleString("fr-FR")} Ar</TableCell>
                    <TableCell className="font-medium">
                      {c.montant_commission.toLocaleString("fr-FR")} Ar
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.statut === "creditee" ? "secondary" : "default"}>
                        {c.statut === "creditee" ? "Créditée" : "Reversée"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-right">
                      {c.statut === "creditee" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                demanderReversement(c.id, c.guichet.nom, c.montant_commission)
                              }
                            >
                              <Undo2 className="mr-2 size-4" />
                              Marquer reversée
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
