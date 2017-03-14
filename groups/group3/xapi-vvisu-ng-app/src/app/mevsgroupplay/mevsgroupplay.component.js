import { module } from 'angular';
import template from './mevsgroupplay.component.html';
import './mevsgroupplay.component.scss';

import * as _ from 'lodash';
import * as d3 from 'd3';

class MeVsGroupController {

    constructor($log, $state, $stateParams, $http, $element) {
        'ngInject'
        this.$log = $log.getInstance(MeVsGroupController.name);
        this.$http = $http;
        this.selectedLearnerId = '';
        this.$element = this.$element;
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
        this.margin = { top: 10, left: 10, right: 10, bottom: 10 };
        this.svgWidth = 700;
        this.svgHeight = 700;
        const RECTPAD = 5;
        const RECTW = 20;
        const GROUPMERECTPAD = 3;

        // TODO to fix
        let xScale = d3.scaleLinear().domain([0, this.svgWidth]).range([0, 100]);
        let groupXScale = d3.scaleLinear().range([0 + this.svgWidth / 2 + GROUPMERECTPAD, this.svgWidth]).domain([0, 50]);
        let meXScale = d3.scaleLinear().range([this.svgWidth / 2 - GROUPMERECTPAD, 0]).domain([0, 50]);
        let colorScale = d3.scaleOrdinal(d3.schemeCategory20);


        const data = [{ id: 1, d: 20 }, { id: 2, d: 30 }, { id: 3, d: 25 }];

        this.svg = d3.select("#mevsgroupplay")
            .attr('width', this.svgWidth)
            .attr('height', this.svgHeight)
            .append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)

        this.svg.selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('transform', (d, i) => {
                return `translate(${0}, ${i * (RECTW + RECTPAD)})`
            });

        /** here goes the me bars charts */
        this.svg.selectAll('g')
            .append('line')
            .attr('x1', meXScale(0))
            .attr('x2', (d) => { return meXScale(d.d); })
            .attr('y1', 0)
            .attr('y2', 0)
            .style('stroke', (d, i) => {
                return colorScale(i);
            })
            .style('stroke-width', RECTW)

        /** here goes the group bars charts */
        this.svg.selectAll('g')
            .append('line')
            .attr('x1', groupXScale(0))
            .attr('x2', (d) => { return groupXScale(d.d); })
            .attr('y1', 0)
            .attr('y2', 0)
            .style('stroke', (d, i) => {
                return colorScale(i);
            })
            .style('stroke-width', RECTW)

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

        this.drawChart();
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