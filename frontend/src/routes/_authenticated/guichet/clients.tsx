import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listeClients, creerClient } from "@/lib/jiropay/admin-api";
import { ApiError } from "@/lib/jiropay/http";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/guichet/clients")({
  component: ClientsGuichet,
});

function messageErreur(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.payload as
      { message?: string; errors?: Record<string, string[]> } | undefined;
    const premiereErreurChamp = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    return premiereErreurChamp ?? payload?.message ?? error.message ?? fallback;
  }
  return fallback;
}

function ClientsGuichet() {
  const queryClient = useQueryClient();
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["mes-clients"],
    queryFn: listeClients,
  });
  const [dialogOuvert, setDialogOuvert] = useState(false);

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [numero, setNumero] = useState("");
  const [adresse, setAdresse] = useState("");

  const creerMutation = useMutation({
    mutationFn: creerClient,
    onSuccess: () => {
      toast.success("Client enregistré — un email pour activer son compte lui a été envoyé.");
      queryClient.invalidateQueries({ queryKey: ["mes-clients"] });
      queryClient.invalidateQueries({ queryKey: ["mon-guichet"] });
      setNom("");
      setEmail("");
      setTelephone("");
      setNumero("");
      setAdresse("");
      setDialogOuvert(false);
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible d'enregistrer ce client.")),
  });

  return (
    <>
      <PageHeader titre="Mes clients" />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Clients rattachés à mon guichet</CardTitle>
          <Dialog open={dialogOuvert} onOpenChange={setDialogOuvert}>
            <DialogTrigger asChild>
              <Button size="sm">Enregistrer un client</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enregistrer un client</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  creerMutation.mutate({
                    name: nom,
                    email,
                    phone: telephone,
                    numero_abonne_jirama: numero,
                    adresse,
                  });
                }}
              >
                <div className="space-y-1">
                  <Label htmlFor="c-nom">Nom complet</Label>
                  <Input id="c-nom" required value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c-email">Email</Label>
                  <Input
                    id="c-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c-tel">Téléphone</Label>
                  <Input
                    id="c-tel"
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c-num">Numéro d'abonné JIRAMA</Label>
                  <Input
                    id="c-num"
                    required
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c-adresse">Adresse (optionnel)</Label>
                  <Input
                    id="c-adresse"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Le client recevra un email pour définir son mot de passe et activer son compte.
                </p>
                <Button type="submit" className="w-full" disabled={creerMutation.isPending}>
                  Enregistrer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun client rattaché à ce guichet pour l'instant.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>N° abonné JIRAMA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.user.name}</TableCell>
                    <TableCell>{c.user.email}</TableCell>
                    <TableCell>{c.numero_abonne_jirama}</TableCell>
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
