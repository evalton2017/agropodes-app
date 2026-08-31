export class MascaraUtils {

  /**
   * Aplica máscara dinâmica para CPF (11 dígitos) ou CNPJ (14 dígitos)
   */
  static aplicarCpfCnpj(valor: string): string {
    const apenasDigitos = valor.replace(/\D/g, '');

    if (apenasDigitos.length <= 11) {
      // Máscara de CPF: 000.000.000-00
      let v = apenasDigitos.substring(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      return v;
    } else {
      // Máscara de CNPJ: 00.000.000/0000-00
      let v = apenasDigitos.substring(0, 14);
      v = v.replace(/^(\d{2})(\d)/, '$1.$2');
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
      v = v.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
      return v;
    }
  }

  /**
   * Aplica máscara fixa de CNPJ (00.000.000/0000-00)
   */
  static aplicarCnpj(valor: string): string {
    let v = valor.replace(/\D/g, '').substring(0, 14);
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    return v;
  }

  /**
   * Aplica máscara de Telefone ((00) 00000-0000 ou (00) 0000-0000)
   */
  static aplicarTelefone(valor: string): string {
    let v = valor.replace(/\D/g, '').substring(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (v.length > 0) {
      v = v.replace(/^(\d*)/, '($1');
    }
    return v;
  }
}
