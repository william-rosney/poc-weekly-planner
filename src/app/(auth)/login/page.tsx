"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserSelector } from "./components/UserSelector";
import { MagicLinkForm } from "./components/MagicLinkForm";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Page de connexion avec sélection d'utilisateur et Magic Link
 */
export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, signInWithMagicLink } = useAuth();
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/calendar");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSelectUser = (email: string, userName: string) => {
    setSelectedEmail(email);
    setSelectedUserName(userName);
  };

  const handleBackToSelection = () => {
    setSelectedEmail(null);
    setSelectedUserName("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Mon Agenda Familial
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous pour accéder au calendrier partagé
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedEmail ? "Connexion" : "Sélection du membre"}
            </CardTitle>
          </CardHeader>

          {!selectedEmail ? (
            <div className="p-6 pt-0">
              <UserSelector
                onSelectUser={handleSelectUser}
                selectedEmail={selectedEmail}
              />
            </div>
          ) : (
            <div className="p-6 pt-0 space-y-4">
              <button
                onClick={handleBackToSelection}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Changer de membre
              </button>
              <MagicLinkForm
                email={selectedEmail}
                userName={selectedUserName}
                onSendMagicLink={signInWithMagicLink}
              />
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-gray-500">
          Un lien de connexion vous sera envoyé par email
        </p>
      </div>
    </div>
  );
}
