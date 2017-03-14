import { module } from 'angular';

function routeConfig($urlRouterProvider, $stateProvider, $locationProvider) {
  'ngInject';

  //$locationProvider.html5Mode(true).hashPrefix('!');

  $stateProvider
    .state('home', {
      url: '/home',
      component: 'home',
    })
    .state('mevsgroupplay', {
      url: '/',
      component: 'mevsgroupplay',
    });

  $urlRouterProvider.otherwise('/');

}

export default module('app.routes', ['ui.router'])
  .config(routeConfig);
