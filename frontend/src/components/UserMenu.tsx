import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/jiropay/auth-store";
import { useConfirm } from "@/components/ConfirmDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, User, LogOut } from "lucide-react";

const LIBELLE_ROLE: Record<string, string> = {
  client: "Client",
  agent: "Guichet",
  admin: "Administrateur",
};

const DASHBOARD_PAR_ROLE = {
  client: "/espace",
  agent: "/guichet",
  admin: "/admin",
} as const;

const PROFIL_PAR_ROLE = {
  client: "/espace/profil",
  agent: "/guichet/profil",
  admin: "/admin/profil",
} as const;

function initiales(nom: string): string {
  return nom
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase())
    .join("");
}

export function UserMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const confirm = useConfirm();

  if (!user) return null;

  const dashboard = DASHBOARD_PAR_ROLE[user.role] ?? "/espace";
  const profil = PROFIL_PAR_ROLE[user.role] ?? "/espace/profil";

  async function deconnexion() {
    const ok = await confirm({
      titre: "Se déconnecter ?",
      description:
        "Vous devrez vous reconnecter avec votre email et votre mot de passe pour accéder à nouveau à votre espace.",
      confirmLabel: "Se déconnecter",
      destructif: true,
    });
    if (!ok) return;

    await logout();
    await queryClient.cancelQueries();
    queryClient.clear();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-full border bg-card px-2 py-1 pr-3 transition-colors hover:bg-accent"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {initiales(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[140px] truncate text-sm font-medium text-foreground">
            {user.name}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 p-2">
          <Avatar className="size-10">
            <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
              {initiales(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-1">
              {LIBELLE_ROLE[user.role]}
            </Badge>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={dashboard} className="cursor-pointer">
            <LayoutDashboard className="size-4" />
            <span>
              Tableau de bord
              <span className="block text-xs text-muted-foreground">Vue d'ensemble</span>
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={profil} className="cursor-pointer">
            <User className="size-4" />
            <span>
              Mon profil
              <span className="block text-xs text-muted-foreground">Informations personnelles</span>
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={deconnexion}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
