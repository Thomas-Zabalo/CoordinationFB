import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { creerSpecOpenApi } from './openapi.js';

export function creerRoutesSwagger() {
  const routes = Router();
  const spec = creerSpecOpenApi();

  routes.get('/docs.json', (req, res) => {
    res.json(spec);
  });

  routes.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: 'CoordinationFB — Documentation API',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    }),
  );

  return routes;
}
