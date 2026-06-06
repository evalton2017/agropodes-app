import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

const angularApp = new AngularNodeAppEngine({
  trustProxyHeaders: true,
  allowedHosts: ['dev.agroprodes.com.br'],
});

app.set('trust proxy', true);

const baseHref = '/app/';

app.use('/images', express.static(join(browserDistFolder, 'images'), { redirect: false }));
app.use('/app/images', express.static(join(browserDistFolder, 'images'), { redirect: false }));

app.use(
  baseHref,
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    fallthrough: true
  }),
);


// Interceptador para rotas órfãs de arquivos estáticos
app.use((req, res, next) => {
  if (req.path.includes('/images/')) {
    // Tenta uma última busca direta no disco físico antes de dar 404
    return res.sendFile(join(browserDistFolder, 'images', req.path.split('/images/')[1]), (err) => {
      if (err) {
        res.status(404).send('Image not found');
      }
    });
  }

  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});


if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}


export const reqHandler = createNodeRequestHandler(app);
