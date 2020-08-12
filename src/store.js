import { writable } from 'svelte/store';

const countyStore = writable('Adams');

export { countyStore };