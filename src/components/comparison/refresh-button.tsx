"use client";

import { Button } from "@/components/shadcn-ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export function RefreshButton() {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      const toastId = toast.loading("Actualisation des données...");

      try {
        // Invalider tous les caches liés à la comparaison
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["runs-compare"] }),
          queryClient.invalidateQueries({ queryKey: ["users"] }),
          // Délai minimum pour voir l'animation
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);

        toast.success("Données actualisées", {
          id: toastId,
          description: "Les statistiques de comparaison ont été rafraîchies",
        });
      } catch (error) {
        toast.error("Erreur", {
          id: toastId,
          description: "Impossible de rafraîchir les données",
        });
      }
    });
  };

  return (
    <Button
      onClick={handleRefresh}
      variant="outline"
      disabled={isPending}
      className="cursor-pointer"
    >
      <RefreshCw className={cn(isPending && "animate-spin")} />
      Actualiser
    </Button>
  );
}
