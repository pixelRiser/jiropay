<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'paiement_id', 'numero_ticket', 'date_operation', 'nom_client',
    'ref_client', 'ref_facture', 'mois_facture', 'montant_facture',
    'installation', 'commune_code', 'compteur', 'type_prepaye', 'quantite_achetee',
    'mont_cons', 'prime_fixe', 'redevance', 'total_jirama', 'taxe_comm', 'sur_taxe_comm',
    'fne', 'tva', 'total_taxes', 'jeton',
    'a_payer', 'methode_paiement_libelle', 'ref_transaction', 'numero_payeur',
    'operateur', 'id_interne', 'frais_jirakaiky', 'frais_operateur',
    'saisi_par_admin_id', 'date_saisie', 'statut_validation',
])]
class PaiementJirama extends Model
{
    use HasFactory;

    protected $table = 'paiements_jirama';

    protected function casts(): array
    {
        return [
            'date_operation' => 'datetime',
            'date_saisie' => 'datetime',
            'montant_facture' => 'integer',
            'mont_cons' => 'integer',
            'prime_fixe' => 'integer',
            'redevance' => 'integer',
            'total_jirama' => 'integer',
            'taxe_comm' => 'integer',
            'sur_taxe_comm' => 'integer',
            'fne' => 'integer',
            'tva' => 'integer',
            'total_taxes' => 'integer',
            'a_payer' => 'integer',
            'frais_jirakaiky' => 'integer',
            'frais_operateur' => 'integer',
        ];
    }

    public function paiement(): BelongsTo
    {
        return $this->belongsTo(Paiement::class);
    }

    public function saisiParAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'saisi_par_admin_id');
    }
}
