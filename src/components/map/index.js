/* global module */
import d3 from '@Project/d3-importer.js';
import { GTMPush } from '@Submodule/UTILS';
import metadata from '@Project/data/metadata.json';
import slugger from 'slugger';
import mapSVG from '!raw-loader!./map.html';
import s from './styles.scss';


if ( module.hot ){
    module.hot.accept('./styles.scss');
}

const fields = ['liability', 'd_ratio', 'required'];
var selectedField = fields[0];
const container = document.querySelector('#pa-map-container');
const scale = d3.scaleLinear().range([0,1]);
//var colors = ['#fff', '#229DC6','#153164'];
var colors = ['#ebf4ff', '#296EC3','#153164'];
var legendLabels;
const extents = {};
const sectionHead = document.querySelector('#pa-map-container h2');
const sectionHeadText = document.querySelector('#pa-map-container h2 span');
const tip = d3.tip()
    .attr('class', `${s['d3-tip']} ${s.n}`)
    .offset(function(d) {
        var labelR = container.querySelector(`div[data-key="${d.county}"]`).getBoundingClientRect();
          return [labelR.y - this.getBoundingClientRect().y - 12, 0]
        })
    /*.html((d,i,arr) => `<section>
            <h1 class="${s.tooltipHead}">${d.county}</h1>
            <p>${metadata[selectedField].short}: <span>${d3.format(metadata[selectedField].format)(d[selectedField])}</span></p>
        <section>`);*/
    .html(d => `<p>${d.county}<br /><span>${d3.format(metadata[selectedField].format)(d[selectedField])}</span></p>`);

export default function initMap({data}){

    var inputs = document.querySelectorAll('.js-pa-button-container input');
    var activeInput = inputs[0];

    function changeHandler(){
        if ( this.value == selectedField ){
            return;
        }
        selectedField = this.value;
        counties.each(update);
        labels.each(updateLabels);
        updateLegend({labels: legendLabels});
        activeInput.parentNode.classList.remove('active');
        this.parentNode.classList.add('active');
        activeInput = this;
        updateHeader();
        GTMPush('PA-Retirement|MapField|' + this.value);
    }

    inputs.forEach(input => {
        input.addEventListener('change', changeHandler);
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

    var svg = svgContainer.select('svg.background');
    

    var counties = svg.selectAll('path').data(d => d.filter(_d => _d.county !== 'Pennsylvania'), function(_d){
        return _d ? slugger(_d.county) : this.getAttribute('data-county');
    });
    // in all cases, dev, prerender, page load, the paths will already be part of the svg
    //counties
    
    counties.each(update);

    var labels = d3.selectAll('div.g-Layer_1');
    
    labels.data(data.filter(d => d.county !== 'Pennsylvania'), function(_d){
        
        return _d ? slugger(_d.county) : slugger(this.getAttribute('data-key'));
    });

    labels.each(updateLabels);

    updateHeader();

    var topSVG = svgContainer.select('svg:not(.background)');
    topSVG.call(tip);
    var topCounties = topSVG.selectAll('path').data(d => d.filter(_d => _d.county !== 'Pennsylvania'), function(_d){
        return _d ? slugger(_d.county) : this.getAttribute('data-county');
    });
    topCounties
        .on('mouseenter', tip.show)
        .on('mouseleave', tip.hide);
    
    legendLabels = initLegend({container: svgContainer});
    updateLegend({labels: legendLabels});
}
function returnArray(j){
    var arr = [];
    for ( let i = 0; i < j; i++ ){
        arr.push(1);
    }
    return arr;
}
function initLegend(){
    var legend = d3.select(sectionHead).selectAll(`div.${s.legend}`)
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
function updateLegend({labels}){
    labels.data(extents[selectedField])
        .text(d => d3.format(metadata[selectedField].format)(d))
        .classed(s.max, (d,i) => i == 1);
}
function update(d,i,array){
    var county = d3.select(array[i]);
    scale.domain(extents[selectedField]);
    county
        .attr('fill', d => {
            var interp = d3.piecewise(d3.interpolateRgb, colors);
            return interp(scale(d[selectedField]));
    });
}
function updateLabels(d,i,array){
    var label = d3.select(array[i]);
    
    label
        .classed('on-light', d => scale(d[selectedField]) < 0.25 || ['Philadelphia','Delaware'].includes(d.county));
}
function updateHeader(){
    sectionHeadText.innerHTML = metadata[selectedField].display;
}