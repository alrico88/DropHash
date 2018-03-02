import * as polyhash from 'geohash-poly';
import * as reproject from 'reproject';
import * as epsg from 'epsg';
import * as ClipboardJS from 'clipboard';
import {flattenDeep, uniq} from 'lodash';

Vue.component('v-map', Vue2Leaflet.Map);
Vue.component('v-tilelayer', Vue2Leaflet.TileLayer);
Vue.component('v-marker', Vue2Leaflet.Marker);
Vue.component('v-rectangle', Vue2Leaflet.Rectangle);
Vue.component('v-tooltip', Vue2Leaflet.Tooltip);

$('#precision').on('change', function() {
	let json = LocalMemory.getKey('mapa');
	lookForHashes(json);
});

let hashHolder = new Vue({
	el: '#hashHolder',
	data: {
		items: function() {
			if (this.display === 'split') {
				return this.features;
			} else {
				let onlyHashes = _.flattenDeep(this.features.map((a) => a.hashes));
				let uniqueHashes = _.uniq(onlyHashes);
				let joined = [
					{
						name: 'Todo el GeoJSON',
						hashes: uniqueHashes,
					},
				];
				return joined;
			}
		},
		display: 'split',
		features: [],
	},
});

let vueMap = new Vue({
	el: '#mapHere',
	data() {
		return {
			zoom: 13,
			center: [47.41322, -1.219482],
			url: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
			attribution:
				'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
			options: {permanent: false},
			rectangles: [],
		};
	},
});

window.onload = function() {
	let fileInput = document.getElementById('fileInput');

	fileInput.addEventListener('change', function() {
		let file = fileInput.files[0];

		let reader = new FileReader();

		reader.onload = function(e) {
			let json = JSON.parse(reader.result);
			LocalMemory.store('mapa', json);
			lookForHashes(json);
		};

		reader.readAsText(file);
	});
};

async function lookForHashes(json) {
	showLoading(true);
	let precision = $('#precision').val();
	let response = await getAllHashes(json, precision);
	hashHolder.features = response;
	let rectangles = [];
	response.map((feature) => {
		feature.hashes.map((a) => {
			let sw = [Geohash.bounds(a).sw.lat, Geohash.bounds(a).sw.lon];
			let ne = [Geohash.bounds(a).ne.lat, Geohash.bounds(a).ne.lon];
			let coords = [L.latLng(sw), L.latLng(ne)];
			rectangles.push({
				hash: a,
				coords: coords,
			});
		});
	});
	vueMap.rectangles = rectangles;
	newCenterCoords(json);
	showLoading(false);
}

async function getAllHashes(json, precision) {
	json = geoJsonReproject(json);

	let promisesArray = [];

	for (let feature of json.features) {
		promisesArray.push(new Promise((resolve, reject) => {
				findHashesInside(
					feature.geometry.coordinates,
					parseInt(precision),
					(err, hashes) => {
						if (err) {
							reject(err);
						} else {
							resolve({
								name: feature.properties,
								hashes: hashes,
							});
						}
					}
				);
			}));
	}

	try {
		let result = await Promise.all(promisesArray);
		return result;
	} catch (err) {
		throw err;
	}
}

function geoJsonReproject(json) {
	try {
		let newJson = reproject.toWgs84(json, undefined, epsg);
		return newJson;
	} catch (err) {
		console.log('No se ha podido cambiar proyección');
		return json;
	}
}

function findHashesInside(polygon, precision, callback) {
	polyhash(
		{
			coords: polygon,
			precision: precision,
		},
		(err, hashes) => {
			callback(err, hashes);
		}
	);
}

class LocalMemory {
	static store(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	static getKey(key) {
		return JSON.parse(localStorage.getItem(key));
	}
}

function getCentroid(arr) {
	return arr.reduce(
		function(x, y) {
			return [x[0] + y[0] / arr.length, x[1] + y[1] / arr.length];
		},
		[0, 0]
	);
}

function newCenterCoords(json) {
	let center;
	if (typeof json.features[0].geometry.coordinates[0][0][0] !== 'number') {
		center = getCentroid(json.features[0].geometry.coordinates[0][0]);
	} else {
		center = getCentroid(json.features[0].geometry.coordinates[0]);
	}
	vueMap.center = L.latLng(center[1], center[0]);
}

$('.dataDisplayChanger').click(function(e) {
	e.preventDefault();
	let newDisplay = $(this).attr('data-display');
	$('.dataDisplayChanger').removeClass('active');
	$(this).addClass('active');
	hashHolder.display = newDisplay;
});

function showLoading(status) {
	if (status) {
		$('#loadingSpinner').show();
	} else {
		$('#loadingSpinner').hide();
	}
}

function flashCopy(element) {
	let $element = $(element);
	$element.css('background-color', '#FFF3AD');
	let icon = `<i class="fa fa-check mr"></i>`;
	$element
		.closest('ul')
		.append(`<p class="copyMessage">${icon}Copiado al portapapeles`);
	setTimeout(function() {
		$element.css('background-color', 'transparent');
		$element
			.closest('ul')
			.find('.copyMessage')
			.remove();
	}, 2000);
}

var clipboard = new ClipboardJS('.btn-copy');

clipboard.on('success', function(e) {
	flashCopy(e.trigger);
	e.clearSelection();
});
