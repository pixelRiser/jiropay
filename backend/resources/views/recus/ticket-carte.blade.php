<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Ticket {{ $ticket->numero_ticket ?? $ticket->id }}</title>
    <style>
        @page { margin: 0; }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            color: #1a1a1a;
            background: #d8d8d8;
            margin: 0;
            padding: 18px 16px;
        }
        .logo-wrap { text-align: center; margin-bottom: 8px; }
        .logo-wrap img { width: 60px; height: 60px; }
        h1 { text-align: center; font-size: 15px; margin: 4px 0 2px; }
        h2 { text-align: center; font-size: 13px; font-weight: normal; margin: 0 0 12px; }
        .ligne { margin: 5px 0; }
        .sep-dot { border-bottom: 1px dotted #333; margin: 10px 0; }
        table.champs { width: 100%; border-collapse: collapse; }
        table.champs td { padding: 3px 0; vertical-align: top; }
        table.champs td.label { width: 50%; }
        table.champs td.valeur { text-align: right; font-weight: bold; }
        .pre-paiement { text-align: right; font-weight: bold; margin-bottom: 4px; }
        .jeton-label { font-weight: bold; margin-top: 10px; }
        .jeton-valeur { text-align: center; font-size: 17px; font-weight: bold; letter-spacing: 1px; margin: 6px 0 4px; }
        .footer-msg { text-align: center; font-size: 10px; line-height: 1.6; margin: 14px 0; }
        .a-payer { font-size: 13px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="logo-wrap">
        <img src="{{ public_path('images/jirama-logo-ticket.png') }}" alt="JIRAMA">
    </div>
    <h1>JIRO sy RANO MALAGASY</h1>
    <h2>TICKET D'ACQUIT</h2>

    <div class="ligne">N° : {{ $ticket->numero_ticket ?? '' }}</div>
    <div class="ligne">AGENCE : JIRAKAIKY – ANKORONDRANO</div>
    <div class="ligne">Caisse : 999EQ</div>
    <div class="ligne">Du : {{ $ticket->date_operation->format('Y-m-d H:i:s') }}</div>
    <div class="ligne">Caisse : EQ-0177</div>

    <div class="pre-paiement">Pre paiement</div>

    <table class="champs">
        <tr>
            <td class="label">Client :</td>
            <td class="valeur">{{ $ticket->nom_client }}</td>
        </tr>
        <tr>
            <td class="label">Installation</td>
            <td class="valeur">{{ $ticket->installation }}</td>
        </tr>
        <tr>
            <td class="label">Commune code</td>
            <td class="valeur">{{ $ticket->commune_code }}</td>
        </tr>
        <tr>
            <td class="label">Compteur</td>
            <td class="valeur">{{ $ticket->compteur }}</td>
        </tr>
        <tr>
            <td class="label">Type</td>
            <td class="valeur">{{ $ticket->type_prepaye }}</td>
        </tr>
    </table>

    <div class="sep-dot"></div>

    <div class="ligne">Quantite Achetee : {{ $ticket->quantite_achetee }}</div>

    <div class="sep-dot"></div>

    <table class="champs">
        <tr>
            <td class="label">Mont.Cons. :</td>
            <td class="valeur">{{ number_format($ticket->mont_cons, 2, '.', ' ') }}</td>
        </tr>
        <tr>
            <td class="label">Prime Fixe :</td>
            <td class="valeur">{{ number_format($ticket->prime_fixe ?? 0, 2, '.', ' ') }}</td>
        </tr>
        <tr>
            <td class="label">Redevance :</td>
            <td class="valeur">{{ number_format($ticket->redevance ?? 0, 2, '.', ' ') }}</td>
        </tr>
        <tr>
            <td class="label">Total Jirama :</td>
            <td class="valeur">{{ number_format($ticket->total_jirama, 2, '.', ' ') }}</td>
        </tr>
        <tr>
            <td class="label">Taxe Comm :</td>
            <td class="valeur">{{ number_format($ticket->taxe_comm ?? 0, 2, '.', ' ') }}</td>
        </tr>
        <tr>
            <td class="label">Sur Taxe Comm :</td>
            <td class="valeur">{{ number_format($ticket->sur_taxe_comm ?? 0, 2, '.', ' ') }}</td>
        </tr>
        <tr>
            <td class="label">FNE :</td>
            <td class="valeur">{{ number_format($ticket->fne ?? 0, 2, '.', ' ') }}</td>
        </tr>
        <tr>
            <td class="label">TVA :</td>
            <td class="valeur">{{ number_format($ticket->tva ?? 0, 2, '.', ' ') }}</td>
        </tr>
        <tr>
            <td class="label">Total Taxes :</td>
            <td class="valeur">{{ number_format($ticket->total_taxes ?? 0, 2, '.', ' ') }}</td>
        </tr>
    </table>

    <div class="jeton-label">Jeton</div>
    <div class="jeton-valeur">{{ $ticket->jeton }}</div>

    <div class="sep-dot"></div>

    <table class="champs">
        <tr>
            <td class="label">A Payer</td>
            <td class="valeur a-payer">{{ number_format($ticket->a_payer, 2, '.', ' ') }} MGA</td>
        </tr>
    </table>

    <div class="sep-dot"></div>

    <table class="champs">
        <tr>
            <td class="label">{{ $ticket->methode_paiement_libelle }}</td>
            <td class="valeur">{{ number_format($ticket->a_payer, 2, '.', ' ') }} MGA</td>
        </tr>
        <tr>
            <td class="label">Ref Transaction :</td>
            <td class="valeur">{{ $ticket->ref_transaction }}</td>
        </tr>
        <tr>
            <td class="label">Numero Payeur :</td>
            <td class="valeur">{{ $ticket->numero_payeur }}</td>
        </tr>
        <tr>
            <td class="label">Operateur :</td>
            <td class="valeur">{{ $ticket->operateur }}</td>
        </tr>
        @if($ticket->id_interne)
        <tr>
            <td class="label">Id interne :</td>
            <td class="valeur">{{ $ticket->id_interne }}</td>
        </tr>
        @endif
        @if($ticket->frais_jirakaiky !== null)
        <tr>
            <td class="label">Frais Jirakaiky :</td>
            <td class="valeur">{{ number_format($ticket->frais_jirakaiky, 2, '.', ' ') }} MGA</td>
        </tr>
        @endif
        @if($ticket->frais_operateur !== null)
        <tr>
            <td class="label">Frais Operateur :</td>
            <td class="valeur">{{ number_format($ticket->frais_operateur, 2, '.', ' ') }} MGA</td>
        </tr>
        @endif
    </table>

    <div class="footer-msg">
        Veuillez conserver ce ticket<br>
        Tehirizo tsara ity rosia ity<br>
        Misaotra anao nanjifa<br>
        Ampafantaro amin'ny namanao ny JIRAKAIKY !
    </div>
</body>
</html>
