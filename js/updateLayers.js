let updateLayers = function(){

    let main                = this;
    main.envObj             = null;


    main.init = function(env){

        main.envObj             = env;
        
    }

    //function will create controls for switching between basemaps and on/off geoJSON layers
    main.initGui = function(mapsUl){

        main.envObj.lutils.baseLayers.forEach((baseLayer,idx) => {

            let li = document.createElement('li');
            let div = document.createElement('div');
            div.setAttribute('data-id',baseLayer.id);
            div.innerHTML = baseLayer.name;
            div.classList.add('base-layer');
            div.addEventListener('click',(e)=>{main.onClickBaseLayer(e);});
            li.appendChild(div);
            mapsUl.appendChild(li);

            if(idx==0){
                div.classList.add('highlited');
            }
        });     
        console.log('..... added controls for map box/OS tiles');


        main.envObj.googleMapTypes.forEach(mapType => {

            let li = document.createElement('li');
            let div = document.createElement('div');
            div.setAttribute('data-type',mapType.url);
            div.innerHTML = mapType.name;
            div.classList.add('base-layer');
            div.addEventListener('click',(e)=>{main.onClickGoogBaseLayer(e);});
            li.appendChild(div);
            mapsUl.appendChild(li);

        });
        console.log('..... added controls for google tiles');
    }


    //when a base layer button on right is clicked
    main.onClickBaseLayer = function(e){

        //if this is lefalet tile, current map type is set to leflet else set to google
        main.switchMapType('leaflet');
        
        //display clicked layer on map
        let guid = e.target.getAttribute('data-id');                        //gets uid from clicked button
        main.envObj.lutils.loadLayerToMap(guid);

        //make clicked button highlited
        let elements = document.getElementsByClassName('base-layer');
        for(let i=0;i<elements.length;i++){
            elements[i].classList.remove('highlited');
        }
        e.target.classList.add('highlited');


        


    }


    //seperate function when google map tile is clicked because handling logic is different
    main.onClickGoogBaseLayer = function(e){

        //hides leaflet map div and display google map div
        //set current map type to google
        main.switchMapType('google');

        let type = e.target.getAttribute('data-type'); 
        main.envObj.gUtils.setMapType(type);
        let elements = document.getElementsByClassName('base-layer');
        for(let i=0;i<elements.length;i++){
            elements[i].classList.remove('highlited');
        }
        e.target.classList.add('highlited');

       


    }

    
    main.switchMapType = function(type){

        //stops any kind of drawing mode between layer switching
        main.envObj.lutils.StopDrawing([document.getElementById('add-polygon'),document.getElementById('add-circle'),document.getElementById('add-polyline')]);
        main.envObj.lutils.stopDistanceTool(document.getElementById('find-dist'));
        main.envObj.lutils.stopPointTool(document.getElementById('add-point'));
        main.envObj.gUtils.StopDrawing([document.getElementById('add-polygon'),document.getElementById('add-circle'),document.getElementById('add-polyline')]);
        main.envObj.gUtils.stopDistanceTool(document.getElementById('find-dist'));
        main.envObj.gUtils.stopPointTool(document.getElementById('add-point'));

        if(type ==='leaflet' && main.envObj.currentMapType==='google'){

            main.envObj.currentMapType = type;   
            document.getElementById(main.envObj.gmapDiv).style.display = 'none';
            document.getElementById(main.envObj.lmapDiv).style.display = 'block';
            //copy all drawn shapes from google map to leaflet map
            main.envObj.copyShapesFromGoogleToLeaflet();
            
        }
        else if(type ==='google' && main.envObj.currentMapType==='leaflet'){

            main.envObj.currentMapType = type;
            document.getElementById(main.envObj.gmapDiv).style.display = 'block';
            document.getElementById(main.envObj.lmapDiv).style.display = 'none';
            //copy all drawn shapes from leaflet map to google map
            main.envObj.copyShapesFromLeafletToGoogle();
            
        }
        
    }

}