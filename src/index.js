/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
/* global PUBLICPATH */
import Papa from 'papaparse';
import dataFile from './data/county-data.csv'; // via file-loader ie path to asset
import { initBarCharts } from './components/bar-chart/';
import initTable from './components/table/';
import initMap from './components/map/';
import initCountyData from './components/county-data/';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling
import './css/styles.scss';

const publicPath = window.IS_PRERENDERING ? '' : PUBLICPATH;
const container = document.querySelector('#render-here');
function referenceHandler(){
    if ( window.requestIdleCallback ){
        requestIdleCallback(() => window.scrollBy(0,-100), {timeout: 100});
    } else {
        setTimeout(() => window.scrollBy(0, -100));
    }
    
}
function init(results){
    initMap({data: results.data});
    initBarCharts({data: results.data});
    initTable({data: results.data, columns: results.meta.fields, container});
    initCountyData(results.data);
    tippy('[data-tippy-content]', {
        offset: [0,0],
        trigger: 'mouseenter focus',
        allowHTML: true
    });
    document.querySelectorAll('a[href^="#_ftn"]').forEach(link => {
        link.addEventListener('click', referenceHandler);
    });
    if ( window.IS_PRERENDERING ){
        document.dispatchEvent(new Event('custom-render-trigger'));
    }
}
Papa.parse(publicPath + dataFile, {
    complete: function(results) {
        init(results);
    },
    download: true,
    dynamicTyping: true,
    error: function(error, file) {
        console.log(error,file);
    },
    header: true,
    skipEmptyLines: true
});

// TO DO custim event should fire after all components have rendered
//document.dispatchEvent(new Event('custom-render-trigger'));