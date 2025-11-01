"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserSelectorProps {
  onSelectUser: (email: string, userName: string) => void;
  selectedEmail: string | null;
}

/**
 * Composant pour afficher et sélectionner un membre de la famille
 */
export function UserSelector({
  onSelectUser,
  selectedEmail,
}: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("name");

        if (error) throw error;

        setUsers(data || []);
      } catch (err: any) {
        console.error("Erreur lors du chargement des utilisateurs:", err);
        setError("Impossible de charger les membres de la famille");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /**
   * Retourne les initiales d'un nom pour l'avatar
   */
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-sm text-muted-foreground">
          Chargement des membres...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          Aucun membre trouvé. Veuillez configurer les utilisateurs dans
          Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-center mb-4">
        Qui êtes-vous ?
      </h2>
      <div className="grid gap-3">
        {users.map((user) => (
          <Card
            key={user.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedEmail === user.email
                ? "ring-2 ring-primary bg-primary/5"
                : ""
            }`}
            onClick={() => onSelectUser(user.email, user.name)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              {user.role === "admin" && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Admin
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
