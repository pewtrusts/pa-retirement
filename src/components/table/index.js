/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import d3 from '@Project/d3-importer.js';
import StringHelpers from '@Submodule/UTILS';
import metadata from '@Project/data/metadata.json';
import createBarChart from '@Project/components/bar-chart/';
import slugger from 'slugger';
import s from './styles.scss';

if ( module.hot ){
    module.hot.accept('./styles.scss');
}

function format({property, value}){
    return metadata[property].format ? d3.format(metadata[property].format)(value) : value;
}
function tableFormat({property, value}){
    //  alignment fix
    if (format({property,value}).replace(/[$%]/,'').toString().length == 1 ){
        return `&nbsp;&nbsp;${format({property,value}).replace(/[$%]/,'')}`
    }
    return format({property,value}).replace(/[$%]/,'');
}
function display(value){
    return metadata[value].display;
}
function displayShort(value){
    return metadata[value].short || metadata[value].display;
}
function maybeCreateBarChart(d){
    if ( ['d_insuff','d_ratio'].indexOf(d.property) !== -1 ){
        createBarChart.call(this.children[0], d);   // send the <td>'s <div> as the container       
    }
}
export default function init({data,columns,container}){
    data.sort(function(a,b){
        
        return a.county == 'Pennsylvania' ? -1 : b.county == 'Pennsylvania' ? 1 : 0;
    });
    var table = d3.select(container)
        .selectAll('table.js-main-table')
        .data([data]); 

    {
        let entering = table.enter()
            .append('table')
            .attr('class', `js-main-table ${s.PATable}`);

        entering.append('thead').append('tr');
        entering.append('tbody');

        table = table.merge(entering);
    }

    var headerRow = table.select('thead tr')
        .selectAll('th')
        .data(columns, function(d){
          return d ? d : this.getAttribute('data-key');  
        });

    {
        let entering = headerRow.enter()
            .append('th')
            .attr('data-key', d => d)
            .attr('scope','column')
            .attr('tabindex', (d,i) => i == 0 ? null : 0)
            .attr('data-tippy-content', (d,i) => i == 0 ? null : display(d))
            .text(d => displayShort(d));

        headerRow = headerRow.merge(entering);
        headerRow.exit().remove();
    }

    var rows = table.select('tbody')
        .selectAll('tr')
        .data(d => {
            return d;
        }, function(_d){
          return _d ? slugger(_d.county) : this.getAttribute('data-key');  
        });

    {
        let entering = rows.enter()
            .append('tr')
            .classed(s.averageRow, d => d.county == 'Pennsylvania')
            .attr('data-key', d => slugger(d.county));

        rows = rows.merge(entering);
        rows.exit().remove();
    }
    var rowHeads = rows.selectAll('th')
        .data(d => [d.county], function(_d){
            return _d ? `row-head-${slugger(_d)}` : this.getAttribute('data-key');
        });

    {
        let entering = rowHeads.enter()
            .append('th')
            .attr('data-key', d => `row-head-${slugger(d)}`)
            .attr('data-column', d => 'County')
            .text(d => d);

        rowHeads = rowHeads.merge(entering);
        rowHeads.exit().remove();
    }
    var dataCells = rows.selectAll('td')
        .data(d => columns.slice(1).map(key => {
            return {
                county: d.county,
                property: key,
                value: d[key]
            };
        }), function(_d){
            return _d ? ( _d.county + _d.property + _d.value).hashCode() : this.getAttribute('data-key');
        });

        {
            let entering = dataCells.enter()
                .append('td')
                .attr('data-key', d => ( d.county + d.property + d.value).hashCode())
                .attr('data-column', d => displayShort(d.property))
                .attr('data-row', d => d.county)
                .attr('title', d => display(d.property).replace(/<[^>]+>/g, ''))
                .classed(s.percent, d => metadata[d.property].format && metadata[d.property].format.includes('%'))
                .classed(s.currency, d => metadata[d.property].format && metadata[d.property].format.includes('$'))
                .classed(s.hasBarChart, d => ['d_insuff','d_ratio'].includes(d.property))
                .html(d => {
                    
                    return `<div><span><span>${tableFormat({value: d.value, property: d.property})}</span></span></div>`;
                })
                .each(maybeCreateBarChart);

            dataCells = dataCells.merge(entering);
            dataCells.exit().remove();
        }

}