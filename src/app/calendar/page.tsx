"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Page temporaire du calendrier
 * Sera complétée à l'étape 2 avec FullCalendar
 */
export default function CalendarPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Mon Agenda Familial
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Bonjour, <strong>{user.name}</strong>
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Calendrier de la semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Calendrier en cours de développement
              </h2>
              <p className="text-gray-600">
                L'intégration de FullCalendar sera réalisée à l'étape 2
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
