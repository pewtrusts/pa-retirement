/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import d3 from '@Project/d3-importer.js';
import StringHelpers from '@Submodule/UTILS';
import metadata from '@Project/data/metadata.json';
import slugger from 'slugger';
import s from './styles.scss';

if ( module.hot ){
    module.hot.accept('./styles.scss');
}

const maxes = {};
const haveBarcharts = ['d_insuff','d_ratio'];
var max;

const margin = {
    top: 3.125,
    right: 0,
    bottom: 3.125,
    left: 0
};
const viewBoxHeight = 25;
const height = viewBoxHeight - margin.top - margin.bottom;
const width = 100 - margin.left - margin.right;
const yScale = d3.scaleLinear().range([0, width]);

// initBarCharts is called by index.js first so that when _createBarChart is called,
// it has closure over the populated maxes object
export function initBarCharts({data}){
    haveBarcharts.reduce(function(acc,cur){ // mutates maxes
        acc[cur] = Math.max(...data.map(d => d[cur]));
        return acc;
    }, maxes);
    max = Math.max(...haveBarcharts.map(prop => maxes[prop]));
}
export default function _createBarChart(d){
    var container = d3.select(this);
    yScale.domain([0,max]);

    var svg = container
        .selectAll('svg')
        .data([d]);

    {
        let entering = svg.enter()
            .append('svg')
            .attr('class', s.svg)
            .attr('height', viewBoxHeight)
            .attr('preserveAspectRatio', 'none')
            .attr('viewBox', '0 0 100 ' + viewBoxHeight)
            .attr('focusable', false)
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('version', '1.1')
            .attr('role', 'img');


        entering.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

        entering.append('line')
            .attr('class', s.axisLine)
            .attr('x1',0)
            .attr('x2',0)
            .attr('y1',0)
            .attr('y2', viewBoxHeight)
            .attr('vector-effect','non-scaling-stroke');


        svg = svg.merge(entering);
    }

    var rect = svg.select('g')
        .selectAll('rect')
        .data(d => {
            console.log(d);
            return [d];
        }, _d => _d ? _d.value : this.getAttribute('data-value'));

    {
        let entering = rect.enter()
            .append('rect')
            .attr('x',0)
            .attr('y',0)
            .attr('height', height)
            .attr('width', yScale(d.value));

        rect = rect.merge(entering)
        rect.exit().remove();
    }


}