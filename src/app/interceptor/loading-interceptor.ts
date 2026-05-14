import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import {LoadingService} from '../shared/service/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Ativa a tela de carregamento
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Garante que o loading feche ao finalizar a requisição
      loadingService.hide();
    })
  );
};
