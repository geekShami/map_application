let leafletUtils = function(){

        let main                = this;
        main.envObj             = null;
        main.mymap              = null;
        main.mapDivId           = null;
        main.currentDrawingMode = null;
        main.currentDrawingData = [];
        main.currentDrawingOBj  = null;
        main.mapObjects         = [];
        main.objectClickCoord   = null;
        main.shapeMouseDown     = false;
        main.baseLayers         = [];
        main.currentBasLayer    = null;
        main.greenIcon          = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        main.redIcon            = new L.Icon({
                                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                    iconSize: [25, 41],
                                    iconAnchor: [12, 41],
                                    popupAnchor: [1, -34],
                                    shadowSize: [41, 41]
                                });
        main.editMarkers        = [];
        main.markerMouseDown    = false;
        main.currentMarker      = null;
        

        main.editMarkerStyle    = {
                                    color: 'black',
                                    weight: 1,
                                    fillColor: 'white',
                                    fillOpacity: 1,
                                    radius: 5
                                }
   
    
    
    main.init = function(env){
        main.envObj = env;
        
    }

    //attache leaflet base map to the given div with given center
    main.setupMap = function(id, center){

        main.mapDivId = id;
        main.mymap = L.map(main.mapDivId).setView(center, 10);
        // console.log('..... added leaflet base map to the div');

    }
 
    // register map box tiles in local array namely baseLayers
    // setup Mapbox maps
    // @param {layer} name of Open Steem Maps
    main.addMbTile = function(layer, displayName){

        let baseLayer = {};
            baseLayer.id = main.envObj.guidGenerator();
            baseLayer.layer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: layer,
                tileSize: 512,
                zoomOffset: -1,
                accessToken: 'pk.eyJ1IjoicmF6YWFmbGFrIiwiYSI6ImNra3IxZDBwZTFzZDUyb25za2RoMjdoeTAifQ.Ckc930xn-g5TsE8nBgzaag'
            });
            baseLayer.name = displayName;
            main.baseLayers.push(baseLayer);
        return baseLayer.id;
    }

    //load a layer with specified guid to the map and remove existing base map
    main.loadLayerToMap = function(guid){

        let idx = main.baseLayers.findIndex(o=>o.id === guid);
        let baseLayer = main.baseLayers[idx];

        if(main.currentBasLayer!=null){
            main.mymap.removeLayer(main.currentBasLayer.layer);
        }

        main.currentBasLayer = baseLayer;
        main.mymap.addLayer(baseLayer.layer);

    }


    //register map box tiles in local array namely baseLayers
    main.addOrdananceMap = function(map,displayName, key){

        let serviceUrl = 'https://api.os.uk/maps/raster/v1/zxy';
        let baseLayer = {};
        baseLayer.id = main.envObj.guidGenerator();
        baseLayer.layer = L.tileLayer(serviceUrl + '/'+map+'/{z}/{x}/{y}.png?key=' + key, {
            maxZoom: 20
        });
        baseLayer.name = displayName;
        main.baseLayers.push(baseLayer);
        return baseLayer.id;
    }


    //these functions will be implemented in the later add shape block
    //definition is required here because swithcing between base maps requires stop drawing
    main.StartDrawing = function(mode){}
    main.StopDrawing = function(elements){}
    main.startDistanceTool = function(){}
    main.stopDistanceTool = function(el){}
    main.startPointTool = function(){}
    main.stopPointTool = function(el){}
    main.addCircle = function(center, radius){}
    main.addPolyline = function(points){}
    main.addPolygon = function(points){}
    main.addMarker = function(lat, lng){}



    // change cursor type for all shapes on the map to given type
    //@param  {type} cursor type.
    main.changeCursor = function(type){

        let elements = document.getElementsByClassName('leaflet-interactive');
        for(let i=0;i<elements.length;i++){
            elements[i].style.cursor = type;
        }
    }

    //remove all shapes from the map
    main.removeAllShapes = function(){

        main.mapObjects.forEach(obj => {
            
            main.mymap.removeLayer(obj.shape);
        });
        main.mapObjects.splice(0,main.mapObjects.length);
    }

    main.removeObject = function(guid){

        let idx = this.mapObjects.findIndex(o => o.id === guid);
        let obj = this.mapObjects[idx];
        main.mymap.removeLayer(obj.shape);
        main.mapObjects.splice(idx,1);
        main.StopDrawing([]);
    }

    
}


let  googleUtils = function(){
    
    let main                     = this;
    main.envObj                  = null;
    main.mymap                   = null;
    main.currentDrawingMode      = null;
    main.currentDrawingData      = [];
    main.currentDrawingOBj       = null;
    main.editMarkers             = [];
    main.mapObjects              = [];
    main.editMarkerStyle        = {
                                    path: google.maps.SymbolPath.CIRCLE,
                                    fillOpacity: 1,
                                    fillColor: 'white',
                                    strokeOpacity: 1.0,
                                    strokeColor: 'black',
                                    strokeWeight: 1, 
                                    scale: 5 //pixels
                                  };

   
    
    
    main.init = function(env){
        main.envObj = env;
        
    }

    //attach google map to given div with specified center point
    main.setupMap = function(id, center){

        main.mymap = new google.maps.Map(document.getElementById(id), {
            center: center,
            zoom: 10,
            disableDefaultUI: true,
            zoomControl: true,
            streetViewControl:true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP,
              },
            scaleControl: true
          });
        // console.log('..... added google map to the div');


    }


    //change google map tile type
    main.setMapType = function(mapType){

        main.mymap.setMapTypeId(mapType);

    }


    main.removeAllShapes = function(){

        main.mapObjects.forEach(obj => {
            obj.shape.setMap(null);
        });
        main.mapObjects.splice(0,main.mapObjects.length);
    }

   

    //these functions will be implemented in the later add shape block
    //definition is required here because swithcing between base maps requires stop drawing
    main.StartDrawing = function(mode){}
    main.StopDrawing = function(elements){}
    main.startDistanceTool = function(){}
    main.stopDistanceTool = function(el){}
    main.startPointTool = function(){}
    main.stopPointTool = function(el){}
    main.addCircle = function(lat, lng, rad){}
    main.addPolygon = function(coords){}
    main.addPolyline = function(coords){}
    main.addMarker = function(lat, lng){}


    main.removeObject = function(guid){

        let idx = this.mapObjects.findIndex(o => o.id === guid);
        let obj = this.mapObjects[idx];
        obj.shape.setMap(null);
        main.mapObjects.splice(idx,1);
        main.StopDrawing([]);
    }

}


let initEnv = function(){

    let main = this;
    main.lutils             = null;
    main.gUtils             = null;
    main.currentLayerDiv    = null;
    main.currentMapType     = 'leaflet';        //leaflet, google

    //list of map box styles provided
    main.mapboxTiles      =  [{url:'mapbox/streets-v11', name:'Mapbox Streets'},                                  
                            {url:'mapbox/outdoors-v11',name:'Mapbox Outdoors'},
                            {url:'mapbox/light-v10',name:'Mapbox Light'},
                            {url:'mapbox/dark-v10',name:'Mapbox Dark'},
                            {url:'mapbox/satellite-v9',name:'Mapbox Satellite'},
                            {url:'mapbox/satellite-streets-v11',name:'Mapbox Satellite Streets'}]

    main.geoJsonLayers  =   [{name:'london_boroughs',url:'geoJSON/london_boroughs.json'}];

    main.ordananceMaps  =   [
                             {url:'Road_3857',name:'Ordnance Survey Road'},
                             {url:'Outdoor_3857',name:'Ordnance Survey Outdoor'},
                             {url:'Light_3857',name:'Ordnance Survey Light'}
                            ];
    main.osApiKey = 'DpLML0pLRFtrLGEE6I5sxTM7yM15l52C';
    
    main.googleMapTypes = [{url:'roadmap',name:'Google RoadMap'},{url:'satellite',name:'Google Satellite'},{url:'hybrid',name:'Google Hybrid'},{url:'terrain',name:'Google Terrain'}];

    main.lutils         = null;
    main.gUtils         = null;
    main.gmapDiv        = 'gmap';
    main.lmapDiv        = 'lmap';
    



    main.init = function(){



        // i m using my own mapid. you can comment my mapid and use your own
        // let mapid;
        // mapid = $('<div></div>');
        // mapid.css("width", "100%");
        // mapid.css("height", "100%");
        // mapid.css("cursor", "pointer");


       /*************creating map div************** */
       console.log('map div style');
       let mapid = document.getElementsByClassName('mapcontainer')[0];
       mapid.style.position = 'relative';
       mapid.style.width = '100%';
       mapid.style.height = '550px';
        
       let div1 = `<div id='lmap' style='position:absolute; width:100%; height:100%; left:0; top:0'></div>`;
       let div2 = `<div id='gmap' style='position:absolute; width:100%; height:100%; left:0; top:0; display:none'></div>`;

       mapid.innerHTML = div1 + div2;
   

       /*************creating map div************** */

    


       //create object of leaflet utils
       main.lutils = new leafletUtils();
       main.lutils.init(main);
       main.lutils.setupMap(main.lmapDiv ,[51.505, -0.09]);

       //loading mapbox tiles
       main.mapboxTiles.forEach((layer,idx)=>{
           let guid = main.lutils.addMbTile(layer.url, layer.name);
           if(idx==-0){
                main.lutils.loadLayerToMap(guid);          //add first baselayer to map
            }
       })
    //    console.log('..... loaded map box tiles');

       //loading ordanance survey tiles
       main.ordananceMaps.forEach(map => {         
            let id = main.lutils.addOrdananceMap(map.url, map.name, main.osApiKey);
       });
    //    console.log('..... loaded ordnance survey tiles');



       //creates object of google utils
       main.gUtils = new googleUtils();
       main.gUtils.init(main);
       main.gUtils.setupMap(main.gmapDiv, {lat:51.505,lng: -0.09});


       //synchroziation of leaflet and google map zooming and panning
       main.lutils.mymap.addEventListener('moveend', event=>main.leafletZoom(event));
       main.gUtils.mymap.addListener('idle', event=>main.googleZoom(event));


       document.addEventListener('keydown', event=>{main.onKeyPress(event);});


    }


    // generates unique id
    main.guidGenerator = function() {
        let S4 = function(){
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }


    main.leafletZoom = function(e){

        if(main.currentMapType === 'leaflet'){

            let level = main.lutils.mymap.getZoom();
            let center = main.lutils.mymap.getCenter();
            main.gUtils.mymap.setCenter(center);
            main.gUtils.mymap.setZoom(level);
        }

    }

    main.googleZoom =function(e){

        if(main.currentMapType === 'google'){
            let level = main.gUtils.mymap.getZoom();
            let center = main.gUtils.mymap.getCenter();
            main.lutils.mymap.setView({lat:center.lat(), lng:center.lng()}, level)

        }

    }


    main.onKeyPress = function(e){

        if(e.code==="Delete" || e.keyCode===46 || e.code || e.code ==='KeyX'){
            
            if(main.currentMapType==='leaflet' && main.lutils.currentDrawingMode==='edit'){

                main.lutils.removeObject(main.lutils.currentDrawingOBj.id);
            }
            else if(main.currentMapType==='google' && main.gUtils.currentDrawingMode==='edit'){

                main.gUtils.removeObject(main.gUtils.currentDrawingOBj.id);
            }
        }
    }

    //this function copy all shapes from google map and put those shapes on leaflet map
    main.copyShapesFromGoogleToLeaflet = function(){
        //remove previous objects, get objects from google and draw on leaflet/
            /******************************************************************* */
            if(main.lutils.mapObjects.length>0){
                main.lutils.removeAllShapes();
            }


            main.gUtils.mapObjects.forEach(obj=>{

               if(obj.type==='marker'){
                   let pos = obj.shape.position;
                   main.lutils.addMarker(pos.lat(),pos.lng());  
                    
               }
               if(obj.type==='circle'){

                   let rad = obj.shape.getRadius();
                   let cnt = obj.shape.getCenter();
                   main.lutils.addCircle({lat:cnt.lat(),lng:cnt.lng()}, rad);
               }
               if(obj.type ==='polygon'){

                   let gVertices = obj.shape.getPath().getArray();
                   let lVertices = gVertices.map(v => {
                       return {lat:v.lat(),lng:v.lng()};
                   })
                   main.lutils.addPolygon(lVertices);
               }
               if(obj.type === 'polyline'){

                   let gVertices = obj.shape.getPath().getArray();
                   let lVertices = gVertices.map(v => {
                       return {lat:v.lat(),lng:v.lng()};
                   })
                   main.lutils.addPolyline(lVertices);
               }
           
               
            });
    }


    //this function copy all shapes from leaflet map and put those shapes on google map
    main.copyShapesFromLeafletToGoogle = function(){
        //remove previous objects, get objects from leaflet and draw on google/
        /******************************************************************* */
        if(main.gUtils.mapObjects.length>0){

            main.gUtils.removeAllShapes();

        }
        main.lutils.mapObjects.forEach(obj => {

            if(obj.type==='marker'){

                let pos = obj.shape.getLatLng();
                main.gUtils.addMarker(pos.lat,pos.lng);
            }
            if(obj.type==='circle'){
                    
                let radius = obj.shape.getRadius();
                let center = obj.shape.getLatLng();
                main.gUtils.addCircle(center.lat, center.lng, radius);
            }
            if(obj.type==='polygon'){
                    
                let coords = obj.shape.getLatLngs()[0];
                main.gUtils.addPolygon(coords);
            }
            if(obj.type==='polyline'){

                let coords = obj.shape.getLatLngs();
                main.gUtils.addPolyline(coords);
            }

        });
    }


}