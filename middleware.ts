import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware pour rafraîchir automatiquement les tokens d'authentification
 * Délègue la logique à updateSession() qui gère:
 * - Le rafraîchissement des tokens Auth
 * - La propagation de la session aux Server Components
 * - La mise à jour des cookies du navigateur
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Configuration du middleware
 * Exclut les fichiers statiques et les ressources Next.js
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
