import {
  ROUTES,
  type RouteType
} from '@/config';

export function getRouteType(pathname: string): RouteType | null {
  // Vérifier les routes publiques
  if (ROUTES.public.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return 'public';
  }

  // Vérifier les routes d'authentification
  if (ROUTES.auth.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return 'auth';
  }

  // Vérifier les routes protégées
  if (ROUTES.protected.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return 'protected';
  }

  return null;
}
