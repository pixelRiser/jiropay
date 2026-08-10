<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['paiement_id', 'numero_transaction_tpe', 'montant_tpe', 'saisi_par_admin_id', 'date_saisie', 'statut_validation'])]
class PaiementJirama extends Model
{
    use HasFactory;

    protected $table = 'paiements_jirama';

    protected function casts(): array
    {
        return [
            'montant_tpe' => 'integer',
            'date_saisie' => 'datetime',
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
