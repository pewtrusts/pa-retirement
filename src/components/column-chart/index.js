/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import d3 from '@Project/d3-importer.js';
import StringHelpers from '@Submodule/UTILS';
import metadata from '@Project/data/metadata.json';
import slugger from 'slugger';
//import s from './styles.scss';

/*if ( module.hot ){
    module.hot.accept('./styles.scss');
}*/

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
    var group
    var _svg = returnSVG();
    var rects = _svg.select('g').selectAll('rect')
        .data(d => d);

    {
        let entering = rects.enter()
            .append('rect')
            .attr('width', 2 * (width / 7))
            .attr('height', height)
            .attr('x', (d,i) => (i + 1) * ( width / 7) + i  * ( width / 3.5) )
            .attr('y', 0);

        rects = rects.merge(entering);
    }
}
export function updateChart(component, {field, county = 'Allegheny'}){
    yScale.domain(extents[field]);
    var rects = component.selectAll('rect')
        .data(['Pennsylvania', county].map(c => {
            return {
                county: c,
                value: data.find(d => d.county == c)[field]
            };
        }));

    rects
        .attr('y', d => yScale(d.value))
        .attr('height', d => height - yScale(d.value));
}

