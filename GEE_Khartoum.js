JavaScript code to be implemented in Google Earth Engine(c) developed by F. Brandolini
// to accompany the paper: 
// Zerboni A., Brandolini F., Mariani G.S. et . al 2020 - "Urban geomorphology of the Khartoum-Omdurman conurbation: a 
// growing megacity at the confluence of the Blue and White Nile rivers".
// published in 'The Journal of Maps'

//                ------------- o -------------

// TO EXECUTE THE ALGORITHM PASTE THIS CODE INTO GOOGLE EARTH ENGINE CODE EDITOR AND PRESS 'Run'

//                ------------- o -------------
//KSA = Khartoum Study Area

//Satellite Image of Khartoum in 1989//
var cloudMaskL457 = function(image) {
  var qa = image.select('pixel_qa');
  
  var cloud = qa.bitwiseAnd(1 << 5)
                  .and(qa.bitwiseAnd(1 << 7))
                  .or(qa.bitwiseAnd(1 << 3));
                  
  var mask2 = image.mask().reduce(ee.Reducer.min());
  return image.updateMask(cloud.not()).updateMask(mask2);
};

var K1989 = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
                  .filterDate('1989-01-01', '1989-12-31')
                  .filterBounds(KSA)
                  .map(cloudMaskL457);

var visParams5 = {
  bands: ['B3', 'B2', 'B1'],
  min: 0,
  max: 3000,
  gamma: 1.4,
};

//Satellite Image of Khartoum in 1999//
var K1999 = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
                  .filterDate('1999-01-01', '1999-12-31')
                  .map(cloudMaskL457);


//Satellite Image of Khartoum in 2009//
var K2009 = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')
                  .filterDate('2009-01-01', '2009-12-31')
                  .map(cloudMaskL457);

//Satellite Image of Khartoum in 2019//
function maskL8sr(image) {
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  var qa = image.select('pixel_qa');
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                 .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask);
}

var K2019 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                  .filterDate('2019-01-01', '2019-12-31')
                  .map(maskL8sr);
                  
var visParams8 = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000,
  gamma: 1.4,
};

// DEM
var data = ee.Image('JAXA/ALOS/AW3D30/V2_2');

var elevation = data.select('AVE_DSM')
.clip(KSA);

var elevationVis = {
  min: 370,
  max: 450,
  palette: ['a6611a', 'dfc27d', 'f5f5f5', '80cdc1', '018571'],
};

// Add Layers
Map.centerObject(KSA, 12);
Map.addLayer(elevation, elevationVis, 'Elevation');
Map.addLayer(K1989.median(), visParams5);
Map.addLayer(K1999.median(), visParams5);
Map.addLayer(K2009.median(), visParams5);
Map.addLayer(K2019.median(), visParams8);

// Export Images

Export.image.toDrive({
  image: elevation.visualize(elevationVis),
  description: 'DEM_30',
  scale: 30,
  crs: 'EPSG:32636',
  region: KSA,
  fileFormat: 'GeoTIFF'
});

Export.image.toDrive({
  image: K1989.median().visualize(visParams5),
  description: 'Khartoum_1989',
  scale: 50,
  crs: 'EPSG:32636',
  region: KSA,
  fileFormat: 'GeoTIFF'
});

Export.image.toDrive({
  image: K1999.median().visualize(visParams5),
  description: 'Khartoum_1999',
  scale: 50,
  crs: 'EPSG:32636',
  region: KSA,
  fileFormat: 'GeoTIFF'
});

Export.image.toDrive({
  image: K2009.median().visualize(visParams5),
  description: 'Khartoum_2009',
  scale: 50,
  crs: 'EPSG:32636',
  region: KSA,
  fileFormat: 'GeoTIFF'
});

Export.image.toDrive({
  image: K2019.median().visualize(visParams8),
  description: 'Khartoum_2019',
  scale: 50,
  crs: 'EPSG:32636',
  region: KSA,
  fileFormat: 'GeoTIFF'
});
