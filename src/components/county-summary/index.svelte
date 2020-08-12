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
    In 2030, on average, residents aged 65 and older in {county} County with a
    household income of less than $75,000 can expect an annual {shortfall} income
    shortfall due to insufficient savings. Without new saving, county taxpayers
    will need to pay a cumulative {liability} from 2015 to 2030 to
    maintain existing social services to older residents. The burden is
    exacerbated by the fact that the aged dependency ratio—the number of aged
    65 and older households to households aged 20-64—will rise by {d_ratio}.
</p>
<p>
    However, household savings of just {required} a year—{perMonth} a month—over this
    period can erase the gap and allow for a retirement without lifestyle
    changes driven by inadequate savings.
</p>

