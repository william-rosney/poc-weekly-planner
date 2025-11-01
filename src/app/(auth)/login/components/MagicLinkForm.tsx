"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

interface MagicLinkFormProps {
  email: string;
  userName: string;
  onSendMagicLink: (email: string) => Promise<{ success: boolean; error: string | null }>;
}

/**
 * Composant pour envoyer le Magic Link
 */
export function MagicLinkForm({
  email,
  userName,
  onSendMagicLink,
}: MagicLinkFormProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendLink = async () => {
    setLoading(true);
    setError(null);

    const result = await onSendMagicLink(email);

    setLoading(false);

    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || "Une erreur s'est produite");
    }
  };

  if (sent) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">
                Email envoyé avec succès !
              </h3>
              <p className="text-sm text-green-700 mt-2">
                Un lien de connexion a été envoyé à{" "}
                <strong>{email}</strong>
              </p>
              <p className="text-sm text-green-600 mt-2">
                Vérifiez votre boîte de réception et cliquez sur le lien pour
                vous connecter.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSent(false)}
              className="mt-4"
            >
              Renvoyer le lien
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg">Bonjour, {userName} !</h3>
            <CardDescription className="mt-2">
              Cliquez sur le bouton ci-dessous pour recevoir un lien de
              connexion par email
            </CardDescription>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="bg-muted p-3 rounded-md">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{email}</p>
            </div>
          </div>

          <Button
            onClick={handleSendLink}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></span>
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Envoyer le lien de connexion
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
