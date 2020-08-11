/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import d3 from '@Project/d3-importer.js';
import StringHelpers from '@Submodule/UTILS';
import metadata from '@Project/data/metadata.json';
import slugger from 'slugger';
import mapSVG from '!raw-loader!./map.html';
//import s from './styles.scss';

if ( module.hot ){
  //  module.hot.accept('./styles.scss');
}

const fields  = ['liability', 'd_ratio', 'required'];
const container = document.querySelector('#pa-map-container');
const scale = d3.scaleLinear().range([0,1]);
//var colors = ['#fff', '#229DC6','#153164'];
var colors = ['#fff', '#296EC3','#153164'];
const extents = {};

export default function initMap({data}){
    // mutates extents
    fields.reduce(function(acc,cur){ 
        extents[cur] = d3.extent(data, d => d[cur]);
    },extents);
    
    var svgContainer = d3.select(container)
        .selectAll('div.js-svg-container')
        .data([data]);

    {
        // only in dev or during prerender will there be an entering container
        let entering = svgContainer.enter()
            .append('div')
            .attr('class','js-svg-container')
            .html(mapSVG);

        svgContainer = svgContainer.merge(entering);
    }

    var svg = svgContainer.select('svg');
    var counties = svg.selectAll('path').data(d => d.filter(_d => _d.county !== 'Pennsylvania'), function(_d){
        return _d ? slugger(_d.county) : this.getAttribute('data-county');
    });
    // in all cases, dev, prerender, page load, the paths will already be part of the svg
    //counties

    counties.each(update.bind(undefined, fields[0]));

    var labels = d3.selectAll('div.g-Layer_1');
    console.log(labels);
    labels.data(data.filter(d => d.county !== 'Pennsylvania'), function(_d){
        console.log(_d);
        return _d ? slugger(_d.county) : slugger(this.getAttribute('data-key'));
    });

    labels.each(updateLabels.bind(undefined, fields[0]))
}
function update(field,d,i,array){
    var county = d3.select(array[i]);
    scale.domain(extents[field]);
    county
        .attr('fill', d => {
            var interp = d3.piecewise(d3.interpolateRgb, colors);
            return interp(scale(d[field]));
    });
}
function updateLabels(field,d,i,array){
    var label = d3.select(array[i]);
    console.log(label.node());
    label
        .classed('on-light', d => scale(d[field]) < 0.25 || ['Philadelphia','Delaware'].includes(d.county));
}