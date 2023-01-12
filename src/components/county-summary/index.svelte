<script>
/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
    import metadata from '@Project/data/metadata.json';
    import { format } from '@Project/d3-importer.js';
    import { countyStore } from '@Project/store.js';
    export let county;
    export let data
    
    countyStore.subscribe(v => {
        county = v;
    });

    $: datum = data.find(d => d.county == county);
    $: shortfall = format(metadata.shortfall.format)(datum.shortfall);
    $: liability = format(metadata.liability.format)(datum.liability);
    $: d_ratio = format(metadata.d_ratio.format)(datum.d_ratio);
    $: required = format(metadata.required.format)(datum.required);
    $: perMonth = format(metadata.required.format)(datum.required / 12);
</script>
<style>
    
</style>
<p>
    In 2035, on average, {county} County’s vulnerable older households can expect an annual income
    shortfall of {shortfall} due to insufficient savings. To maintain existing social services to older residents, county households on average will be on the hook for a cumulative {liability} in additional taxes from 2020 to 2035. The burden is exacerbated by the fact that the age dependency ratio—the number of households age 65 and older divided by the number of those age 20-64—will rise by {d_ratio}.
</p>
<p>
    However, household savings of just {required} a year—{perMonth} a month—over this period can erase the gap and allow for a retirement without lifestyle changes driven by inadequate savings.
</p>

