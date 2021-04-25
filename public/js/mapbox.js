/* eslint-disable*/
console.log('Hello from the client side')

const locations = JSON.parse(document.getElementById('map').dataset.locations)

console.log(locations)

mapboxgl.accessToken = 'pk.eyJ1IjoiYXJpbm1pdHIiLCJhIjoiY2ttb2loaDB1MGMwZjJvbGZvMG80M3BpciJ9.0_mk1l26Eksn1VdeB4F_kA'
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
})
