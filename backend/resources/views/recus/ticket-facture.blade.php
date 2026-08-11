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
        .sep-eq { text-align: center; letter-spacing: 1px; margin: 14px 0; font-size: 10px; }
        table.champs { width: 100%; border-collapse: collapse; }
        table.champs td { padding: 3px 0; vertical-align: top; }
        table.champs td.label { width: 45%; }
        table.champs td.valeur { text-align: right; font-weight: bold; }
        .footer-msg { text-align: center; font-size: 10px; line-height: 1.6; margin: 14px 0; }
        .net-a-payer { font-size: 13px; font-weight: bold; }
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

    <div class="sep-dot"></div>

    <table class="champs">
        <tr>
            <td class="label">Ref client</td>
            <td class="valeur">{{ $ticket->ref_client }}</td>
        </tr>
        <tr>
            <td class="label">Nom Client :</td>
            <td class="valeur">{{ $ticket->nom_client }}</td>
        </tr>
    </table>

    <div class="sep-dot"></div>

    <table class="champs">
        <tr>
            <td class="label">Ref facture :</td>
            <td class="valeur">{{ $ticket->ref_facture }}</td>
        </tr>
        <tr>
            <td class="label">Mois facture :</td>
            <td class="valeur">{{ $ticket->mois_facture }}</td>
        </tr>
        <tr>
            <td class="label">Montant Facture :</td>
            <td class="valeur">{{ number_format($ticket->montant_facture, 2, '.', ' ') }} MGA</td>
        </tr>
    </table>

    <div class="footer-msg">
        Veuillez conserver ce ticket<br>
        Tehirizo tsara ity rosia ity
    </div>

    <div class="sep-eq">========================</div>

    <table class="champs">
        <tr>
            <td class="label">{{ $ticket->methode_paiement_libelle }} :</td>
            <td class="valeur net-a-payer">{{ number_format($ticket->a_payer, 2, '.', ' ') }} MGA</td>
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
</body>
</html>
