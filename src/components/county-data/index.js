/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import d3 from '@Project/d3-importer.js';
import StringHelpers from '@Submodule/UTILS';
import metadata from '@Project/data/metadata.json';
import slugger from 'slugger';
import initColumnCharts from '@Project/components/column-chart';
import { initChart } from '@Project/components/column-chart';
import { updateChart } from '@Project/components/column-chart';
import s from './styles.scss';
import UISvelte from '@Submodule/UI-svelte/';

if ( module.hot ){
    module.hot.accept('./styles.scss');
}

const collection = [['d_insuff','shortfall'],['d_ratio','liability','required']];
var data;
var componentWrappers;

export default function(_data){
    data = _data;
    initSelector(data);
    initColumnCharts(data);
    function returnRows(){
        var rows = d3.select('.county-data--chart-wrapper').selectAll('div.js-row')
            .data(collection);

        {
            let entering = rows.enter()
                .append('div')
                .attr('class', (d,i) => `js-row ${s.row} ${s['row-' + i]}`);

            rows = rows.merge(entering);
        }
        return rows;
    }
    function returnComponentWrappers(){
        var _componentWrappers = returnRows().selectAll('div.js-county-data-component-wrapper')
            .data( d => d);

        {
            let entering = _componentWrappers.enter()
                .append('div')
                .attr('class',`js-county-data-component-wrapper ${s.componentWrapper}`);

            _componentWrappers = _componentWrappers.merge(entering);
        }

        return _componentWrappers;
    }
    function returnComponents(d){
        var component = d3.select(this);
        /* chart */
        component.call(initChart)
        component.call(updateChart, {field: d})

        /* callout */
        component.call(initCallout);
        component.call(updateCallout, {data, field: d});

        /* title */
        component.call(initTitle, d);

    }
    componentWrappers = returnComponentWrappers();
    componentWrappers.each(returnComponents);
    
}

function initCallout(component){
    var callout = component.selectAll('div.js-callout span')
        .data([1]);

        {
            let entering = callout.enter()
                .append('div')
                .attr('class', `js-callout ${s.callout}`)
                    .append('span')
                    .text('xx');

            callout = callout.merge(entering);
        }
}
function updateCallout(component, {data,field,county = 'Adams'}){
    var calloutValue = data.find(d => d.county == county)[field];
    component.select('div.js-callout span')
        .datum(calloutValue)
        .html(d => field !== 'required' ? 
            d3.format(metadata[field].format)(d) :
            `${d3.format(metadata[field].format)(d)} a year<br />` +
            `or ${d3.format(metadata[field].format)(d / 12)} a month`
        );
}
function initTitle(component,field){
    var title = component.selectAll('div.js-title')
        .data([field]);

    {
        let entering = title.enter()
            .append('div')
            .attr('class', `js-title ${s.title}`)
            .text(d => metadata[d].display);
    }
}
function updateComponent({d,i,arr,county}){
    var component = d3.select(this);
    /* chart */
    component.call(updateChart, {field: d, county})

    /* callout */
   component.call(updateCallout, {data, field: d, county});

}
function selectionHandler(){
    var county = this.dataset.value;
    componentWrappers.each(function(d,i,arr){
        updateComponent.call(this,{d,i,arr,county});
    })
}
function initSelector(data){
    var dropdown = new UISvelte.dropdown({
        target: document.querySelector('#county-data-selector'),
        props: {
            label: 'Please select a county:',
            options: data.filter(d => d.county !== 'Pennsylvania').map(d => {
                return {
                    value: d.county,
                    display: d.county
                };
            }),
            itemOnClick: selectionHandler
        }
    });
}