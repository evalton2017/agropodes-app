import { HttpParams } from '@angular/common/http';


export function limparParams(dados: any, mapaChaves?: { [key: string]: string }): HttpParams {
  let params = new HttpParams();

  if (!dados) return params;

  Object.keys(dados).forEach(chaveOriginal => {
    const valor = dados[chaveOriginal];

    // Verifica se o valor é válido (não nulo, não undefined e não string vazia)
    if (valor !== null && valor !== undefined && valor.toString().trim() !== '') {
      // Usa o nome mapeado se existir, caso contrário mantém a chave original
      const novaChave = mapaChaves && mapaChaves[chaveOriginal] ? mapaChaves[chaveOriginal] : chaveOriginal;

      params = params.set(novaChave, valor.toString().trim());
    }
  });

  return params;
}
