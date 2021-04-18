let googleDrawing = function(){

    let main                = this;
    main.envObj             = null;
    main.htmlElement        = null;
    main.shapeMouseDown     = false;


    main.init = function(env){

        main.envObj             = env;

        // event listener/handler for adding shapes buttons
        document.getElementById('add-polygon').addEventListener('click',event=>main.onClickGoogleDraw(event,'polygon'));
        document.getElementById('add-circle').addEventListener('click',event=>main.onClickGoogleDraw(event,'circle'));
        document.getElementById('add-polyline').addEventListener('click',event=>main.onClickGoogleDraw(event,'polyline'));


        main.envObj.gUtils.mymap.addListener('click', event=>main.onGoogleMapClick(event));
        main.envObj.gUtils.mymap.addListener('rightclick', event=>main.onGoogleMapMouseRightClick(event));
        main.envObj.gUtils.mymap.addListener('mousedown', event=>main.onGoogleMapMouseDown(event));
        main.envObj.gUtils.mymap.addListener('mouseup', event=>main.onGoogleMapMouseUp(event));
        main.envObj.gUtils.mymap.addListener('mousemove', event=>main.onGoogleMapMouseMove(event));



        // setup current drawing mode and disable map panning
        // @param  {mode} explains what to draw i.e. circle, polygon etc.
        main.envObj.gUtils.StartDrawing = function(mode){

            let gUtils = main.envObj.gUtils;
            //sets current drawing mode, i.e. draw circle, craw polyline, polygon or point. edit is also a drawing mode
            //drawing mode will control flow and logic in mousedown, mouseclick, mousemove and mouseup events
            gUtils.currentDrawingMode = mode;

            //disables panning and dragging of map
            gUtils.mymap.setOptions({draggable: false});


            //sets cursor to cross hair for modes other than edit. for edit we set it to move
            if(gUtils.currentDrawingMode!=='edit'){

                gUtils.mymap.setOptions({draggableCursor:'crosshair' });
                //main.envObj.lutils.changeCursor('crosshair');
            }

        }

        // stop drawing, and enable map panning
        main.envObj.gUtils.StopDrawing = function(elements){

            let gUtils = main.envObj.gUtils;

            if(gUtils.currentDrawingMode==='edit' && gUtils.currentDrawingOBj!==null){
                gUtils.currentDrawingOBj.shape.setDraggable(false);
            }
             
            //terminates drawing modes and enables back the panning on mpa
            gUtils.currentDrawingMode = null;
            gUtils.mymap.setOptions({draggable: true});


            
            
            //release record of currently drawing shape and all its points
            gUtils.currentDrawingOBj = null;
            gUtils.currentDrawingData.splice(0,gUtils.currentDrawingData.length);

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

            elements.forEach(el=>{el.classList.remove('highlited')});


        }

        main.envObj.gUtils.addPolyline = function(coords){

            let gUtils = main.envObj.gUtils;
            gUtils.currentDrawingOBj = new google.maps.Polyline({
                path: coords,
                geodesic: true,
                strokeColor: "black",
                strokeOpacity: 1.0,
                strokeWeight: 2,
                draggable:false
              });
            gUtils.currentDrawingOBj.setMap(gUtils.mymap);
            main.bindEventsToShape(gUtils.currentDrawingOBj,'polyline');
        }
    
    
        main.envObj.gUtils.addPolygon = function(coords){
    
            let gUtils = main.envObj.gUtils;
            gUtils.currentDrawingOBj =  new google.maps.Polygon({
                paths: coords,
                strokeColor: "black",
                strokeOpacity: 0.9,
                strokeWeight: 2,
                fillColor: "#181616",
                fillOpacity: 0.2,
                draggable:false
              });
    
            gUtils.currentDrawingOBj.setMap(gUtils.mymap);
            main.bindEventsToShape(gUtils.currentDrawingOBj,'polygon');
        }
    
    
        main.envObj.gUtils.addCircle = function(lat, lng, rad){
    
            let gUtils = main.envObj.gUtils;
    
            let latLng = new google.maps.LatLng(lat,lng);
            gUtils.currentDrawingOBj = new google.maps.Circle({
                strokeColor: "black",
                strokeOpacity: 0.9,
                strokeWeight: 2,
                fillColor: "#181616",
                fillOpacity: 0.2,
                center: latLng,
                radius: rad,
                draggable:false
              });
              gUtils.currentDrawingOBj.setMap(gUtils.mymap);
              main.bindEventsToShape(gUtils.currentDrawingOBj,'circle');
        }

    }


    //event handlers for draw polygon, circle, polyline button
    main.onClickGoogleDraw = function(e, drawingMode){
        

        if(main.envObj.currentMapType === 'google'){

            if(main.envObj.gUtils.currentDrawingMode===null){

                main.htmlElement = e.target;
                main.htmlElement.classList.add('highlited');
                main.envObj.gUtils.StartDrawing(drawingMode);
            }
            else{

                main.envObj.gUtils.StopDrawing([main.htmlElement]);

            }
            
       }

    }

     //if drawing mode is polyline or polygon, keep adding points to these
    // logic for map click
    // @param  {e} event.
    main.onGoogleMapClick = function(e){


        let gUtils = main.envObj.gUtils;

        if(gUtils.currentDrawingMode === "polyline"){

            const v = {};
            v.lat = e.latLng.lat();
            v.lng = e.latLng.lng();
            gUtils.currentDrawingData.push(v);

            if(gUtils.currentDrawingData.length<2)
                 return; //do nothing
            else if(gUtils.currentDrawingData.length===2){
                gUtils.addPolyline(gUtils.currentDrawingData);
            }
            else if(gUtils.currentDrawingData.length>2){
                gUtils.currentDrawingOBj.setPath(gUtils.currentDrawingData);
                gUtils.currentDrawingOBj.setMap(gUtils.mymap);
            }

        }
        else if(gUtils.currentDrawingMode==="polygon"){
            const v = {};
            v.lat = e.latLng.lat();
            v.lng = e.latLng.lng();
            gUtils.currentDrawingData.push(v);

             if(gUtils.currentDrawingData.length<2)
                 return; //do nothing
             else if(gUtils.currentDrawingData.length===2){
                gUtils.addPolygon(gUtils.currentDrawingData);
             }
             else if(gUtils.currentDrawingData.length>2){
                gUtils.currentDrawingOBj.setPath(gUtils.currentDrawingData);
                gUtils.currentDrawingOBj.setMap(gUtils.mymap);
             }
        }

    }

    //if user right click on map then exit from drawing mode
    main.onGoogleMapMouseRightClick = function(e){

        let mode = main.envObj.gUtils.currentDrawingMode;
        if(main.htmlElement!==null && (mode==='polygon' || mode==='circle'||mode==='polyline')){

            main.envObj.gUtils.StopDrawing([main.htmlElement]);
        }
        if(mode==='edit'){
            
            main.envObj.gUtils.StopDrawing([]);
        }
    }


    
    // logic for map mouse down event
    // @param  {e} event.
    main.onGoogleMapMouseDown = function(e){
        //if drawing mode is cricle and user press mouse button a circle is added to the map which size
        //will be changed with mouse move and drawing will be stopped on mouse up
        // On mouse selection of Add Circle button drawing mode is enabled for a circle

        if(main.envObj.gUtils.currentDrawingMode==="circle"){

            /*circle group*/
            
            const cnteter = {};
            cnteter.lat = e.latLng.lat();
            cnteter.lng = e.latLng.lng();
            main.envObj.gUtils.addCircle(cnteter.lat, cnteter.lng, 10);

        }
    }

    // logic for map mouse up
    // @param  {e} event.
    main.onGoogleMapMouseUp = function(e){

        //stop the drawing of circle started in mouse down
        //On mouse selection of Add Circle button or right click, drawing mode is disabled for a circle.


         //stop the drawing of circle started in mouse down
        //On mouse selection of Add Circle button or right click, drawing mode is disabled for a circle.
        let gUtils = main.envObj.gUtils;

        if(gUtils.currentDrawingMode==="circle"){
            /*circle group*/
            gUtils.StopDrawing([main.htmlElement]);
        }

       

    }

    
    main.onGoogleMapMouseMove = function(e){

        const v = {};
        v.lat = e.latLng.lat();
        v.lng = e.latLng.lng();
        let gUtils = main.envObj.gUtils;


        //changing radius of circle being started drawing of which in mouse down
        if(gUtils.currentDrawingMode==="circle" && gUtils.currentDrawingOBj!=null){

            /*circle group*/
            const center = {}; 
            center.lat = gUtils.currentDrawingOBj.getCenter().lat();
            center.lng = gUtils.currentDrawingOBj.getCenter().lng();

           

            let dist = main.getDistance(center, v);
            gUtils.currentDrawingOBj.setRadius(dist);

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
        shape.addListener('mousedown',e=>{main.onShapeMouseDown(e)});
        shape.addListener('mouseup',e=>{main.onShapeMouseUp(e)});
        //if(type==='marker'){
        shape.addListener('drag',e=>{main.onShapeDragging(e)});
       
    }


    main.getDistance = function(p1, p2) {
        let rad = function(x) { return x * Math.PI / 180;}
        let R = 6378137; // Earth’s mean radius in meter
        let dLat = rad(p2.lat - p1.lat);
        let dLong = rad(p2.lng - p1.lng);
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c;
        return d; // returns the distance in meter
    };


    main.onShapeClick = function(e, guid){

        google.maps.event.trigger(main.envObj.gUtils.mymap, 'click', e);
        
        if(main.envObj.gUtils.currentDrawingMode===null){       
            main.editObject(guid);
        }
    }
    main.onShapeMouseDown = function(e){
        // this.objectClickCoord = event.latlng;
        main.shapeMouseDown = true;
    }
    main.onShapeMouseUp = function(e){

        main.onGoogleMapMouseUp(e);
        main.shapeMouseDown = false;
    }

    //if shape is changing position then smalll edit marker also needs to be updated
    //this function detects the latest coordinates of shape and set edit markers poisition accordingly
    main.onShapeDragging = function(e){


        let gUtils = main.envObj.gUtils;


        if(gUtils.currentDrawingMode==='edit' && main.shapeMouseDown === true){
            
            if(gUtils.currentDrawingOBj.type==='polygon' || gUtils.currentDrawingOBj.type==='polyline'){
                
                let vertices = gUtils.currentDrawingOBj.shape.getPath().getArray().map(v => {
                    return {lat:v.lat(),lng:v.lng()};
                });               
                vertices.forEach((v, idx)=>{   
                    gUtils.editMarkers[idx].setPosition(v);
                });
            
            }
            

            if(gUtils.currentDrawingOBj.type === 'circle'){

                let newCenter = gUtils.currentDrawingOBj.shape.getCenter();
                let oldCenter = gUtils.editMarkers[0].getPosition();
                let dLat = newCenter.lat() - oldCenter.lat();
                let dLng = newCenter.lng() - oldCenter.lng();
                gUtils.editMarkers[0].setPosition(newCenter);

                let pos = gUtils.editMarkers[1].getPosition();
                let newPos = {};
                newPos.lat = pos.lat() + dLat;
                newPos.lng = pos.lng() + dLng;
                gUtils.editMarkers[1].setPosition(newPos);

            }
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

        if(gUtils.currentDrawingOBj.type==='polygon'){
            /*polygon group*/
            gUtils.editMarkers  = [];
            let vertices = gUtils.currentDrawingOBj.shape.getPath().getArray().map(v => {
                return {lat:v.lat(),lng:v.lng()};
            });               
            vertices.forEach((v, idx)=>{   


                let mrk = new google.maps.Marker({
                    position: v,
                    icon: gUtils.editMarkerStyle,
                    draggable:true
                  });                
                mrk.shapeType = 'polygon';
                mrk.addListener('drag',e=>{main.onEditMarkerDraggin(mrk)});
                mrk.setMap(gUtils.mymap);
                gUtils.editMarkers.push(mrk)

            });
        
         }
        if(gUtils.currentDrawingOBj.type==='polyline'){
            /*polyline group*/
            gUtils.editMarkers  = [];
            let vertices = gUtils.currentDrawingOBj.shape.getPath().getArray().map(v => {
                return {lat:v.lat(),lng:v.lng()};
            });               
            vertices.forEach((v, idx)=>{   

                let mrk = new google.maps.Marker({
                    position: v,
                    icon: gUtils.editMarkerStyle,
                    draggable:true
                  });                
                mrk.shapeType = 'polyline';
                mrk.addListener('drag',e=>{main.onEditMarkerDraggin(mrk)});
                mrk.setMap(gUtils.mymap);

                gUtils.editMarkers.push(mrk)

            });

        }
        if(gUtils.currentDrawingOBj.type === 'circle'){
            /*circle group*/
            gUtils.editMarkers = [];
            let v = gUtils.currentDrawingOBj.shape.getCenter();
            let mrk = new google.maps.Marker({
                position: v,
                icon: gUtils.editMarkerStyle
              }); 
            mrk.shapeType = 'circle';  
            mrk.setMap(gUtils.mymap);
            gUtils.editMarkers.push(mrk)

            let convertRadiusToLatitude = parseInt(gUtils.currentDrawingOBj.shape.getRadius())/111111;

            let coordsOnRadius={};
            coordsOnRadius.lat=parseFloat(v.lat()) + convertRadiusToLatitude;
            coordsOnRadius.lng = parseFloat(v.lng());
            let mrkOnRad = new google.maps.Marker({
                position: coordsOnRadius,
                icon: gUtils.editMarkerStyle,
                draggable:true
              });  
            mrkOnRad.shapeType = 'circle';  
            mrkOnRad.addListener('drag',e=>{main.onEditMarkerDraggin(mrkOnRad)});            
            mrkOnRad.setMap(gUtils.mymap);
            gUtils.editMarkers.push(mrkOnRad)
        }

    }


    //changing vertices of shape when edit markers i.e small white circle changes position
    main.onEditMarkerDraggin = function(mrk){
        
        let gUtils = main.envObj.gUtils;

        //edit markers position and shape vertices position remains same
        if(mrk.shapeType==='polygon' || mrk.shapeType==='polyline'){

            let vertices = gUtils.currentDrawingOBj.shape.getPath().getArray().map(v => {
                return {lat:v.lat(),lng:v.lng()};
            });
            gUtils.editMarkers.forEach((editMrk,idx) => {

                vertices[idx].lat = editMrk.getPosition().lat();
                vertices[idx].lng = editMrk.getPosition().lng();
            });
            gUtils.currentDrawingOBj.shape.setPath(vertices);
        }

        if(mrk.shapeType==='circle'){
            
            /*circle group*/
            const center = {}; 
            center.lat = gUtils.currentDrawingOBj.shape.getCenter().lat();
            center.lng = gUtils.currentDrawingOBj.shape.getCenter().lng();

            const v = {};
            v.lat = mrk.getPosition().lat();
            v.lng = mrk.getPosition().lng();
           

            let dist = main.getDistance(center, v);
            gUtils.currentDrawingOBj.shape.setRadius(dist);

        }
        
    }



}