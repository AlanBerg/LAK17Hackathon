import { module } from 'angular';
import template from './mevsgroupplay.component.html';
import './mevsgroupplay.component.scss';

import * as _ from 'lodash';
import * as d3 from 'd3';
import '../lib/tip';

class MeVsGroupController {

    constructor($log, $state, $stateParams, $http, $element, $base64) {
        'ngInject'
        this.$log = $log.getInstance(MeVsGroupController.name);
        this.$http = $http;
        this.selectedLearnerId = '';
        this.$element = this.$element;
        this.$base64 = $base64;

        this.GET_URL = `http://jiscv2.learninglocker.net/api/statements/aggregate`;

        this.AUTH = "N2Q3YmIwZWM5MmNmM2I5OGViNGI3N2MwM2ZiNjRhOTI0MTRkOGQ5Nzo3NGE0MjQyZjRmYTdlYzUyY2UxNzk4MTRjYTEzZTcwZmNmMDY5NTg5";
    }

    log(...msg) {
        this.$log.debug(...msg);
    }

    $onInit() {
        const LEARNER_PATTERN = 'actor.account.name';
        this.$http.get('./assets/data/play-video.json')
            .then((res) => {
                //this.data = _.map(res.data, 'statement');
                this.data = res.data;
                this.learnersList = _.uniq(_.map(this.data, LEARNER_PATTERN));
                this.log('res.userlist', this.learnersList);
            })
            .catch((err) => {
                this.log('err', err);
            });
    }

    drawChart(datum) {
        let tip = d3.tip().attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) { return d; });


        const RECTPAD = 2;
        const RECTW = 10;
        const GROUPMERECTPAD = 40;
        this.margin = { top: 10, left: 10, right: 10, bottom: 10 };
        this.svgWidth = 700;
        this.svgHeight = this.margin.top + this.margin.bottom + _.size(datum) * (RECTW + RECTPAD);

        // TODO to fix
        let xScale = d3.scaleLinear().range([this.svgWidth / 2, this.svgWidth]).domain([0, 50]);
        let groupXScale = d3.scaleLinear().range([0 + this.svgWidth / 2 + GROUPMERECTPAD, this.svgWidth]).domain([0, 50]);
        let meXScale = d3.scaleLinear().range([this.svgWidth / 2 - GROUPMERECTPAD, 0]).domain([0, 50]);
        let colorScale = d3.scaleOrdinal(d3.schemeCategory20);

        d3.select('#mevsgroupplay')
            .select('svg')
            .remove();

        this.svg = d3.select('#mevsgroupplay')
            .append('svg')
            .attr('width', this.svgWidth)
            .attr('height', this.svgHeight)
            .append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)

        /** adding tip */
        this.svg.call(tip);

        this.svg.selectAll('g')
            .data(datum)
            .enter()
            .append('g')
            .attr('transform', (d, i) => {
                return `translate(${0}, ${i * (RECTW + RECTPAD) + this.margin.top})`
            });

        /** here goes the ME bars charts */
        this.svg.selectAll('g')
            .append('line')
            .attr('x1', meXScale(0))
            .attr('x2', (d) => { return meXScale(d.meduration); })
            .attr('y1', 0)
            .attr('y2', 0)
            .style('stroke', (d, i) => {
                return colorScale(i);
            })
            .style('stroke-width', RECTW)
            .on('mouseover', (d, i) => {
                console.log('d', d, i, this.othersVideos)
                let tiptext = `Video Id: ${d.videoid}<br>
                                Duration: ${d.meduration} (min)<br>`
                tip.show(tiptext);
            })
            .on('mouseout', (d, i) => {
                tip.hide();
            })

        /** here goes the group bars charts */
        this.svg.selectAll('g')
            .append('line')
            .attr('x1', groupXScale(0))
            .attr('x2', (d) => { return groupXScale(d.groupduration); })
            .attr('y1', 0)
            .attr('y2', 0)
            .style('stroke', (d, i) => {
                return colorScale(i);
            })
            .style('stroke-width', RECTW)
            .on('mouseover', (d, i) => {
                let videoByLearners = _.where(this.othersVideos, { 'videoid': d.videoid })
                console.log('d', d, i, this.othersVideos, videoByLearners)

                d3.select('#mevsgroupplay-detail')
                    .select('svg')
                    .remove();

                this.detailSvg = d3.select('#mevsgroupplay-detail')
                    .append('svg')
                    .attr('width', this.svgWidth)
                    .attr('height', 500)
                    .append('g')
                    .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)

                this.detailSvg.selectAll('g')
                    .data(videoByLearners)
                    .enter()
                    .append('g')
                    .attr('transform', (d, i) => {
                        return `translate(${0}, ${i * (RECTW + RECTPAD) + this.margin.top})`
                    });

                /** here goes the ME bars charts */
                this.detailSvg.selectAll('g')
                    .append('line')
                    .attr('x1', xScale(0))
                    .attr('x2', (d) => { return xScale(d.duration); })
                    .attr('y1', 0)
                    .attr('y2', 0)
                    .style('stroke', (d, i) => {
                        return colorScale(i);
                    })
                    .style('stroke-width', RECTW);


                this.detailSvg.selectAll('g')
                    .append('text')
                    .attr('class', 'videoid-label')
                    .attr('x', xScale(0) - 90)
                    .attr('y', 0)
                    .text((d) => { return d.actorname; });

                let tiptext = `Video Id: ${d.videoid}<br>
                                Duration: ${d.groupduration} (min)<br>
                                Min duration: ${d.min} (min)<br>
                                Max duration: ${d.max} (min)<br>`
                tip.show(tiptext);
            })
            .on('mouseout', (d, i) => {
                d3.select('#mevsgroupplay-detail')
                    .select('svg')
                    .remove();
                tip.hide();
            })

        this.svg.selectAll('g')
            .append('text')
            .attr('class', 'videoid-label')
            .attr('x', meXScale(0))
            .attr('y', 0)
            .text((d) => { return d.videoname; });

        /** title for Me */
        this.svg.append('text')
            .attr('class', 'title-label')
            .attr('x', this.svgWidth / 4)
            //.attr('y', -10)
            .text('ME');

        /** title for Group */
        this.svg.append('text')
            .attr('class', 'title-label')
            .attr('x', 3 * this.svgWidth / 4)
            //.attr('y', -10)
            .text('Group');

        // detail svg
        function drawDetail(data) {
            d3.select('#mevsgroupplay-detail')
                .select('svg')
                .remove();

            this.detailSvg.selectAll('g')
                .data(data)
                .enter()
                .append('g')
                .attr('transform', (d, i) => {
                    return `translate(${0}, ${i * (RECTW + RECTPAD) + this.margin.top})`
                });

            /** here goes the ME bars charts */
            this.detailSvg.selectAll('g')
                .append('line')
                .attr('x1', xScale(0))
                .attr('x2', (d) => { return xScale(d.duration); })
                .attr('y1', 0)
                .attr('y2', 0)
                .style('stroke', (d, i) => {
                    return colorScale(i);
                })
                .style('stroke-width', RECTW);
        }

    }




    // d3js.org
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
            return _.extend({}, { videoid: item.object.id }, { videoname: item.object.definition.name.en }, { timestamp: item.timestamp }, {
                // duration: Number(item.result.duration.split('M')[0].split('PT')[1]) * 60 + Number(item.result.duration.split('M')[1].split('S')[0])
                duration: item.result.duration
            });
        });
        learnerVideoIds = _.uniq(_.map(learnerVideos, 'videoid'));

        /** get others videos */
        othersVideos = _.filter(this.data, (item) => {
            return _.indexOf(learnerVideoIds, item.object.id) !== -1 && this.selectedLearnerId !== item.actor.account.name;
        });
        othersVideos = _.map(othersVideos, (item) => {
            return _.extend({}, { videoid: item.object.id }, { actorname: item.actor.account.name }, { timestamp: item.timestamp }, { // duration: Number(item.result.duration.split('M')[0].split('PT')[1]) * 60 + Number(item.result.duration.split('M')[1].split('S')[0])
                duration: item.result.duration
            });
        });

        this.othersVideos = othersVideos;
        othersVideosGroupedByVideoId = _.values(_.groupBy(othersVideos, 'videoid'));

        this.log(othersVideosGroupedByVideoId)

        othersVideosGroupedByVideoId = _.map(othersVideosGroupedByVideoId, (item) => {
            return _.extend({}, { videoid: item[0].videoid }, { avgduration: _.sum(_.map(item, 'duration')) / _.size(item) }, { min: _.min(_.map(item, 'duration')) }, { max: _.max(_.map(item, 'duration')) });
        })

        this.log('me vs group', learnerVideos, othersVideosGroupedByVideoId)

        let datum = _.map(learnerVideos, (item, index) => {
            return _.extend({}, { videoid: item.videoid }, { videoname: item.videoname }, { meduration: item.duration }, { timestamp: item.timestamp }, { groupduration: othersVideosGroupedByVideoId[index].avgduration }, {
                min: othersVideosGroupedByVideoId[index].min
            }, {
                    max: othersVideosGroupedByVideoId[index].max
                })
        })

        this.log('datum', datum)
        this.drawChart(datum);
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