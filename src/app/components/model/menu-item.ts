import {MenuItem} from '../../dto/menu-item';

export const MENU_ITEMS: MenuItem[] = [
  {
    route: '/home',
    label: 'Home',
    icon: 'home',
    roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR']
  },
  {
    route: '/consulta-car',
    label: 'Consulta Car',
    icon: 'grain',
    roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR']
  },
  {
    route: '/consulta-prodes',
    label: 'Consulta Prodes',
    icon: 'forest',
    roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR']
  },
  {
    label: 'Analises',
    icon: 'rate_review',
    roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'],
    children: [
      { route: '/consulta-analise', label: 'Consultar Analise', icon: 'search', roles: ['USER_ADMIN', 'USER_ANALISTA'] },
      { route: '/consulta-analise-produtor', label: 'Consultar Analise', icon: 'search', roles: ['USER_PRODUTOR'] },
    ]
  },
  {
    label: 'Territórios',
    icon: 'terrain',
    roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'],
    children: [
      { route: '/cadastro-territorio', label: 'Cadastrar', icon: 'add_location', roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'] },
      { route: '/consulta-territorio', label: 'Consultar', icon: 'terrain', roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR'] }
    ]
  },
  {
    route: '/relatorios-produtor',
    label: 'Relatórios',
    icon: 'description',
    roles: ['USER_PRODUTOR'],
    children: [
      { route: '/relatorio-detalhe-car', label: 'Detalhe Car', icon: 'terrain', roles: ['USER_PRODUTOR'] },
      { route: '/relatorio-analise-car', label: 'Analise Car', icon: 'add_location', roles: ['USER_PRODUTOR'] },
    ]
  },
  {
    route: '/relatorios-analista',
    label: 'Relatórios',
    icon: 'description',
    roles: ['USER_ADMIN', 'USER_ANALISTA']
  },
];
