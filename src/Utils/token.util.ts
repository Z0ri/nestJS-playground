/**
 * Estrae il bearer token dall'header di una richiesta
 * @returns il bearer token estratto
 * @returns undefined se non viene trovato un bearer token
 */
export function extractTokenFromHeader(request: Request): string | undefined {
  const { headers } = request;

  if (headers) {
    try {
      const { authorization }: any = request.headers;
      const [type, token] = authorization.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    } catch (error) {
      console.error(error.message);
    }
  }
}
