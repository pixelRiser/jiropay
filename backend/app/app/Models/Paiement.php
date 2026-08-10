<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'facture_id', 'client_id', 'guichet_referent_id', 'initiateur', 'methode',
    'montant', 'reference_mobile_money', 'statut_mobile_money', 'date_paiement',
])]
class Paiement extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'montant' => 'integer',
            'date_paiement' => 'datetime',
        ];
    }

    public function facture(): BelongsTo
    {
        return $this->belongsTo(Facture::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function guichetReferent(): BelongsTo
    {
        return $this->belongsTo(Guichet::class, 'guichet_referent_id');
    }

    public function paiementJirama(): HasOne
    {
        return $this->hasOne(PaiementJirama::class);
    }

    public function commission(): HasOne
    {
        return $this->hasOne(Commission::class);
    }

    public function recu(): HasOne
    {
        return $this->hasOne(Recu::class);
    }
}
