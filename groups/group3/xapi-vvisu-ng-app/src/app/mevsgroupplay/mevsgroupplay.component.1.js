import { module } from 'angular';
import template from './home.component.html';
import './home.component.scss';

class MeVsGroupController {

    constructor($log, $state, $stateParams) {
        'ngInject'
        this.$log = $log.getInstance(MeVsGroupController.name);
    }

    log(...msg) {
        this.$log.debug(...msg);
    }

    $onInit() {
    }

}

const MeVsGroupComponent = {
    template,
    restricted: 'E',
    controllerAs: 'mevsgroup',
    controller: MeVsGroupController,
};

export default module('app.mevsgroup', [])
    .component('mevsgroup', MeVsGroupComponent);