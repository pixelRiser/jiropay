import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  paiementsEnAttenteTicket,
  creerTicketJirama,
  type PaiementEnAttenteTicket,
  type TicketJiramaPayload,
} from "@/lib/jiropay/admin-api";
import { ApiError } from "@/lib/jiropay/http";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReceiptText, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/paiements")({
  component: PaiementsAdmin,
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

const CHAMPS_VIDES: TicketJiramaPayload = {
  numero_ticket: "",
  date_operation: "",
  nom_client: "",
  ref_client: "",
  ref_facture: "",
  mois_facture: "",
  montant_facture: undefined,
  installation: "",
  commune_code: "",
  compteur: "",
  type_prepaye: "",
  quantite_achetee: "",
  mont_cons: undefined,
  prime_fixe: undefined,
  redevance: undefined,
  total_jirama: undefined,
  taxe_comm: undefined,
  sur_taxe_comm: undefined,
  fne: undefined,
  tva: undefined,
  total_taxes: undefined,
  jeton: "",
  a_payer: undefined as unknown as number,
  methode_paiement_libelle: "",
  ref_transaction: "",
  numero_payeur: "",
  operateur: "",
  id_interne: "",
  frais_jirakaiky: undefined,
  frais_operateur: undefined,
};

function PaiementsAdmin() {
  const queryClient = useQueryClient();
  const [paiementActif, setPaiementActif] = useState<PaiementEnAttenteTicket | null>(null);
  const [champs, setChamps] = useState<TicketJiramaPayload>(CHAMPS_VIDES);

  const { data: paiements = [], isLoading } = useQuery({
    queryKey: ["admin-paiements-en-attente-ticket"],
    queryFn: paiementsEnAttenteTicket,
  });

  const creerMutation = useMutation({
    mutationFn: (payload: TicketJiramaPayload) => creerTicketJirama(paiementActif!.id, payload),
    onSuccess: () => {
      toast.success("Ticket enregistré — la facture est marquée réglée auprès de JIRAMA.");
      queryClient.invalidateQueries({ queryKey: ["admin-paiements-en-attente-ticket"] });
      setPaiementActif(null);
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible d'enregistrer ce ticket.")),
  });

  function ouvrirFormulaire(p: PaiementEnAttenteTicket) {
    setPaiementActif(p);
    setChamps({
      ...CHAMPS_VIDES,
      nom_client: p.facture.nom_titulaire ?? p.client.user.name,
      ref_client: p.facture.reference_facture ?? "",
      ref_facture: p.facture.reference_facture ?? "",
      installation: p.facture.reference_facture ?? "",
      compteur: p.facture.numero_compteur ?? "",
      a_payer: p.montant,
    });
  }

  function set<K extends keyof TicketJiramaPayload>(champ: K, valeur: TicketJiramaPayload[K]) {
    setChamps((c) => ({ ...c, [champ]: valeur }));
  }

  function nombreOuUndefined(valeur: string): number | undefined {
    return valeur === "" ? undefined : Number(valeur);
  }

  const estCarte = paiementActif?.facture.type === "carte";

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    creerMutation.mutate(champs);
  }

  return (
    <>
      <PageHeader
        titre="Paiements JIRAMA à traiter"
        sousTitre="Paiements confirmés par les clients — saisissez le ticket JIRAMA/TPE une fois traité de votre côté pour le rendre disponible au téléchargement."
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {paiements.length} paiement{paiements.length !== 1 ? "s" : ""} en attente de ticket
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : paiements.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ReceiptText className="size-6" />
              </span>
              <p className="text-sm font-medium text-foreground">Aucun paiement en attente</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Tous les paiements confirmés ont déjà leur ticket JIRAMA saisi.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Référence / Compteur</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Payé le</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paiements.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.client.user.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {p.facture.type === "carte" ? "Carte" : "Facture"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.facture.type === "carte"
                        ? p.facture.numero_compteur
                        : p.facture.reference_facture}
                    </TableCell>
                    <TableCell>{p.montant.toLocaleString("fr-FR")} Ar</TableCell>
                    <TableCell>
                      {p.date_paiement ? new Date(p.date_paiement).toLocaleString("fr-FR") : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => ouvrirFormulaire(p)}>
                        <FileText className="mr-2 size-4" />
                        Saisir le ticket
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!paiementActif} onOpenChange={(open) => !open && setPaiementActif(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Saisir le ticket JIRAMA — {paiementActif?.client.user.name}</DialogTitle>
            <DialogDescription>
              Transcrivez les informations du ticket TPE physique. Une fois enregistré, le client
              pourra télécharger son reçu PDF.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6" onSubmit={soumettre}>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">En-tête du ticket</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="numero_ticket">N° ticket</Label>
                  <Input
                    id="numero_ticket"
                    value={champs.numero_ticket}
                    onChange={(e) => set("numero_ticket", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="date_operation">Date / heure (Du)</Label>
                  <Input
                    id="date_operation"
                    type="datetime-local"
                    required
                    value={champs.date_operation}
                    onChange={(e) => set("date_operation", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="nom_client">Nom client</Label>
                <Input
                  id="nom_client"
                  required
                  value={champs.nom_client}
                  onChange={(e) => set("nom_client", e.target.value)}
                />
              </div>
            </div>

            {estCarte ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Carte prépayée</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="installation">Installation</Label>
                    <Input
                      id="installation"
                      required
                      value={champs.installation}
                      onChange={(e) => set("installation", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="commune_code">Code commune</Label>
                    <Input
                      id="commune_code"
                      required
                      value={champs.commune_code}
                      onChange={(e) => set("commune_code", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="compteur">Compteur</Label>
                    <Input
                      id="compteur"
                      required
                      value={champs.compteur}
                      onChange={(e) => set("compteur", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="type_prepaye">Type</Label>
                    <Input
                      id="type_prepaye"
                      required
                      placeholder="Prepaye classique"
                      value={champs.type_prepaye}
                      onChange={(e) => set("type_prepaye", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="quantite_achetee">Quantité achetée</Label>
                  <Input
                    id="quantite_achetee"
                    placeholder="ex : 17650,00 kWh"
                    value={champs.quantite_achetee}
                    onChange={(e) => set("quantite_achetee", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="mont_cons">Mont. consommé</Label>
                    <Input
                      id="mont_cons"
                      type="number"
                      required
                      value={champs.mont_cons ?? ""}
                      onChange={(e) => set("mont_cons", nombreOuUndefined(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="prime_fixe">Prime fixe</Label>
                    <Input
                      id="prime_fixe"
                      type="number"
                      value={champs.prime_fixe ?? ""}
                      onChange={(e) => set("prime_fixe", nombreOuUndefined(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="redevance">Redevance</Label>
                    <Input
                      id="redevance"
                      type="number"
                      value={champs.redevance ?? ""}
                      onChange={(e) => set("redevance", nombreOuUndefined(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="total_jirama">Total Jirama</Label>
                    <Input
                      id="total_jirama"
                      type="number"
                      required
                      value={champs.total_jirama ?? ""}
                      onChange={(e) => set("total_jirama", nombreOuUndefined(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="taxe_comm">Taxe Comm.</Label>
                    <Input
                      id="taxe_comm"
                      type="number"
                      value={champs.taxe_comm ?? ""}
                      onChange={(e) => set("taxe_comm", nombreOuUndefined(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sur_taxe_comm">Sur Taxe Comm.</Label>
                    <Input
                      id="sur_taxe_comm"
                      type="number"
                      value={champs.sur_taxe_comm ?? ""}
                      onChange={(e) => set("sur_taxe_comm", nombreOuUndefined(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fne">FNE</Label>
                    <Input
                      id="fne"
                      type="number"
                      value={champs.fne ?? ""}
                      onChange={(e) => set("fne", nombreOuUndefined(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tva">TVA</Label>
                    <Input
                      id="tva"
                      type="number"
                      value={champs.tva ?? ""}
                      onChange={(e) => set("tva", nombreOuUndefined(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="total_taxes">Total taxes</Label>
                    <Input
                      id="total_taxes"
                      type="number"
                      value={champs.total_taxes ?? ""}
                      onChange={(e) => set("total_taxes", nombreOuUndefined(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jeton">Jeton (code de recharge)</Label>
                  <Input
                    id="jeton"
                    required
                    placeholder="5897 0640 1779 5204 3589"
                    value={champs.jeton}
                    onChange={(e) => set("jeton", e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Facture</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="ref_client">Réf. client</Label>
                    <Input
                      id="ref_client"
                      required
                      value={champs.ref_client}
                      onChange={(e) => set("ref_client", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ref_facture">Réf. facture</Label>
                    <Input
                      id="ref_facture"
                      required
                      value={champs.ref_facture}
                      onChange={(e) => set("ref_facture", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="mois_facture">Mois facturé</Label>
                    <Input
                      id="mois_facture"
                      required
                      placeholder="Février 2026"
                      value={champs.mois_facture}
                      onChange={(e) => set("mois_facture", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="montant_facture">Montant facture</Label>
                    <Input
                      id="montant_facture"
                      type="number"
                      required
                      value={champs.montant_facture ?? ""}
                      onChange={(e) => set("montant_facture", nombreOuUndefined(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Paiement</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="a_payer">Montant payé</Label>
                  <Input
                    id="a_payer"
                    type="number"
                    required
                    value={champs.a_payer ?? ""}
                    onChange={(e) => set("a_payer", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="methode_paiement_libelle">Méthode</Label>
                  <Input
                    id="methode_paiement_libelle"
                    required
                    placeholder="Mvola"
                    value={champs.methode_paiement_libelle}
                    onChange={(e) => set("methode_paiement_libelle", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ref_transaction">Réf. transaction</Label>
                  <Input
                    id="ref_transaction"
                    required
                    value={champs.ref_transaction}
                    onChange={(e) => set("ref_transaction", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="numero_payeur">Numéro payeur</Label>
                  <Input
                    id="numero_payeur"
                    required
                    value={champs.numero_payeur}
                    onChange={(e) => set("numero_payeur", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="operateur">Opérateur</Label>
                  <Input
                    id="operateur"
                    required
                    value={champs.operateur}
                    onChange={(e) => set("operateur", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="id_interne">Id interne</Label>
                  <Input
                    id="id_interne"
                    value={champs.id_interne}
                    onChange={(e) => set("id_interne", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="frais_jirakaiky">Frais Jirakaiky</Label>
                  <Input
                    id="frais_jirakaiky"
                    type="number"
                    value={champs.frais_jirakaiky ?? ""}
                    onChange={(e) => set("frais_jirakaiky", nombreOuUndefined(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="frais_operateur">Frais opérateur</Label>
                  <Input
                    id="frais_operateur"
                    type="number"
                    value={champs.frais_operateur ?? ""}
                    onChange={(e) => set("frais_operateur", nombreOuUndefined(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={creerMutation.isPending}>
              {creerMutation.isPending ? "Enregistrement…" : "Enregistrer le ticket"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
