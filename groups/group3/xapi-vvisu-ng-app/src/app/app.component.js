import { module } from 'angular';

import AppTheme from './app.theme';
import AppRoutes from './app.routes';

import ToolbarComponent from './toolbar/toolbar.component';
import HomeComponent from './home/home.component';
import MeVsGroupPlayComponent from './mevsgroupplay/mevsgroupplay.component';


export default module('app', [
    'ngMaterial',
    'angular-logger',
    AppTheme.name,
    AppRoutes.name,
    ToolbarComponent.name,
    HomeComponent.name,
    MeVsGroupPlayComponent.name,
]).component('app', {
    template: `<toolbar></toolbar>
                <md-content ng-cloak><div ui-view></div></md-content>`,
    restrict: 'E',
});