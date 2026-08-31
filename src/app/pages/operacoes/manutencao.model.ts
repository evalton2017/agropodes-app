export interface Endereco {
  id?: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface Telefone {
  id?: number;
  ddd: string;
  numero: string;
  tipo: 'COMERCIAL' | string;
}

export interface Empresa {
  id?: number;
  razaoSocial: string;
  cnpj: string;
  ativo: boolean;
  enderecos: Endereco[];
  telefones: Telefone[];
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: Sort;
  unpaged: boolean;
}

export interface PageResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Pageable;
  size: number;
  sort: Sort;
  totalElements: number;
  totalPages: number;
}

// Tipo customizado para a resposta de empresas
export type EmpresaPageResponse = PageResponse<Empresa>;
