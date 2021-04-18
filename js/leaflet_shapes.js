let LeafletDrawing = function(){

    let main                = this;
    main.envObj             = null;
    main.htmlElement        = null;


    main.init = function(env){

        main.envObj             = env;

         // event listener/handler for adding shapes buttons
        document.getElementById('add-polygon').addEventListener('click',event=>main.onClickDraw(event,'polygon'));
        document.getElementById('add-circle').addEventListener('click',event=>main.onClickDraw(event,'circle'));
        document.getElementById('add-polyline').addEventListener('click',event=>main.onClickDraw(event,'polyline'));
        

        //leaflet map events required for drawing
        main.envObj.lutils.mymap.addEventListener('click', event=>main.onLeafletMapClick(event));
        main.envObj.lutils.mymap.addEventListener('contextmenu', event=>main.onLefaletMapMouseRightClick(event));
        main.envObj.lutils.mymap.addEventListener('mousedown', event=>main.onLeafletMapMouseDown(event));
        main.envObj.lutils.mymap.addEventListener('mouseup', event=>main.onLeafletMapMouseUp(event));
        main.envObj.lutils.mymap.addEventListener('mousemove', event=>main.onLeafletMapMouseMove(event));

        // setup current drawing mode and disable map panning
        // @param  {mode} explains what to draw i.e. circle, polygon etc.
        main.envObj.lutils.StartDrawing = function(mode){

            let lutils = main.envObj.lutils;
            //sets current drawing mode, i.e. draw circle, craw polyline, polygon or point. edit is also a drawing mode
            //drawing mode will control flow and logic in mousedown, mouseclick, mousemove and mouseup events
            lutils.currentDrawingMode = mode;

            //disables panning and dragging of map
            lutils.mymap.dragging.disable();

            //sets cursor to cross hair for modes other than edit. for edit we set it to move
            if(lutils.currentDrawingMode!=='edit'){

                document.getElementById(main.envObj.lmapDiv).style.cursor = 'crosshair';
                main.envObj.lutils.changeCursor('crosshair');


            }

        }

        // stop drawing, and enable map panning
        main.envObj.lutils.StopDrawing = function(elements){

            let lutils = main.envObj.lutils;
             //terminates drawing modes and enables back the panning on mpa
            lutils.currentDrawingMode = null;
            lutils.mymap.dragging.enable();

            //release record of currently drawing shape and all its points
            lutils.currentDrawingOBj = null;
            lutils.currentDrawingData.splice(0,lutils.currentDrawingData.length);

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

            elements.forEach(el=>{el.classList.remove('highlited')});


        }

         //fucntion to add polygon to map
        main.envObj.lutils.addPolygon = function(points){
        
            main.envObj.lutils.currentDrawingOBj  = new L.polygon(points, {
                color: 'black',
                weight: 2,
                fillColor: '#181616',
                fillOpacity: 0.2
            }).addTo(main.envObj.lutils.mymap);

            main.bindEventsToShape(main.envObj.lutils.currentDrawingOBj,'polygon');
        }

        //fucntion to add polyline to map
        main.envObj.lutils.addPolyline = function(points){

            main.envObj.lutils.currentDrawingOBj  = new L.Polyline(points, {
                color: 'black',
                weight: 2,
                opacity: 1,
                smoothFactor: 1
            }).addTo(main.envObj.lutils.mymap);

            main.bindEventsToShape(main.envObj.lutils.currentDrawingOBj,'polyline');

        }

        //function to add circle
        main.envObj.lutils.addCircle = function(center, radius){
            
            main.envObj.lutils.currentDrawingOBj = L.circle(center, {
                color: 'black',
                weight: 2,
                fillColor: '#181616',
                fillOpacity: 0.2,
                radius: radius
            }).addTo(main.envObj.lutils.mymap);

            main.bindEventsToShape(main.envObj.lutils.currentDrawingOBj,'circle');

        }
        
    }

    //event handlers for draw polygon, circle, polyline button
    main.onClickDraw = function(e, drawingMode){
        

        if(main.envObj.currentMapType === 'leaflet'){

            if(main.envObj.lutils.currentDrawingMode===null){

                main.htmlElement = e.target;
                main.htmlElement.classList.add('highlited');
                main.envObj.lutils.StartDrawing(drawingMode);
            }
            else{

                main.envObj.lutils.StopDrawing([main.htmlElement]);

            }
            
       }

    }

    //if drawing mode is polyline or polygon, keep adding points to these
    // logic for map click
    // @param  {e} event.
    main.onLeafletMapClick = function(e){


        let lutils = main.envObj.lutils;

        if(lutils.currentDrawingMode === "polyline"){

            lutils.currentDrawingData.push(e.latlng);

            if(lutils.currentDrawingData.length<2)
                return; //do nothing
            else if(lutils.currentDrawingData.length===2){  
                lutils.addPolyline(lutils.currentDrawingData);
            }
            else if(lutils.currentDrawingData.length>2){
                lutils.currentDrawingOBj.addLatLng(e.latlng);
            }

        }
        else if(lutils.currentDrawingMode==="polygon"){
            /*polygon group*/
            lutils.currentDrawingData.push(e.latlng);

            if(lutils.currentDrawingData.length<2)
                return; //do nothing
            else if(lutils.currentDrawingData.length===2){
                lutils.addPolygon(lutils.currentDrawingData);
            }
            else if(lutils.currentDrawingData.length>2){
                lutils.currentDrawingOBj.addLatLng(e.latlng);
            }
        }

    }

    //if user right click on map then exit from drawing mode
    main.onLefaletMapMouseRightClick = function(e){

        let mode = main.envObj.lutils.currentDrawingMode;
        if(main.htmlElement!==null && (mode==='polygon' || mode==='circle'||mode==='polyline')){

            main.envObj.lutils.StopDrawing([main.htmlElement]);
        }
        if(mode==='edit'){
            
            main.envObj.lutils.StopDrawing([]);
        }
    }


    // MOUSE EVENTS

    // logic for map mouse down event
    // @param  {e} event.
    main.onLeafletMapMouseDown = function(e){
        //if drawing mode is cricle and user press mouse button a circle is added to the map which size
        //will be changed with mouse move and drawing will be stopped on mouse up
        // On mouse selection of Add Circle button drawing mode is enabled for a circle
        if(main.envObj.lutils.currentDrawingMode==="circle"){
            
            main.envObj.lutils.addCircle(e.latlng, 2.5);

        }
    }

    // logic for map mouse up
    // @param  {e} event.
    main.onLeafletMapMouseUp = function(e){

        //stop the drawing of circle started in mouse down
        //On mouse selection of Add Circle button or right click, drawing mode is disabled for a circle.

        let lutils = main.envObj.lutils;
        if(lutils.currentDrawingMode==="circle"){
            /*circle group*/
            lutils.StopDrawing([main.htmlElement]);
        }

        //set those shapes to null on which mouse were down

        lutils.shapeMouseDown = false;
        lutils.markerMouseDown = false;
        lutils.currentMarker = null;

    }

    
    main.onLeafletMapMouseMove = function(e){

        let lutils = main.envObj.lutils;


        // this is the logic for changing the currently being edited shapes
        if(lutils.markerMouseDown === true){

            if(lutils.currentMarker.shapeType==='circle'){
                /*circle group*/
                lutils.currentMarker.setLatLng(e.latlng);
                let center = lutils.currentDrawingOBj.shape.getLatLng();
                let dist = lutils.mymap.distance(center, e.latlng);
                lutils.currentDrawingOBj.shape.setRadius(dist);
            }
            if(lutils.currentMarker.shapeType === 'polygon' || lutils.currentMarker.shapeType === 'polyline'){

                lutils.currentMarker.setLatLng(e.latlng);
                let newpoints = [];

                lutils.editMarkers.forEach((mrk,idx)=>{
                    let pt = [];
                    pt.push(mrk.getLatLng().lat);
                    pt.push(mrk.getLatLng().lng);
                    newpoints.push(pt);
                });

                lutils.currentDrawingOBj.shape.setLatLngs(newpoints);
            }

        }


        // this is the logic for moving the currently being edited shapes
        if(lutils.currentDrawingMode==='edit' && lutils.shapeMouseDown===true){

            if(lutils.currentDrawingOBj.type==='circle'){
                /*circle group*/

                lutils.currentDrawingOBj.shape.setLatLng(e.latlng);
                lutils.editMarkers[0].setLatLng(e.latlng);

                let pt = e.latlng;
                let convertRadiusToLatitude = parseInt(lutils.currentDrawingOBj.shape.getRadius())/111111;
                let coordsOnRadius = [parseFloat(pt.lat) + convertRadiusToLatitude, parseFloat(pt.lng)];
                lutils.editMarkers[1].setLatLng(coordsOnRadius);

            }
            else if(lutils.currentDrawingOBj.type==='polygon'){
                /*polygon group*/
                let mouseCoords = e.latlng;
                let poly = lutils.currentDrawingOBj.shape;
                let center = poly.getBounds().getCenter();
                let polyPoints = poly.getLatLngs();
                let offsets = []

                polyPoints[0].forEach((polyPt,idx)=>{
                    let pt={'lat':polyPt.lat - center.lat, 'lng':polyPt.lng - center.lng}
                    offsets.push(pt);
                });


                let newpoints = [];

                offsets.forEach((o,idx)=>{
                    let pt = [];
                    pt.push(mouseCoords.lat+o.lat);
                    pt.push(mouseCoords.lng+o.lng);
                    newpoints.push(pt);
                    if(idx<lutils.editMarkers.length)lutils.editMarkers[idx].setLatLng(pt);
                });


                lutils.currentDrawingOBj.shape.setLatLngs(newpoints);

            }
            else if(lutils.currentDrawingOBj.type==='polyline'){
                /*polyline group*/
                let mouseCoords = e.latlng;
                let xOffset = mouseCoords.lat - lutils.objectClickCoord.lat;
                let yOffset = mouseCoords.lng - lutils.objectClickCoord.lng;

                let poly = lutils.currentDrawingOBj.shape;
                let polyPoints = poly.getLatLngs();

                let newpoints = [];
                polyPoints.forEach((polyPt,idx)=>{
                    let pt = [];
                    pt.push(polyPt.lat+xOffset);
                    pt.push(polyPt.lng+yOffset);
                    newpoints.push(pt);
                    if(idx<lutils.editMarkers.length)lutils.editMarkers[idx].setLatLng(pt);
                });

                lutils.currentDrawingOBj.shape.setLatLngs(newpoints);
                lutils.objectClickCoord = mouseCoords;
            }

        }
        
        //changing radius of circle being started drawing of which in mouse down
        if(lutils.currentDrawingMode==="circle" && lutils.currentDrawingOBj!=null){

            /*circle group*/
            let circCoords = lutils.currentDrawingOBj.getLatLng();
            let mousCoords = e.latlng;
            let dist = lutils.mymap.distance(circCoords, mousCoords);
            lutils.currentDrawingOBj.setRadius(dist);

        }
    }


   


    // enable editing of shapes
    // @param  {guid} unique id of object.
    main.editObject = function(guid){

        let lutils = main.envObj.lutils;

        let idx = lutils.mapObjects.findIndex(o => o.id === guid);
        let obj = lutils.mapObjects[idx];
        lutils.currentDrawingOBj = obj;
        lutils.StartDrawing('edit');
        lutils.mymap.closePopup();


        if(lutils.currentDrawingOBj.type==='polygon'){
            /*polygon group*/
            lutils.editMarkers  = [];
            let pts = lutils.currentDrawingOBj.shape.getLatLngs()[0];
            pts.forEach((pt, idx)=>{

                let mrk = L.circleMarker(pt, lutils.editMarkerStyle);
                mrk.shapeType = 'polygon';
                lutils.editMarkers.push(mrk);
                lutils.mymap.addLayer(mrk);
                mrk.on('mousedown',e=>{main.onMarkerMouseDown(e);});
                mrk.on('mouseup',e=>{main.onMarkerMouseUp(e);});
            });

        }
        if(lutils.currentDrawingOBj.type==='polyline'){
            /*polyline group*/
            lutils.editMarkers  = [];
            let pts = lutils.currentDrawingOBj.shape.getLatLngs();
            pts.forEach((pt,idx)=>{
                let mrk = L.circleMarker(pt,lutils.editMarkerStyle);
                mrk.shapeType = 'polyline';
                lutils.editMarkers.push(mrk);
                lutils.mymap.addLayer(mrk);
                mrk.on('mousedown',e=>{main.onMarkerMouseDown(e);});
                mrk.on('mouseup',e=>{main.onMarkerMouseUp(e);});
            });

        }
        if(lutils.currentDrawingOBj.type === 'circle'){
            /*circle group*/
            lutils.editMarkers = [];
            let pt = lutils.currentDrawingOBj.shape.getLatLng();
            let mrk = L.circleMarker(pt,lutils.editMarkerStyle);
            mrk.shapeType = 'circle';
            lutils.editMarkers.push(mrk);
            lutils.mymap.addLayer(mrk);

            let convertRadiusToLatitude = parseInt(lutils.currentDrawingOBj.shape.getRadius())/111111;

            let coordsOnRadius = [parseFloat(pt.lat) + convertRadiusToLatitude, parseFloat(pt.lng)];
            let markerOnRadius = L.circleMarker(coordsOnRadius, lutils.editMarkerStyle);
            markerOnRadius.shapeType = 'circle';
            lutils.editMarkers.push(markerOnRadius);
            markerOnRadius.on('mousedown',e=>{main.onMarkerMouseDown(e);});
            markerOnRadius.on('mouseup',e=>{main.onMarkerMouseUp(e);});
            lutils.mymap.addLayer(markerOnRadius);
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

        //main.envObj.lutils.mymap.fire('click',event);
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
        //not required for now
    }

    // logic for drag marker mouse down
    // @param  {event} click event.
    main.onMarkerMouseDown = function(event){

        main.envObj.lutils.markerMouseDown = true;
        main.envObj.lutils.currentMarker = event.target;
    }

    // logic for drag marker mouse up
    // @param  {event} click event.
    main.onMarkerMouseUp = function(event){

        // console.log('marker mouse up');

        main.envObj.lutils.markerMouseDown = false;
        main.envObj.lutils.currentMarker = null;
    }
}