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

const container = document.querySelector('#pa-map-container');

export default function initMap({data}){
    var svg = d3.select(container)
        .selectAll('div.js-svg-container')
        .data([data]);

    {
        let entering = svg.enter()
            .append('div.js-svg-container')
            .html(mapSVG);
    }
}
