<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nom', 'lieu', 'statut', 'zone', 'montant_frais_defaut', 'montant_commission_defaut', 'solde_commission'])]
class Guichet extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'montant_frais_defaut' => 'integer',
            'montant_commission_defaut' => 'integer',
            'solde_commission' => 'integer',
        ];
    }

    public function agents(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function clients(): HasMany
    {
        return $this->hasMany(Client::class, 'guichet_referent_id');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class, 'guichet_referent_id');
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class);
    }
}
