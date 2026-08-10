import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listeGuichetsAdmin, creerGuichet } from "@/lib/jiropay/admin-api";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/guichets")({
  component: GuichetsAdmin,
});

function GuichetsAdmin() {
  const queryClient = useQueryClient();
  const { data: guichets = [], isLoading } = useQuery({
    queryKey: ["admin-guichets"],
    queryFn: listeGuichetsAdmin,
  });
  const [nom, setNom] = useState("");
  const [lieu, setLieu] = useState("");
  const [zone, setZone] = useState<"ville" | "hors_ville">("ville");
  const [fraisDefaut, setFraisDefaut] = useState("200");
  const [commissionDefaut, setCommissionDefaut] = useState("200");

  const creerMutation = useMutation({
    mutationFn: creerGuichet,
    onSuccess: () => {
      toast.success("Guichet créé.");
      queryClient.invalidateQueries({ queryKey: ["admin-guichets"] });
      setNom("");
      setLieu("");
    },
    onError: () => toast.error("Impossible de créer le guichet."),
  });

  return (
    <>
      <PageHeader titre="Guichets" />
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Tous les guichets</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Chargement…</p>
            ) : guichets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun guichet pour l'instant.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Clients</TableHead>
                    <TableHead>Solde commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guichets.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.nom}</TableCell>
                      <TableCell>{g.lieu}</TableCell>
                      <TableCell>{g.zone === "ville" ? "Ville" : "Hors ville"}</TableCell>
                      <TableCell>
                        <Badge variant={g.statut === "actif" ? "default" : "secondary"}>
                          {g.statut}
                        </Badge>
                      </TableCell>
                      <TableCell>{g.clients_count ?? 0}</TableCell>
                      <TableCell>{g.solde_commission.toLocaleString("fr-FR")} Ar</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nouveau guichet</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                creerMutation.mutate({
                  nom,
                  lieu,
                  zone,
                  montant_frais_defaut: Number(fraisDefaut),
                  montant_commission_defaut: Number(commissionDefaut),
                });
              }}
            >
              <div className="space-y-1">
                <Label htmlFor="g-nom">Nom</Label>
                <Input id="g-nom" required value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="g-lieu">Lieu</Label>
                <Input
                  id="g-lieu"
                  required
                  value={lieu}
                  onChange={(e) => setLieu(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Zone</Label>
                <Select value={zone} onValueChange={(v) => setZone(v as "ville" | "hors_ville")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ville">Ville</SelectItem>
                    <SelectItem value="hors_ville">Hors ville</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="g-frais">Frais par défaut (Ar)</Label>
                <Input
                  id="g-frais"
                  type="number"
                  required
                  value={fraisDefaut}
                  onChange={(e) => setFraisDefaut(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="g-comm">Commission par défaut (Ar)</Label>
                <Input
                  id="g-comm"
                  type="number"
                  required
                  value={commissionDefaut}
                  onChange={(e) => setCommissionDefaut(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={creerMutation.isPending}>
                Créer le guichet
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
