let LeafletPoint = function(){


    let main                = this;
    main.envObj             = null;
    main.htmlElement        = null;


    main.init = function(env){

        main.envObj             = env;
        document.getElementById('add-point').addEventListener('click',event=>main.onClickAddMarker(event));



        //map events
        main.envObj.lutils.mymap.addEventListener('contextmenu', event=>main.onLefaletMapMouseRightClick(event));
        main.envObj.lutils.mymap.addEventListener('click', event=>main.onLeafletMapClick(event));
        main.envObj.lutils.mymap.addEventListener('mousemove', event=>main.onLeafletMapMouseMove(event));
        main.envObj.lutils.mymap.addEventListener('mouseup', event=>main.onLeafletMapMouseUp(event));



        main.envObj.lutils.startPointTool = function(){

            let lutils = main.envObj.lutils;
            //sets current drawing mode, i.e. draw circle, craw polyline, polygon or point. edit is also a drawing mode
            //drawing mode will control flow and logic in mousedown, mouseclick, mousemove and mouseup events
            lutils.currentDrawingMode = 'marker';

            //disables panning and dragging of map
            lutils.mymap.dragging.disable(); 

            document.getElementById(main.envObj.lmapDiv).style.cursor = 'crosshair';
            main.envObj.lutils.changeCursor('crosshair');

            
        }

        main.envObj.lutils.stopPointTool = function(element){

            let lutils = main.envObj.lutils;
             //terminates drawing modes and enables back the panning on mpa
            lutils.currentDrawingMode = null;
            lutils.mymap.dragging.enable();

            //release record of currently drawing shape and all its points
            lutils.currentDrawingOBj = null;

            //change back cursor to it's original style
            document.getElementById(main.envObj.lmapDiv).style.cursor = '';
            lutils.changeCursor('');

            //removes edit points that appears on shape during edit
            if(lutils.editMarkers.length>0){

                lutils.editMarkers.forEach((mrk,idx)=>{
                    lutils.mymap.removeLayer(mrk);
                });
                lutils.editMarkers.splice(0,lutils.editMarkers.length);
            }

            
            element.classList.remove('highlited');
        }

        //function to add marker on the map
        main.envObj.lutils.addMarker = function(lat, lng){

            let marker = L.marker({lat:lat,lng:lng} ,{icon: main.envObj.lutils.redIcon}).addTo(main.envObj.lutils.mymap);
            main.bindEventsToShape(marker,'marker');
            return marker;
        }
        
    }

    main.onClickAddMarker = function(e){

        if(main.envObj.currentMapType === 'leaflet'){

            if(main.envObj.lutils.currentDrawingMode===null){

                main.htmlElement = e.target;
                main.htmlElement.classList.add('highlited');
                main.envObj.lutils.startPointTool();
            }
            else{

                
                main.envObj.lutils.stopPointTool(main.htmlElement);

            }           
       }
    }

    //if user right click on map then exit from drawing mode
    main.onLefaletMapMouseRightClick = function(e){

        if(main.envObj.lutils.currentDrawingMode==='marker')
            main.envObj.lutils.stopPointTool(main.htmlElement);
        if(main.envObj.lutils.currentDrawingMode==='edit'){
            
            main.envObj.lutils.stopPointTool(document.createElement('div'));
        }
    }

     //if drawing mode is add marker
    // logic for map click
    // @param  {e} event.
    main.onLeafletMapClick = function(e){
        
        if(main.envObj.lutils.currentDrawingMode==="marker"){
           
            main.envObj.lutils.addMarker(e.latlng.lat, e.latlng.lng);
           
        }

    }

    // logic for map mouse up
    // @param  {e} event.
    main.onLeafletMapMouseUp = function(e){

        //stop the drawing of circle started in mouse down
        //On mouse selection of Add Circle button or right click, drawing mode is disabled for a circle.

        let lutils = main.envObj.lutils;
       

        //set those shapes to null on which mouse were down

        lutils.shapeMouseDown = false;
        lutils.markerMouseDown = false;
        lutils.currentMarker = null;

    }

    main.onLeafletMapMouseMove = function(e){

        let lutils = main.envObj.lutils;

        // this is the logic for moving the currently being edited shapes
        if(lutils.currentDrawingMode==='edit' && lutils.shapeMouseDown===true){

            if(lutils.currentDrawingOBj.type==='marker'){
                /*point group*/
                lutils.currentDrawingOBj.shape.setLatLng(e.latlng);
                lutils.editMarkers[0].setLatLng(e.latlng);
            }
        }
        
        
    }


    


    // SHAPE INITIALISATION

    // bind popup for map object
    // @param  {shape} object for which to create popup.
    // @param  {type} object type i.e. circle, polyline, polygon, point.
    main.bindEventsToShape = function(shape, type){

        let newObj = {};
        newObj.id = main.envObj.guidGenerator();
        newObj.shape = shape;
        newObj.type = type;
        main.envObj.lutils.mapObjects.push(newObj);

        shape.on('click',e=>{main.onShapeClick(e,newObj.id)});
        shape.on('mousedown',e=>{main.onShapeMouseDown(e)});
        shape.on('mouseup',e=>{main.onShapeMouseUp(e)});
        main.envObj.lutils.changeCursor('crosshair');

    }


    // propogates shape click event to map click
    // @param  {event} click event.
    // @param  {guid} unique id for shape.
    main.onShapeClick = function(event, guid){

        main.envObj.lutils.mymap.fire('click',event);
        if(main.envObj.lutils.currentDrawingMode===null){

            main.envObj.lutils.changeCursor('move');
            main.editObject(guid);

        }
    }


    // detects mouse down on shape
    // @param  {event} click event.
    main.onShapeMouseDown =function(event){

        main.envObj.lutils.shapeMouseDown = true;
        main.envObj.lutils.objectClickCoord = event.latlng;

    }

    // detects mouse up on shape
    // @param  {event} click event.
    main.onShapeMouseUp = function(e){
        main.envObj.lutils.shapeMouseDown = false;
        main.envObj.lutils.objectClickCoord = null;
        }


     // enable editing of shapes
    // @param  {guid} unique id of object.
    main.editObject = function(guid){

        let lutils = main.envObj.lutils;

        let idx = lutils.mapObjects.findIndex(o => o.id === guid);
        let obj = lutils.mapObjects[idx];
        lutils.currentDrawingOBj = obj;
        lutils.currentDrawingMode = 'edit';
        lutils.mymap.dragging.disable(); 
        lutils.mymap.closePopup();


        if(lutils.currentDrawingOBj.type==='marker'){
            /*point group*/

            lutils.editMarkers = [];
            let pt = lutils.currentDrawingOBj.shape.getLatLng();
            let mrk = L.circleMarker(pt,lutils.editMarkerStyle);
            mrk.shapeType = 'marker';
            lutils.editMarkers.push(mrk);
            lutils.mymap.addLayer(mrk);

            lutils.changeCursor('move');

        }

    }



    
}