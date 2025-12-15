"use client";

import { Button } from "@/components/shadcn-ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function RefreshButton() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // Invalider tous les caches liés à la comparaison
      await queryClient.invalidateQueries({ queryKey: ["runs-compare"] });
      await queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.success("Données actualisées", {
        description: "Les statistiques de comparaison ont été rafraîchies",
      });
    } catch (error) {
      toast.error("Erreur", {
        description: "Impossible de rafraîchir les données",
      });
    } finally {
      // Petit délai pour l'animation
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      variant="outline"
      size="sm"
      disabled={isRefreshing}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      Actualiser
    </Button>
  );
}
