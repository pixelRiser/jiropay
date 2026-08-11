import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/jiropay/auth-store";
import {
  listeNotifications,
  marquerNotificationLue,
  marquerToutesLues,
  type NotificationItem,
} from "@/lib/jiropay/notifications-api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, CheckCheck } from "lucide-react";

/**
 * Sonnerie synthétisée (deux notes) plutôt qu'un fichier audio — évite de
 * gérer un asset binaire dans le repo, fonctionne partout. Échoue en
 * silence si le navigateur bloque l'audio (politique autoplay) : une
 * notification manquée visuellement reste visible dans la cloche, ce n'est
 * jamais bloquant.
 */
function jouerSonnerie() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const jouerNote = (frequence: number, debut: number, duree: number) => {
      const oscillateur = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillateur.type = "sine";
      oscillateur.frequency.value = frequence;
      gain.gain.setValueAtTime(0, ctx.currentTime + debut);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + debut + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + debut + duree);
      oscillateur.connect(gain);
      gain.connect(ctx.destination);
      oscillateur.start(ctx.currentTime + debut);
      oscillateur.stop(ctx.currentTime + debut + duree + 0.05);
    };

    jouerNote(880, 0, 0.12);
    jouerNote(1174.66, 0.11, 0.18);
    setTimeout(() => ctx.close().catch(() => undefined), 500);
  } catch {
    // Audio bloqué par le navigateur — non bloquant, la cloche reste à jour visuellement.
  }
}

function tempsRelatif(dateIso: string): string {
  const diffMinutes = Math.floor((Date.now() - new Date(dateIso).getTime()) / 60000);
  if (diffMinutes < 1) return "à l'instant";
  if (diffMinutes < 60) return `il y a ${diffMinutes} min`;
  const diffHeures = Math.floor(diffMinutes / 60);
  if (diffHeures < 24) return `il y a ${diffHeures} h`;
  return `il y a ${Math.floor(diffHeures / 24)} j`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [ouvert, setOuvert] = useState(false);
  const nonLuesPrecedent = useRef<number | null>(null);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: listeNotifications,
    enabled: !!user,
    refetchInterval: 30000,
  });

  const notifications = data?.data ?? [];
  const nonLues = data?.non_lues ?? 0;

  // Sonnerie uniquement quand le nombre de non-lues AUGMENTE par rapport au
  // poll précédent — jamais au premier chargement de la page (sinon chaque
  // connexion sonnerait pour des notifications déjà anciennes).
  useEffect(() => {
    if (nonLuesPrecedent.current !== null && nonLues > nonLuesPrecedent.current) {
      jouerSonnerie();
    }
    nonLuesPrecedent.current = nonLues;
  }, [nonLues]);

  const marquerLueMutation = useMutation({
    mutationFn: marquerNotificationLue,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const marquerToutesLuesMutation = useMutation({
    mutationFn: marquerToutesLues,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  function ouvrirNotification(n: NotificationItem) {
    if (!n.read_at) marquerLueMutation.mutate(n.id);
    setOuvert(false);
    if (n.href) navigate({ to: n.href });
  }

  if (!user) return null;

  return (
    <DropdownMenu open={ouvert} onOpenChange={setOuvert}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-9 cursor-pointer items-center justify-center rounded-full border bg-card transition-colors hover:bg-accent"
        >
          <Bell className="size-4" />
          {nonLues > 0 ? (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {nonLues > 9 ? "9+" : nonLues}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {nonLues > 0 ? (
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => marquerToutesLuesMutation.mutate()}
            >
              <CheckCheck className="size-3.5" />
              Tout marquer lu
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Aucune notification pour l'instant.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex cursor-pointer flex-col items-start gap-0.5 whitespace-normal py-2"
                onClick={() => ouvrirNotification(n)}
              >
                <div className="flex w-full items-center gap-2">
                  {!n.read_at ? (
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  ) : null}
                  <span
                    className={
                      n.read_at
                        ? "text-sm font-normal text-foreground"
                        : "text-sm font-semibold text-foreground"
                    }
                  >
                    {n.title}
                  </span>
                </div>
                <p className="pl-3.5 text-xs text-muted-foreground">{n.message}</p>
                <p className="pl-3.5 text-[11px] text-muted-foreground">
                  {tempsRelatif(n.created_at)}
                </p>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
