let jsonLoader = function(){

    //initialization parameters of json loader module

    let main                = this;
    main.envObj             = null;
    main.featureLayers      = [];
    main.geoJsonStyle       = {
                            "color": "#0078aa",
                            "weight": 2,
                            "opacity": 0.65,
                            "fill":true,
                            "fillColor":"#00dd00",
                            "fillOpacity":0.2
                            };



    main.init = function(env){

        main.envObj             = env;
        
    }

    //keep local reocrd of geoJSON urls
    main.registerJsonLayers = function(jsonLayers){

        jsonLayers.forEach(layer => {

            
            let fl = {};
            fl.id = main.envObj.guidGenerator();
            fl.leafletLayer = null;
            fl.googleLayer = null;
            fl.visible = false;
            fl.url = layer.url;
            fl.name = layer.name;
            main.featureLayers.push(fl);
        });
    }

    //create on/off button based on registered geoJSON urls
    main.initGui = function(layerUl){
        
        main.featureLayers.forEach(layer=>{

            let li = document.createElement('li');
            let div = document.createElement('div');
            div.setAttribute('data-id',layer.id);
                //div.classList.add('highlited');
            div.innerHTML = layer.name;
            div.addEventListener('click',(e)=>{main.onClickFeatureLayer(e);});
            li.appendChild(div);
            layerUl.appendChild(li);

        });
        console.log('..... added controls for geoJSON layers');

    }

    //logic to switch layer on/off on leaflet and google maps
    main.onClickFeatureLayer = function(e){
        

        let guid = e.target.getAttribute('data-id');                        //gets uid from clicked button
        let idx = main.featureLayers.findIndex(o=>o.id === guid);
        jsonLayer = main.featureLayers[idx];
        

        //if layer is not loaded then load it else remove it
        if(jsonLayer.leafletLayer===null && jsonLayer.googleLayer===null && jsonLayer.visible===false){
            
            //loading geojson data onto leaflet map
            jsonLayer.leafletLayer = main.loadLeafletLayer(jsonLayer, main.geoJsonStyle);
            //loaing geojson data onto googlem map
            jsonLayer.googleLayer = new google.maps.Data();
            jsonLayer.googleLayer.loadGeoJson(jsonLayer.url);
            jsonLayer.googleLayer.setMap(main.envObj.gUtils.mymap);
            jsonLayer.googleLayer.addListener('click',e=>{google.maps.event.trigger(main.envObj.gUtils.mymap, 'click', e);});
            jsonLayer.visible = true;
            e.target.classList.add('highlited');
        }
        else{
            //removes layer from both leaflet and geojson map
            main.envObj.lutils.mymap.removeLayer(jsonLayer.leafletLayer);
            jsonLayer.googleLayer.setMap(null);
            jsonLayer.leafletLayer = null;
            jsonLayer.googleLayer = null;
            jsonLayer.visible = false;
            e.target.classList.remove('highlited');
        }

        
        

    }

    main.loadLeafletLayer = function(jsonLayer, layerStyle){

        let xhr = new XMLHttpRequest();
            xhr.open('GET', jsonLayer.url);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.responseType = 'json';
            xhr.onload = () => {

                if (xhr.status !== 200) return
                jsonLayer.leafletLayer  =  L.geoJSON(xhr.response,{style:layerStyle});
                main.envObj.lutils.mymap.addLayer(jsonLayer.leafletLayer);
            };
            xhr.send();
    }
}