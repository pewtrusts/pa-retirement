/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import d3 from '@Project/d3-importer.js';
import StringHelpers from '@Submodule/UTILS';
import metadata from '@Project/data/metadata.json';
import slugger from 'slugger';
import mapSVG from '!raw-loader!./map.html';
import s from './styles.scss';

if ( module.hot ){
    module.hot.accept('./styles.scss');
}

const fields = ['liability', 'd_ratio', 'required'];
const container = document.querySelector('#pa-map-container');
const scale = d3.scaleLinear().range([0,1]);
//var colors = ['#fff', '#229DC6','#153164'];
var colors = ['#ebf4ff', '#296EC3','#153164'];
var legendLabels;
const extents = {};
const sectionHead = document.querySelector('#pa-map-container h2');

export default function initMap({data}){

    var buttons = document.querySelectorAll('.js-pa-button-container button');
    var activeButton = buttons[0];

    function clickHandler(){
        counties.each(update.bind(undefined, this.value));
        labels.each(updateLabels.bind(undefined, this.value));
        updateLegend({labels: legendLabels, field: this.value});
        activeButton.classList.remove('active');
        this.classList.add('active');
        activeButton = this;
        updateHeader(this.value);
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', clickHandler);
    });

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

    labels.each(updateLabels.bind(undefined, fields[0]));

    legendLabels = initLegend({container: svgContainer});
    updateLegend({labels: legendLabels, field: fields[0]});
    updateHeader(fields[0]);
}
function returnArray(j){
    var arr = [];
    for ( let i = 0; i < j; i++ ){
        arr.push(1);
    }
    return arr;
}
function initLegend({container}){
    var legend = container.selectAll(`div.${s.legend}`)
        .data([100]);

    {
        let entering = legend.enter()
            .append('div')
            .attr('class', s.legend);

        legend = legend.merge(entering);

    }
    var legendDivs = legend.selectAll('.' + s.legendDiv)
        .data(d => returnArray(d));

    {
        let entering = legendDivs.enter()
            .append('div')
            .attr('class',s.legendDiv)
            .style('background-color', (d,i,array) => d3.piecewise(d3.interpolateRgb, colors)( i / array.length));

        legendDivs = legendDivs.merge(entering);

    }

    var legendValues = legend.selectAll('label')
        .data(extents[fields[0]]);

    {
        let entering = legendValues.enter()
            .append('label');

        legendValues = legendValues.merge(entering);
    }

    return legendValues;

}
function updateLegend({labels,field}){
    labels.data(extents[field])
        .text(d => d3.format(metadata[field].format)(d))
        .classed(s.max, (d,i) => i == 1);
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
function updateHeader(field){
    sectionHead.textContent = metadata[field].display;
}