let googleDistancdTool = function(){

    let main                = this;
    main.envObj             = null;
    main.htmlElement        = null;


    main.init = function(env){

        main.envObj             = env;
        document.getElementById('find-dist').addEventListener('click',event=>main.onClickFindDist(event));
        main.envObj.gUtils.mymap.addListener('click', event=>main.onGoogleMapClick(event));
        main.envObj.gUtils.mymap.addListener('mousemove',event=>main.onGoogleMapMouseMove(event));
        main.envObj.gUtils.mymap.addListener('rightclick', event=>main.onGoogleMapMouseRightClick(event));



        // //defining the function of start/stop distance tool we left in initialization block
        main.envObj.gUtils.startDistanceTool = function(){

            let gUtils = main.envObj.gUtils;

            gUtils.currentDrawingMode = 'distance';
            gUtils.mymap.setOptions({draggable: false});
            main.htmlElement.classList.add('highlited');
            gUtils.mymap.setOptions({draggableCursor:'crosshair' });
            //main.envObj.lutils.changeCursor('crosshair');


        }

        main.envObj.gUtils.stopDistanceTool = function(element){

            let gUtils = main.envObj.gUtils;

            if(gUtils.currentDrawingOBj!==null){

                gUtils.currentDrawingOBj.setMap(null)
                gUtils.currentDrawingOBj = null;
            }

            gUtils.currentDrawingMode = null;
            gUtils.currentDrawingData.splice(0,gUtils.currentDrawingData.length);
            gUtils.mymap.setOptions({draggable: true});
            element.classList.remove('highlited');
            gUtils.mymap.setOptions({draggableCursor:'' });
            //lutils.changeCursor('');
        }

        
    }

    //when distance tool button is clicked
    main.onClickFindDist = function(e){

        
       if(main.envObj.currentMapType === 'google'){
           
            if(main.envObj.gUtils.currentDrawingMode===null){

                main.htmlElement = e.target;
                main.envObj.gUtils.startDistanceTool();
            }
            else{

                main.envObj.gUtils.stopDistanceTool(main.htmlElement);
            }
            
       }
    
    }


    //if drawing mode is distance, start the tool on first click and finishes on second click
    // logic for map click
    // @param  {e} event.
     main.onGoogleMapClick = function(e){

        let gUtils = main.envObj.gUtils;

        if(gUtils.currentDrawingMode==="distance"){
    
            const v = {};
            v.lat = e.latLng.lat();
            v.lng = e.latLng.lng();
            gUtils.currentDrawingData.push(v);

            //for first click we start the line drawing
            if(gUtils.currentDrawingData.length === 1){

                const lineSymbol = {
                    path: "M 0,-1 0,1",
                    strokeOpacity: 1,
                    scale: 3,
                  };
                  gUtils.currentDrawingOBj = new google.maps.Polyline({
                    path: gUtils.currentDrawingData,
                    geodesic: true,
                    strokeOpacity: 0,
                    icons: [
                        {
                          icon: lineSymbol,
                          offset: "0",
                          repeat: "20px",
                        },
                      ]  
                  });
                  gUtils.currentDrawingOBj.setMap(gUtils.mymap);


                  gUtils.currentDrawingOBj.addListener('click',e=>{
                    main.onGoogleMapClick(e);
                  });
                  gUtils.currentDrawingOBj.addListener('rightclick',e=>{
                    main.onGoogleMapMouseRightClick(e);
                  });

            }

            //for second click display the distance and stop line drawing
            if(gUtils.currentDrawingData.length===2){
                /*dist group*/
                let dist = main.getDistance(gUtils.currentDrawingData[0], gUtils.currentDrawingData[1]);
                gUtils.stopDistanceTool(main.htmlElement);
                setTimeout(function (){
                    alert(`Distance : ${dist.toFixed(3)} meters`);
                },100);

            }
        }

    }

    // // logic for map mouse move
    // //for the purpose of displaying dashed line on map
    // // @param  {e} event.
    main.onGoogleMapMouseMove = function(e){


        let gUtils = main.envObj.gUtils
        const v = {};
        v.lat = e.latLng.lat();
        v.lng = e.latLng.lng();

        //logic for displaying line of distance tool
        if(gUtils.currentDrawingMode==="distance" && gUtils.currentDrawingOBj!=null && gUtils.currentDrawingData.length===1){
            /*dist group*/
           
            let path = [gUtils.currentDrawingData[0], v];
            gUtils.currentDrawingOBj.setPath(path);
        }

    }


    // //if user right click on map then exit from drawing mode
    main.onGoogleMapMouseRightClick = function(e){

        if(main.envObj.gUtils.currentDrawingMode==='distance')
            main.envObj.gUtils.stopDistanceTool(main.htmlElement);
    }


   
      
    main.getDistance = function(p1, p2) {
        let rad = function(x) { return x * Math.PI / 180;}
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2.lat - p1.lat);
        var dLong = rad(p2.lng - p1.lng);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d; // returns the distance in meter
    };
   

}