import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  listeGuichetsAdmin,
  creerGuichet,
  agentsEnAttente,
  approuverAgent,
  rejeterAgent,
  listeClients,
} from "@/lib/jiropay/admin-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <AppShell titre="Tableau de bord administrateur" role="admin">
      <Tabs defaultValue="guichets">
        <TabsList>
          <TabsTrigger value="guichets">Guichets</TabsTrigger>
          <TabsTrigger value="agents">Agents en attente</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>
        <TabsContent value="guichets" className="mt-4">
          <OngletGuichets />
        </TabsContent>
        <TabsContent value="agents" className="mt-4">
          <OngletAgents />
        </TabsContent>
        <TabsContent value="clients" className="mt-4">
          <OngletClients />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function OngletGuichets() {
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
              <Input id="g-lieu" required value={lieu} onChange={(e) => setLieu(e.target.value)} />
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
  );
}

function OngletAgents() {
  const queryClient = useQueryClient();
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["admin-agents-pending"],
    queryFn: agentsEnAttente,
  });

  const approuverMutation = useMutation({
    mutationFn: approuverAgent,
    onSuccess: () => {
      toast.success("Agent approuvé.");
      queryClient.invalidateQueries({ queryKey: ["admin-agents-pending"] });
    },
  });
  const rejeterMutation = useMutation({
    mutationFn: rejeterAgent,
    onSuccess: () => {
      toast.success("Agent rejeté.");
      queryClient.invalidateQueries({ queryKey: ["admin-agents-pending"] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agents en attente de validation</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun agent en attente.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Guichet</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>{a.phone}</TableCell>
                  <TableCell>{a.guichet ? `${a.guichet.nom} — ${a.guichet.lieu}` : "—"}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => approuverMutation.mutate(a.id)}>
                      Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejeterMutation.mutate(a.id)}
                    >
                      Rejeter
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function OngletClients() {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: listeClients,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tous les clients (tous guichets confondus)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun client pour l'instant.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>N° abonné JIRAMA</TableHead>
                <TableHead>Guichet référent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.user.name}</TableCell>
                  <TableCell>{c.user.email}</TableCell>
                  <TableCell>{c.numero_abonne_jirama}</TableCell>
                  <TableCell>
                    {c.guichet_referent.nom} — {c.guichet_referent.lieu}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
