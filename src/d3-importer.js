import { extent } from 'd3-array';
//import { axisBottom, axisLeft } from 'd3-axis';
//import { entries, nest}         from 'd3-collection';
import { transition } from      'd3-transition';
import { format, formatLocale } from 'd3-format';
import { interpolateRgb, interpolateRgbBasis, piecewise }       from 'd3-interpolate';
//import { path }                 from 'd3-path';
import { scaleLinear }          from 'd3-scale';
import { select, selectAll }    from 'd3-selection';
import tip                      from './d3-tip.js';
// TO DO: IMPORT ONLY WHAT'S NEEDED
export default {
    extent,
    format,
    formatLocale,
    interpolateRgb,
    interpolateRgbBasis,
    piecewise,
    scaleLinear,
    select,
    selectAll,
    tip,
    transition,
};
export { format }; 