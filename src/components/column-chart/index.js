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

const viewBoxHeight = 77;
const margin = {
    top: 0,
    right: 1,
    bottom: 0,
    left: 1
};
const height = viewBoxHeight - margin.top - margin.bottom;
const width = 100 - margin.left - margin.right;
const yScale = d3.scaleLinear().range([height, 0]);
const fields = ['d_insuff','shortfall','d_ratio','liability','required'];

var data;
var extents = {};

export default function(_data){
    data = _data;
    fields.reduce(function(acc,cur){ // mutates extents
        extents[cur] = d3.extent(data, d => d[cur])
    }, extents);
}
export function initChart(component){
    function returnSVG(){
        var svg = component.selectAll('svg g')
            .data([['Pennsylvania', undefined]]);

        {
            let entering = svg.enter()
                .append('svg')
                .attr('width', '100%')
                .attr('viewBox', '0 0 100 ' + viewBoxHeight)
                .attr('focusable', false)
                .attr('xmlns', 'http://www.w3.org/2000/svg')
                .attr('version', '1.1')
                .attr('role', 'img');

            entering.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);


            svg = svg.merge(entering);
        }
        return svg;
    }
    
    var _svg = returnSVG();
    var rects = _svg.select('g').selectAll('rect')
        .data(d => d);

    {
        let entering = rects.enter()
            .append('rect')
            .attr('class', (d,i) => s[`rect-${i}`])
            .attr('width', 2 * (width / 7))
            .attr('height', height)
            .attr('x', (d,i) => (i + 1) * ( width / 7) + i  * ( width / 3.5) )
            .attr('y', 0);

        rects = rects.merge(entering);
    }

    var labels = _svg.select('g').selectAll('g.labels')
        .data(d => d);

        {
            let entering = labels.enter()
                .append('g')
                .attr('class', `labels ${s.labels}`)
                    .append('text')
                    .attr('class', (d,i) => s[`label-${i}`])
                    .text('XX')
                    .attr('text-anchor', 'middle')
                    .attr('x', (d,i) => (2/7) * width + i * (3/7) * width)
                    .attr('y',0)
                    .attr('dy', '-0.5em');

            labels == labels.merge(entering);
        }

    var axis = _svg.selectAll('line.axis')
        .data([1]);

        {
            let entering = axis.enter()
                .append('line')
                .attr('class', `axis ${s.axis}`)
                .attr('x1', (1/14) * width)
                .attr('x2', width - (1/14) * width)
                .attr('y1', height)
                .attr('y2', height);

            axis = axis.merge(entering);
        }

   /* var axisLabel = _svg.selectAll('text.axis-label')
        .data([1]);

        {
            let entering = axisLabel.enter()
                .append('text')
                .attr('class',`axis-label ${s.axisLabel}`)
                .text('0')
                .attr('x', 0)
                .attr('y', height)
                .attr('dy', '0.3em');

            axisLabel = axisLabel.merge(entering);
        }*/

}
export function updateChart(component, {field, county = 'Allegheny'}){
    yScale.domain([0,extents[field][1]]); // forcing zero min because column charts
    var chartData = ['Pennsylvania', county].map(c => {
        return {
            county: c,
            value: data.find(d => d.county == c)[field]
        };
    });
    var rects = component.selectAll('rect')
        .data(chartData);

    rects
        .attr('y', d => yScale(d.value))
        .attr('height', d => height - yScale(d.value));

    var labels = component.selectAll('text')
        .data(chartData)
        .text(d => d3.format(metadata[field].format)(d.value))
        .attr('y', d => height - (height - yScale(d.value)));
}

