export interface Perfil {
  id: number;
  codigo: string;
  nome: string;
  tipoBase: 'ADMIN' | 'ANALISTA' | 'PRODUTOR';
  modulos: Modulo[];
}

export interface Modulo {
  id: number;
  chaveRota: string;
  nomeModulo: string;
}

export interface Empresa {
  id: number;
  razaoSocial: string;
  cnpj: string;
  dataCadastro: string;
  ativo: boolean;
  hibernateLazyInitializer?: Record<string, unknown>; // Mapeado como opcional por ser um objeto interno do Hibernate
}

export interface Pessoa {
  id: number;
  nome: string;
  email: string;
  idKeycloak: string;
  cpfCnpj?: string;
  tipo: 'PRODUTOR' | 'ANALISTA' | 'ADMIN';
  perfil?: Perfil;
  modulosPermitidos?: Modulo[];
  empresa: Empresa;
}
