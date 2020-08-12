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

if ( module.hot ){
    module.hot.accept('./styles.scss');
}

const collection = [['d_insuff','shortfall'],['d_ratio','liability','required']];

export default function(data){
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
        var componentWrappers = returnRows().selectAll('div.js-county-data-component-wrapper')
            .data( d => d);

        {
            let entering = componentWrappers.enter()
                .append('div')
                .attr('class',`js-county-data-component-wrapper ${s.componentWrapper}`);

            componentWrappers = componentWrappers.merge(entering);
        }

        return componentWrappers;
    }
    function returnComponents(d){
        var component = d3.select(this);
        component.call(initChart)
        component.call(updateChart, {field: d})
    }
    returnComponentWrappers().each(returnComponents);
    
}