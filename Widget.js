///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define(['dojo/_base/declare', 'jimu/BaseWidget', 'esri/geometry/Polyline', 'esri/geometry/Point', 'esri/graphic',
'esri/symbols/SimpleLineSymbol',
'esri/Color',
'esri/geometry/geometryEngine',
'esri/symbols/SimpleFillSymbol',
'esri/layers/GraphicsLayer',
'esri/symbols/SimpleMarkerSymbol',
'esri/tasks/GeometryService',
'esri/dijit/analysis/InterpolatePoints',
'esri/symbols/TextSymbol',
'esri/symbols/Font'],
function(declare, BaseWidget, Polyline, Point, Graphic, SimpleLineSymbol, Color, geometryEngine, SimpleFillSymbol, GraphicsLayer,SimpleMarkerSymbol,GeometryService, InterpolatePoints, TextSymbol, Font) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {
    // DemoWidget code goes here

    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,

    baseClass: 'jimu-widget-demo',
    

    postCreate: function() {
      this.inherited(arguments);
      console.log('postCreate');
      
    },

    startup: function() {
      var graphicsLayer = new GraphicsLayer();
      this.map.addLayer(graphicsLayer);
      const boton = document.getElementById("miboton");
      const bufferBoton = document.getElementById("bufferButton");
      const intersectarButton = document.getElementById("intersectarButton");
      var dibujarLineas = false;
      var puntosAencontrar = false;
      var puntosInteres = [];
      var polylineCoordenates = [];
      var vertices = [];
      var polyline = null;
      var interseccion = null;
      var coordenadaMasCercana = null;
      var coordenadaPolylineIntersect = [];
      var polylinePoint = []
      
      var mapa = this.map

      boton.addEventListener('click', function() {
        
        dibujarLineas = !dibujarLineas
        //polylineCoordenates.length = 0;
        console.log(dibujarLineas)
      })

      bufferBoton.addEventListener('click', function() {

        console.log('se a creado el buffer')

        var buffer = geometryEngine.geodesicBuffer(polyline,10,"kilometers")
        
        var simpleFillSymbol = new SimpleFillSymbol();
        simpleFillSymbol.setColor(new Color([170, 255, 0, 0.25]));

        var simpleFillSymbol2 = new SimpleFillSymbol();
        simpleFillSymbol2.setColor(new Color([90, 255, 0, 0.25]));

        var line = new SimpleLineSymbol();
        line.setStyle(SimpleLineSymbol.STYLE_NULL);

        var bufferGraphic = new Graphic(buffer, simpleFillSymbol, line)
        
    
        graphicsLayer.add(bufferGraphic)


        //-------------------------------------------------------------------------

        var longitudTotalPolyline = calcularLongitudPolilinea(polylineCoordenates)
        console.log('la longitud total de la polyline es de ', longitudTotalPolyline, )
        var length = geometryEngine.geodesicLength(polyline, "meters");
        console.log('la longitud total de la polyline con geometryEngine es de ', length )

        const numPoints = 1000;
        const distanceBetweenPoints = longitudTotalPolyline / numPoints;
        //distanceBetweenPoints = 0.1

        // Crea los puntos a lo largo de la polilínea
        for (let i = 0; i < numPoints; i++) {
          const distanceFromStart = i * distanceBetweenPoints;
          const pointCoords = getPointAlongPolyline(polylineCoordenates, distanceFromStart);
          var pointJson = {
            "x": pointCoords[0], "y": pointCoords[1], "spatialReference": {"wkid": 4326 } 
          }
          var point = new Point(pointJson)
          polylinePoint.push(pointCoords)
          var simpleMarkerSymbol = new SimpleMarkerSymbol()
          var pointGraphic = new Graphic(point)

          graphicsLayer.add(pointGraphic)
        }

        

        // Función para obtener las coordenadas de un punto a lo largo de la polilínea
        function getPointAlongPolyline(vertices, distance) {
          // Verifica si la distancia es válida
          if (distance < 0 || distance > longitudTotalPolyline) {
            console.error("Distancia fuera de los límites de la polilínea.");
            return null;
          }

          // Recorre los vértices para encontrar el segmento adecuado
          let accumulatedDistance = 0;
          for (let i = 1; i < vertices.length; i++) {
            const segmentDistance = getDistance(vertices[i - 1], vertices[i]);
            if (accumulatedDistance + segmentDistance >= distance) {
              // Calcula la fracción de la distancia en este segmento
              const remainingDistance = distance - accumulatedDistance;
              const fraction = remainingDistance / segmentDistance;

              // Interpola las coordenadas del punto
              const x = vertices[i - 1][0] + fraction * (vertices[i][0] - vertices[i - 1][0]);
              const y = vertices[i - 1][1] + fraction * (vertices[i][1] - vertices[i - 1][1]);

              return [x, y];
            }
            accumulatedDistance += segmentDistance;
            
          }
          
        }

        // Función para calcular la distancia entre dos puntos
        function getDistance(p1, p2) {
          const earthRadius = 6371; // Radio de la Tierra en kilómetros

          // Convertir las coordenadas de grados a radianes
          const lat1Rad = (p1[1] * Math.PI) / 180;
          const lon1Rad = (p1[0] * Math.PI) / 180;
          const lat2Rad = (p2[1] * Math.PI) / 180;
          const lon2Rad = (p2[0] * Math.PI) / 180;

          // Calcular las diferencias de latitud y longitud
          const dLat = lat2Rad - lat1Rad;
          const dLon = lon2Rad - lon1Rad;

          // Aplicar la fórmula de Haversine
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = earthRadius * c;

          return distance; // Distancia en kilómetros
        }


        function calcularLongitudPolilinea(vertices) {
          let longitudTotal = 0;
          for (let i = 0; i < vertices.length - 1; i++) {
            const distancia = getDistance(vertices[i], vertices[i + 1]);
            longitudTotal += distancia;
          }
          return longitudTotal;
        }

        //conectar el punto de interes con el point de la polyne
        puntosInteres.forEach(recorrido);
        function recorrido(puntos, index, array){ //en el array se estan tomando en cuenta para almacenenar los puntos a identificar 
          var resultado = geometryEngine.nearestCoordinate(buffer,puntos)
          var prueba = null
          mapa.graphicsLayerIds.forEach(function(layer){
            if (layer === 'buffer' || layer == "graphicsLayer1"){
              console.log(layer)
            } else if(layer === 'graphicsLayer1'){
              console.log(layer)
            } else if(layer === "marker-feature-action-layer"){
              console.log(layer)
            }
            else{
              console.log(layer)
              prueba = layer
            }
          })

          //console.log(prueba)

          //var prueba = mapa.graphicsLayerIds[1]

          let capasAgregadas = mapa.getLayer(prueba);
          let todosLosGraficos = capasAgregadas.graphics;
          todosLosGraficos.forEach(function(grafico) {
            console.log("ID del gráfico:", grafico.id);
            console.log("Geometría:", grafico.geometry);
            console.log("Atributos:", grafico.attributes);
            console.log("Símbolo:", grafico.symbol);
            console.log("----");
        });

          if(resultado.distance === 0){
            console.log('un punto se encuentra dentro del buffer')

            var punto = [puntos.x, puntos.y]

            //encontrarCoordenadamasCercana(arrayInterseccion, punto);
            encontrarCoordenadamasCercana(polylinePoint, punto)
            polylinePoint = []

            coordenadaPolylineIntersect.push(punto)
            coordenadaPolylineIntersect.push(coordenadaMasCercana)

            //se crea nueva geometria se va comenzar con las coordenadas desde el interseccion 
            var polylineJson = {
              "paths":[coordenadaPolylineIntersect],
              "spatialReference":{"wkid":4326}
            };
            coordenadaPolylineIntersect = []
            polylineIntersect = new Polyline(polylineJson)
            var simpleLineSymbol = new SimpleLineSymbol();
            simpleLineSymbol.setColor(new Color([0,0,0,10]));
            var polyLineGraphic = new Graphic(polylineIntersect, simpleLineSymbol);

            //var kilometraje = getDistance(polyline[0], punto)
            //var kilometrajeString = str(kilometraje)

            var pointJson = {
              'x':punto[0], 'y':punto[1], "spatialReference": {"wkid": 4326 }
            }
            var textSymbol = new TextSymbol('esto es una prueba').setHorizontalAlignment('right').setVerticalAlignment('buttom')

            var point = new Point(pointJson)
            var text = new Graphic(point,textSymbol)

            graphicsLayer.add(polyLineGraphic)
            graphicsLayer.add(text)

          }
        }


      })

      intersectarButton.addEventListener('click', function() {
        puntosAencontrar = !puntosAencontrar
        console.log(puntosAencontrar)
      })
      
      this.map.on("click", function(event){
        console.log('se a oprimido')

        if(dibujarLineas){
          console.log('se esta dibujando');
          //polylineCoordenates.push(event.mapPoint)
          vertices = [event.mapPoint.getLongitude(), event.mapPoint.getLatitude()]
          polylineCoordenates.push(vertices)

          var polylineJson = {
            "paths":[polylineCoordenates],
            "spatialReference":{"wkid":4326}
          };
          
          var pointJson = {
            "x": event.mapPoint.getLongitude(), "y": event.mapPoint.getLatitude(), "spatialReference": {"wkid": 4326 } 
          }

          console.log(polyline)

          polyline = new Polyline(polylineJson)
          var point = new Point(pointJson)

          console.log(polyline)

          var simpleLineSymbol = new SimpleLineSymbol();
          simpleLineSymbol.setColor(new Color([0,0,0,10]));
          var polyLineGraphic = new Graphic(polyline, simpleLineSymbol);
          polylineGrap = polyLineGraphic.geometry

          var simpleMarkerSymbol = new SimpleMarkerSymbol()
          var pointGraphic = new Graphic(point, simpleMarkerSymbol)

          graphicsLayer.add(pointGraphic)
          graphicsLayer.add(polyLineGraphic)

        
        }
        else if(!dibujarLineas){
          console.log('no se esta dibujando')
          
          console.log(polylineCoordenates)

        }

        //creacion punto de interes
        if(puntosAencontrar){
          var pointJson = {
            "x": event.mapPoint.getLongitude(), "y": event.mapPoint.getLatitude(), "spatialReference": {"wkid": 4326 } 
          }
          var puntoAEncontrar = new Point(pointJson)
          puntosInteres.push(puntoAEncontrar) 
          var interes = new SimpleMarkerSymbol()
          interes.setColor(new Color([100,50,0,10]))
          var pointGraphic = new Graphic(puntoAEncontrar, interes)
          graphicsLayer.add(pointGraphic)

        }
      })

      function calcularDistancia(coord1, coord2) {
        const dx = coord2[0] - coord1[0];
        const dy = coord2[1] - coord1[1];
        return Math.sqrt(dx * dx + dy * dy);
      }

      function encontrarCoordenadamasCercana(matriz, punto){
        let distanciaMinima = Infinity;
        let coordenadaCercana = null;

        matriz.forEach((submatriz) => {
          const distancia = calcularDistancia(submatriz,punto)
          if (distancia < distanciaMinima){
            distanciaMinima = distancia;
            coordenadaCercana = submatriz
          }
        })

        coordenadaMasCercana = coordenadaCercana
        return coordenadaCercana
      }

      

      function calcularPendiente(polyline, point){
        var pointX = point[0];
        var pointY = point[1];

        // Calcular la pendiente entre el punto y el vértice mas cercano al punto de la polilínea
        var dx = polyline[0] - pointX;
        var dy = polyline[1] - pointY;
        var pendiente = dy / dx;

        // Extender la pendiente para obtener un nuevo punto (por ejemplo, a 100 unidades)
        const distance = 5; // Longitud deseada
        const newX = pointX + distance / Math.sqrt(1 + pendiente * pendiente);
        const newY = pointY + pendiente * (newX - pointX);

        return [newX, newY]

      }
    },

    onOpen: function(){
      
    },

    onClose: function(){
      console.log('onClose');
    },

    onMinimize: function(){
      console.log('onMinimize');
      console.log('se a agregado los puntos');
      this.graphicsLayer.add(graphic)
    },

    onMaximize: function(){
    },

    onSignIn: function(credential){
      /* jshint unused:false*/
      console.log('onSignIn');
    },

    onSignOut: function(){
      console.log('onSignOut');
    },

    showVertexCount: function(count){
      this.vertexCount.innerHTML = 'The vertex count is: ' + count;
    }
  });
});
