let GooglePoint = function(){


    let main                = this;
    main.envObj             = null;
    main.htmlElement        = null;


    main.init = function(env){

        main.envObj = env;



        document.getElementById('add-point').addEventListener('click',event=>main.onClickAddGoogleMarker(event));


        //map mouse events
        main.envObj.gUtils.mymap.addListener('click', event=>main.onGoogleMapClick(event));
        main.envObj.gUtils.mymap.addListener('rightclick', event=>main.onGoogleMapMouseRightClick(event));
        




        main.envObj.gUtils.startPointTool = function(){

            let gUtils = main.envObj.gUtils;
            //sets current drawing mode, i.e. draw circle, craw polyline, polygon or point. edit is also a drawing mode
            //drawing mode will control flow and logic in mousedown, mouseclick, mousemove and mouseup events
            gUtils.currentDrawingMode = 'marker';

            //disables panning and dragging of map
            gUtils.mymap.setOptions({draggable: false});

            gUtils.mymap.setOptions({draggableCursor:'crosshair' });
            //main.envObj.lutils.changeCursor('crosshair');

            
        }

        main.envObj.gUtils.stopPointTool = function(element){

            let gUtils = main.envObj.gUtils;
             //terminates drawing modes and enables back the panning on mpa
            gUtils.currentDrawingMode = null;
            gUtils.mymap.setOptions({draggable: true});

            //release record of currently drawing shape and all its points
            gUtils.currentDrawingOBj = null;

            //change back cursor to it's original style
            gUtils.mymap.setOptions({draggableCursor:'' });
            //lutils.changeCursor('');

            //removes edit points that appears on shape during edit
            if(gUtils.editMarkers.length>0){

                gUtils.editMarkers.forEach((mrk,idx)=>{
                    mrk.setMap(null);
                    
                });
                gUtils.editMarkers.splice(0,gUtils.editMarkers.length);
            }

            
            element.classList.remove('highlited');
        }

        main.envObj.gUtils.addMarker = function(lat, lng){

        


            let latLng = new google.maps.LatLng(lat,lng);
            let marker = new google.maps.Marker({
            position: latLng,
            draggable:false
            });
            // To add the marker to the map, call setMap();
            marker.setMap(main.envObj.gUtils.mymap);
            main.bindEventsToShape(marker,'marker');
            
    
        }
    }


    main.onClickAddGoogleMarker = function(e){

        if(main.envObj.currentMapType === 'google'){

            if(main.envObj.gUtils.currentDrawingMode===null){

                main.htmlElement = e.target;
                main.htmlElement.classList.add('highlited');
                main.envObj.gUtils.startPointTool();
            }
            else{  
                
                main.envObj.gUtils.stopPointTool(main.htmlElement);
            }           
       }
    }

    //if drawing mode is polyline or polygon, keep adding points to these
    // logic for map click
    // @param  {e} event.
    main.onGoogleMapClick = function(e){


        let gUtils = main.envObj.gUtils;

        if(gUtils.currentDrawingMode==="marker"){
            /*point group*/
            /*this.currentDrawingOBj = */
            
            gUtils.addMarker(e.latLng.lat(), e.latLng.lng());
           

        }
        

    }

    main.onGoogleMapMouseRightClick = function(e){

        if(main.envObj.gUtils.currentDrawingMode==='marker')
            main.envObj.gUtils.stopPointTool(main.htmlElement);
        if(main.envObj.gUtils.currentDrawingMode==='edit'){ 
            main.envObj.gUtils.stopPointTool(document.createElement('div'));
        }
    }


    


    main.bindEventsToShape = function(shape, type){

        let gUtils = main.envObj.gUtils;

        let newObj = {};
        newObj.id = main.envObj.guidGenerator();
        newObj.shape = shape;
        newObj.type = type;
        gUtils.mapObjects.push(newObj);

        
       
        shape.addListener('click',e=>{main.onShapeClick(e,newObj.id)});
        //shape.addListener('mousedown',e=>{main.onShapeMouseDown(e)});
        //shape.addListener('mouseup',e=>{main.onShapeMouseUp(e)});
        //if(type==='marker'){
        shape.addListener('drag',e=>{main.onShapeDragging(e)});
       
    }


    main.onShapeClick = function(e, guid){

        //main.onGoogleMapClick(e);
        google.maps.event.trigger(main.envObj.gUtils.mymap, 'click', e);
        
        if(main.envObj.gUtils.currentDrawingMode===null){       
            main.editObject(guid);
        }
    }

    

    // enable editing of shapes
    // @param  {guid} unique id of object.
    main.editObject = function(guid){

        let gUtils = main.envObj.gUtils;

        let idx = gUtils.mapObjects.findIndex(o => o.id === guid);
        let obj = gUtils.mapObjects[idx];
        gUtils.currentDrawingOBj = obj;
        gUtils.StartDrawing('edit');
        //this.mymap.closePopup();

        //set shape to movalbe
        gUtils.currentDrawingOBj.shape.setDraggable(true);

        if(gUtils.currentDrawingOBj.type==='marker'){
            /*point group*/

            gUtils.editMarkers = [];
            let v = gUtils.currentDrawingOBj.shape.getPosition();
            
            let mrk = new google.maps.Marker({
                position: v,
                icon: gUtils.editMarkerStyle
              });                
            mrk.shapeType = 'marker';
            mrk.setMap(gUtils.mymap);
            gUtils.editMarkers.push(mrk)

        }

    }

   
    main.onShapeDragging = function(e){

        let gUtils = main.envObj.gUtils;

        if(gUtils.currentDrawingMode==='edit'){
            
            
            if(gUtils.currentDrawingOBj.type==='marker'){

                gUtils.editMarkers[0].setPosition(gUtils.currentDrawingOBj.shape.getPosition());
            }

        }
    }



}