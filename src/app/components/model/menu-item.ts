import { MenuItem } from '../../dto/menu-item';

export const MENU_ITEMS: MenuItem[] = [
  // ==========================================
  // MENUS COMUNS / DASHBOARD
  // ==========================================
  {
    route: '/home',
    label: 'Dashboard',
    icon: 'dashboard',
    roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR']
  },
 /* {
    route: '/consulta-car',
    label: 'Consulta CAR',
    icon: 'grain',
    roles: ['USER_ADMIN', 'USER_ANALISTA', 'USER_PRODUTOR']
  },*/

  // ==========================================
  // MENUS EXCLUSIVOS: PRODUTOR
  // ==========================================
  {
    label: 'Minhas Glebas',
    icon: 'crop_free',
    roles: ['USER_PRODUTOR'],
    children: [
      { route: '/cadastro-gleba', label: 'Cadastrar', icon: 'terrain', roles: ['USER_PRODUTOR'] },
      { route: '/consulta-gleba', label: 'Consultar', icon: 'search', roles: ['USER_PRODUTOR'] }
    ]
  },
  {
    label: 'Propriedades',
    icon: 'house',
    roles: ['USER_PRODUTOR'],
    route: '/propriedades',
  },
  {
    label: 'Verificação Agrícola',
    icon: 'thunderstorm',
    roles: ['USER_PRODUTOR'],
    route: '/verificacao-agricola'
  },
  {
    label: 'Contestação',
    icon: 'persons',
    roles: ['USER_PRODUTOR', 'USER_ANALISTA'],
    children: [
      { route: '/contestacao-produtor', label: 'Gleba', icon: 'eco', roles: ['USER_PRODUTOR'] },
      { route: '/contestacao-propriedade', label: 'Propriedade', icon: 'eco', roles: ['USER_PRODUTOR'] },
      { route: '/acompanhamento-contestacao', label: 'Acompanhamento', icon: 'trending_up', roles: ['USER_PRODUTOR'] },
      { route: '/contestacao-analista', label: 'Contestações', icon: 'eco', roles: ['USER_ANALISTA'] },
      { route: '/aprovacoes', label: 'Aprovações', icon: 'cloud', roles: ['USER_ANALISTA'] },
      { route: '/relatorio', label: 'Relatorios', icon: 'trending_up', roles: ['USER_ANALISTA'] },
    ]
  },
  {
    label: 'Meus Atestados',
    icon: 'assignment',
    roles: ['USER_PRODUTOR'],
    route: '/atestados-produtor'
  },
  {
    label: 'Caderno de Campo',
    icon: 'book',
    roles: ['USER_PRODUTOR'],
    route: '/caderno-campo'
  },
  {
    label: 'Ambiental',
    icon: 'rate_review',
    roles: ['USER_PRODUTOR'],
    route: '/consulta-ambiental'
  },
 /* {
    label: 'Configuração',
    icon: 'settings',
    roles: ['USER_PRODUTOR'],
    route: '/configuracao-produtor'
  },*/


  // ==========================================
  // MENUS EXCLUSIVOS: ANALISTA / ADMIN
  // ==========================================
  {
    route: '/glebas',
    label: 'Glebas',
    icon: 'map',
    roles: ['USER_ADMIN', 'USER_ANALISTA']
  },
  {
    label: 'Monitoramento',
    icon: 'monitor_heart',
    roles: ['USER_ADMIN', 'USER_ANALISTA'],
    children: [
      { route: '/monitoramento-ambiental', label: 'Ambiental', icon: 'eco', roles: ['USER_ADMIN', 'USER_ANALISTA'] },
      { route: '/monitoramento-ia-culturas', label: 'Culturas', icon: 'psychology', roles: ['USER_ADMIN', 'USER_ANALISTA'] },
      { route: '/monitoramento-clima', label: 'Clima', icon: 'cloud', roles: ['USER_ADMIN', 'USER_ANALISTA'] },
      { route: '/monitoramento-produtividade', label: 'Produtividade', icon: 'trending_up', roles: ['USER_ADMIN', 'USER_ANALISTA'] },
      { route: '/monitoramento-zarc', label: 'ZARC', icon: 'calendar_today', roles: ['USER_ADMIN', 'USER_ANALISTA'] }
    ]
  },
  {
    label: 'Atestados',
    icon: 'analytics',
    roles: ['USER_ADMIN', 'USER_ANALISTA'],
    children: [
      { route: '/relatorio-atestados-vmg', label: 'Atestados VMG', icon: 'assignment', roles: ['USER_ADMIN', 'USER_ANALISTA'] },
      { route: '/relatorio-eventos-climaticos', label: 'Eventos Climáticos', icon: 'thunderstorm', roles: ['USER_ADMIN', 'USER_ANALISTA'] }
    ]
  },
  {
    label: 'Painel Mapa',
    icon: 'layers',
    roles: ['USER_ADMIN', 'USER_ANALISTA'],
    children: [
      { route: '/mapa-contratos', label: 'Contratos', icon: 'description', roles: ['USER_ADMIN', 'USER_ANALISTA'] },
      { route: '/mapa-auditoria', label: 'Auditoria', icon: 'gavel', roles: ['USER_ADMIN', 'USER_ANALISTA'] }
    ]
  },
  {
    label: 'Operações',
    icon: 'admin_panel_settings',
    roles: ['USER_ANALISTA', 'USER_ADMIN'],
    route: '/operacoes'
  }
];
