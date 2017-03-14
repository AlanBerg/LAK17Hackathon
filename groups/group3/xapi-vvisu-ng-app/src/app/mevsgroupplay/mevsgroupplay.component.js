import { module } from 'angular';
import template from './mevsgroupplay.component.html';
import './mevsgroupplay.component.scss';

import * as _ from 'lodash';

class MeVsGroupController {

    constructor($log, $state, $stateParams, $http) {
        'ngInject'
        this.$log = $log.getInstance(MeVsGroupController.name);
        this.$http = $http;
        this.selectedLearnerId = '';
    }

    log(...msg) {
        this.$log.debug(...msg);
    }

    $onInit() {
        this.$http.get('./assets/data/play-video.json')
            .then((res) => {
                this.data = res.data;
                this.learnersList = _.uniq(_.map(this.data, 'actor.account.name'));
                this.log('res.data', this.learnersList);
            })
            .catch((err) => {
                this.log('err', err);
            })
    }

    drawChart(selectedLearnerData, groupData) {
    }

    //
    applyFilter() {
        this.log('learner id changed', this.selectedLearnerId);

        let learnerVideos;
        let learnerVideoIds;
        let othersVideos;
        let othersVideosGroupedByVideoId;

        /** get learner's videos & videos' id */
        learnerVideos = _.filter(this.data, (item) => {
            return item.actor.account.name == this.selectedLearnerId;
        });
        learnerVideos = _.map(learnerVideos, (item) => {
            return _.extend({}, { videoid: item.object.id }, { timestamp: item.timestamp }, { duration: item.result.duration });
        });
        learnerVideoIds = _.uniq(_.map(learnerVideos, 'videoid'));

        /** get others videos */
        othersVideos = _.filter(this.data, (item) => {
            return _.indexOf(learnerVideoIds, item.object.id) !== -1 && this.selectedLearnerId !== item.actor.account.name;
        });
        othersVideos = _.map(othersVideos, (item) => {
            return _.extend({}, { videoid: item.object.id }, { timestamp: item.timestamp }, { duration: item.result.duration });
        });

        othersVideosGroupedByVideoId = _.values(_.groupBy(othersVideos, 'videoid'));

        this.log(othersVideosGroupedByVideoId)

        othersVideosGroupedByVideoId = _.map(othersVideosGroupedByVideoId, (item) => {
            return _.extend({}, { videoid: item[0].videoid }, { avgduration: _.sum(_.map(item, 'duration')) / _.size(item) }, { min: _.min(_.map(item, 'duration')) }, { max: _.max(_.map(item, 'duration')) });
        })

        this.log(learnerVideos, othersVideosGroupedByVideoId)


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