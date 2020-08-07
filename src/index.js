/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
/* global PUBLICPATH */
import Papa from 'papaparse';
import dataFile from './data/county-data.csv'; // via file-loader ie path to asset
import { initBarCharts } from './components/bar-chart/';
import initTable from './components/table/';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling
import './css/styles.scss';

const publicPath = window.IS_PRERENDERING ? '' : PUBLICPATH;
const container = document.querySelector('#render-here');

function init(results){
    initBarCharts({data: results.data});
    initTable({data: results.data, columns: results.meta.fields, container});
    tippy('[data-tippy-content]', {
        offset: [0,0],
        trigger: 'mouseenter focus'
    });
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