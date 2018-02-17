Vue.component('v-map', Vue2Leaflet.Map);
Vue.component('v-tilelayer', Vue2Leaflet.TileLayer);
Vue.component('v-marker', Vue2Leaflet.Marker);
Vue.component('v-rectangle', Vue2Leaflet.Rectangle);
Vue.component('v-tooltip', Vue2Leaflet.Tooltip);

Dropzone.options.json = {
	paramName: 'file',
	maxFiles: 1,
	headers: {
		precision: 6,
	},
	dictDefaultMessage: 'Suelta aquí el GeoJSON',
	init: function() {
		this.on('addedfile', function(file) {
			$('.toHide').hide();
		});
		this.on('success', function(file, response) {
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

			// Find center of polygon
			let center = rectangles[0].coords[0];
			vueMap.center = center;
		});
	},
};

$('#precision').on('change', function() {
	Dropzone.options.json.headers.precision = $(this).val();
});

let hashHolder = new Vue({
	el: '#hashHolder',
	data: {
		features: [],
	},
});

let vueMap = new Vue({
	el: '#mapHere',
	data() {
		return {
			zoom: 13,
			center: [47.41322, -1.219482],
			url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
			attribution:
				'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
			options: {permanent: false},
			rectangles: [],
		};
	},
});
