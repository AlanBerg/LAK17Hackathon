import { module } from 'angular';
import template from './mevsgroupplay.component.html';
import './mevsgroupplay.component.scss';

class MeVsGroupController {

    constructor($log, $state, $stateParams, $http) {
        'ngInject'
        this.$log = $log.getInstance(MeVsGroupController.name);
        this.$http = $http;
    }

    log(...msg) {
        this.$log.debug(...msg);
    }

    $onInit() {
        this.$http.get('./assets/data/play-video.json')
            .then((res) => {
                let data = res.data;
                this.log('res.data', data);
            })
            .catch((err) => {
                this.log('err', err);
            })
    }

}

const MeVsGroupComponent = {
    template,
    restricted: 'E',
    controllerAs: 'mevsgroupplay',
    controller: MeVsGroupController,
};

export default module('app.mevsgroupplay', [])
    .component('mevsgroupplay', MeVsGroupComponent);