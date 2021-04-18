let distancdTool = function(){

    let main                = this;
    main.envObj             = null;
    main.htmlElement        = null;


    main.init = function(env){

        main.envObj             = env;
        document.getElementById('find-dist').addEventListener('click',event=>main.onClickFindDist(event));
        main.envObj.lutils.mymap.addEventListener('click', event=>main.onLeafletMapClick(event));
        main.envObj.lutils.mymap.addEventListener('mousemove', event=>main.onLeafletMapMouseMove(event));
        main.envObj.lutils.mymap.addEventListener('contextmenu', event=>main.onLefaletMapMouseRightClick(event));


        //defining the function of start/stop distance tool we left in initialization block
        main.envObj.lutils.startDistanceTool = function(){

            let lutils = main.envObj.lutils;

            lutils.currentDrawingMode = 'distance';
            lutils.mymap.dragging.disable();
            main.htmlElement.classList.add('highlited');
            document.getElementById(main.envObj.lmapDiv).style.cursor = 'crosshair';
                    main.envObj.lutils.changeCursor('crosshair');


        }

        main.envObj.lutils.stopDistanceTool = function(element){

            let lutils = main.envObj.lutils;

            if(lutils.currentDrawingOBj!==null){

                lutils.mymap.removeLayer(lutils.currentDrawingOBj);
                lutils.currentDrawingOBj = null;
            }

            lutils.currentDrawingMode = null;
            lutils.currentDrawingData.splice(0,lutils.currentDrawingData.length);
            lutils.mymap.dragging.enable();
            element.classList.remove('highlited');
            document.getElementById(main.envObj.lmapDiv).style.cursor = '';
            lutils.changeCursor('');
        }

        
    }

    //when distance tool button is clicked
    main.onClickFindDist = function(e){

        
       if(main.envObj.currentMapType === 'leaflet'){
           
            if(main.envObj.lutils.currentDrawingMode===null){

                main.htmlElement = e.target;
                main.envObj.lutils.startDistanceTool();
            }
            else{

                main.envObj.lutils.stopDistanceTool(main.htmlElement);
            }
            
       }
    
    }


    //if drawing mode is distance, start the tool on first click and finishes on second click
    // logic for map click
    // @param  {e} event.
    main.onLeafletMapClick = function(e){

        let lutils = main.envObj.lutils;

        if(lutils.currentDrawingMode==="distance"){
    
            lutils.currentDrawingData.push(e.latlng);

            //for first click we start the line drawing
            if(lutils.currentDrawingData.length === 1){

                lutils.currentDrawingOBj  = new L.Polyline([lutils.currentDrawingData[0],lutils.currentDrawingData[0]], {
                    color: 'black',
                    weight: 2,
                    opacity: 1,
                    smoothFactor: 1,
                    dashArray: '8, 8',
                    dashOffset: '0'
                }).addTo(lutils.mymap);
                lutils.changeCursor('crosshair');

            }

            //for second click display the distance and stop line drawing
            if(lutils.currentDrawingData.length===2){
                /*dist group*/
                let dist = main.getDistance(lutils.currentDrawingData[0], lutils.currentDrawingData[1]);
                lutils.stopDistanceTool(main.htmlElement);
                setTimeout(function (){
                    alert(`Distance : ${dist.toFixed(3)} meters`);
                },100);

            }
        }

    }

    // logic for map mouse move
    //for the purpose of displaying dashed line on map
    // @param  {e} event.
    main.onLeafletMapMouseMove = function(e){


        let lutils = main.envObj.lutils

        //logic for displaying dashed line of distance tool
        if(lutils.currentDrawingMode==="distance" && lutils.currentDrawingOBj!=null && lutils.currentDrawingData.length===1){
            /*dist group*/
            let pos = [lutils.currentDrawingData[0], e.latlng];
            lutils.currentDrawingOBj.setLatLngs(pos);
        }

    }


    //if user right click on map then exit from drawing mode
    main.onLefaletMapMouseRightClick = function(e){

        if(main.envObj.lutils.currentDrawingMode==='distance')
            main.envObj.lutils.stopDistanceTool(main.htmlElement);
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

   


}