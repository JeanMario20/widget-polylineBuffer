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
define(['dojo/_base/declare',
  "dojo/_base/lang",
  "dojo/on",
  "dojo/aspect",
  "dojo/Deferred",
  "dojo/dom-class",
  "jimu/portalUrlUtils",
  "jimu/portalUtils",
  "jimu/tokenUtils",
  'jimu/BaseWidget',  
  'esri/geometry/Polyline',
  'esri/geometry/Point',
  'esri/graphic',
  'esri/symbols/SimpleLineSymbol',
  'esri/Color',
  'esri/geometry/geometryEngine',
  'esri/symbols/SimpleFillSymbol',
  'esri/layers/GraphicsLayer',
  'esri/symbols/SimpleMarkerSymbol',
  'esri/tasks/GeometryService',
  'esri/dijit/analysis/InterpolatePoints',
  'esri/symbols/TextSymbol',
  'esri/symbols/Font',
  "jimu/dijit/TabContainer3",
  "dijit/_WidgetsInTemplateMixin",
  "./search/SearchContext",
  "./search/util",
  "./search/SearchPane",
  "./search/AddFromUrlPane",
  "./search/AddFromFilePane",
  "./search/LayerListPane",
  "esri/graphicsUtils",
  "dojo/_base/array",
  "esri/dijit/Popup",
  "esri/dijit/PopupTemplate",
  "dojo/domReady!"
],
function(declare, lang, on, aspect, Deferred, domClass, portalUrlUtils, portalUtils,
  tokenUtils, BaseWidget, Polyline, Point, Graphic, SimpleLineSymbol, Color, geometryEngine, SimpleFillSymbol,
  GraphicsLayer, SimpleMarkerSymbol, GeometryService, InterpolatePoints, TextSymbol, Font,
  TabContainer3, _WidgetsInTemplateMixin, SearchContext, 
  util, SearchPane, AddFromUrlPane, AddFromFilePane, LayerListPane, graphicsUtils, array, Popup, PopupTemplate) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget, _WidgetsInTemplateMixin], {
    // DemoWidget code goes here

    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,
    name: "Análisis de Ingeniería",
    baseClass: 'jimu-widget-demo',
    
    batchGeocoderServers: null,
    isPortal: false,

    _isOpen: false,
    _searchOnOpen: false,

    tabContainer: null,
    searchPane: null,
    addFromUrlPane: null,
    addFromFilePane: null,
    postCreate: function() {
      this.inherited(arguments);
      console.log('postCreate');
      
    },

    startup: function () {
      if (this._started) {
        return;
      }
      

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
      var estacionMillar = "0"
      var estacionCentenas = "0"
      var estacionDecenas = "0"
      var estacionUnidades = "0"      
      var estacionDecimetro = "0"
      var estacionCentimetro = "0"
      var totalEstacionKilometro = estacionMillar + "+" + estacionCentenas + estacionDecenas + estacionUnidades + "." + estacionDecimetro + estacionCentimetro

      var longitudTotalPolyline = null
      var pointCoords = []
      


      boton.addEventListener('click', function() {
        
        dibujarLineas = !dibujarLineas
        //polylineCoordenates.length = 0;
        console.log(dibujarLineas)
      })

      bufferBoton.addEventListener('click', function() {

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
          //pruebas de conversion de coordenadas ------------------------------------------------------------

          let capasAgregadas = mapa.getLayer(prueba);
          let todosLosGraficos = capasAgregadas.graphics;
          todosLosGraficos.forEach(function(grafico) {
            //console.log("ID del gráfico:", grafico.id);
            console.log("Geometría:", grafico.geometry);
            console.log(grafico.geometry.paths[0])
            var coordMts = grafico.geometry.paths[0][0]
            var coordX = coordMts[0]
            var coordY = coordMts[1]

            var GetCoord = decimalToDMS(coordX, coordY)

            console.log(GetCoord)


            console.log("----");
        });

        console.log('se a creado el buffer')
        var featureLayer = mapa.getLayer(mapa.graphicsLayerIds[2]);
        if(featureLayer){
          var geometries = graphicsUtils.getGeometries(featureLayer.graphics);
        }
        

        if(geometries && polyline){
          var buffer = geometryEngine.geodesicBuffer(geometries,50,"meters", true)
          var bufferPolyline = geometryEngine.geodesicBuffer(polyline,1,"kilometers", true)  
        } else if(polyline){
          var bufferPolyline = geometryEngine.geodesicBuffer(polyline,1,"kilometers", true)  
        } else if(geometries){
          var buffer = geometryEngine.geodesicBuffer(geometries,50,"meters", true)
        }
        
        //var buffer = geometryEngine.geodesicBuffer(geometries,50,"meters", true)
        //var bufferPolyline = geometryEngine.geodesicBuffer(polyline,1,"kilometers", true)
        
        var simpleFillSymbol = new SimpleFillSymbol();
        simpleFillSymbol.setColor(new Color([170, 255, 0, 0.25]));

        var simpleFillSymbol2 = new SimpleFillSymbol();
        simpleFillSymbol2.setColor(new Color([90, 255, 0, 0.25]));

        var line = new SimpleLineSymbol();
        line.setStyle(SimpleLineSymbol.STYLE_NULL);

        if(geometries && polyline){
          var bufferGraphic = new Graphic(buffer[0], simpleFillSymbol, line)
          graphicsLayer.add(bufferGraphic)
          var bufferGraphicPolyline = new Graphic(bufferPolyline, simpleFillSymbol, line)
          graphicsLayer.add(bufferGraphicPolyline)

        } else if(polyline){
          var bufferGraphicPolyline = new Graphic(bufferPolyline, simpleFillSymbol, line)
          graphicsLayer.add(bufferGraphicPolyline)
        } else if(geometries){
          var bufferGraphic = new Graphic(buffer[0], simpleFillSymbol, line)
          graphicsLayer.add(bufferGraphic)
        } 

        //-------------------------------------------------------------------------

        longitudTotalPolyline = calcularLongitudPolilinea(polylineCoordenates)
        console.log('la longitud total de la polyline es de ', longitudTotalPolyline, )
        var length = geometryEngine.geodesicLength(polyline, "meters");
        console.log('la longitud total de la polyline con geometryEngine es de ', length )

        const numPoints = 1000;
        const distanceBetweenPoints = longitudTotalPolyline / numPoints;
        //distanceBetweenPoints = 0.1

        // Crea los puntos a lo largo de la polilínea
        for (let i = 0; i < numPoints; i++) {
          const distanceFromStart = i * distanceBetweenPoints;
          pointCoords = getPointAlongPolyline(polylineCoordenates, distanceFromStart);
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

            var kilometraje = getDistance(polylineCoordenates[0], punto)
            var kilmetrajeToFixed = kilometraje.toFixed(2)
            var kilometroTotalFormato = DescomponerKilometro(kilmetrajeToFixed)
            console.log(kilometroTotalFormato)
            var kilometrajeString = kilometroTotalFormato.toString()

            var pointJson = {
              'x':coordenadaMasCercana[0], 'y':coordenadaMasCercana[1], "spatialReference": {"wkid": 4326 }
            }
            var textSymbol = new TextSymbol(kilometrajeString).setHorizontalAlignment('right').setVerticalAlignment('buttom')

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
          polyLineGraphic.attributes ={ id: "polyline_manual"}
          polylineGrap = polyLineGraphic.geometry

          var simpleMarkerSymbol = new SimpleMarkerSymbol()
          var pointGraphic = new Graphic(point, simpleMarkerSymbol)

          graphicsLayer.add(pointGraphic)
          graphicsLayer.add(polyLineGraphic)

        
        }
        else if(!dibujarLineas){
          console.log('no se esta dibujando')

          graphicsLayer.on("click", function(event){
            if(event.graphic.attributes && event.graphic.attributes.id ==="polyline_manual"){
              var popup = new PopupTemplate({
                title: "esto es un nombre"
              })

              popup.setContent('<label for="miInput">Introduce distancia a segmentar:</label>' +
                              '<input type="number" id="miInput">' +
                              '<button id="miBoton">calcular</button>');
    
              var graphic = new Graphic(event.graphic.geometry, event.graphic.symbol, event.graphic.attributes, popup)
              graphicsLayer.add(graphic)

              setTimeout(function() {
                var button = document.getElementById("miBoton");
                if (button) {
                    button.onclick = function() {
                        var input = document.getElementById("miInput");
                        var inputNum = parseInt(input.value)

                        const numPoints = 100;
                        var segmentacionPoints = []
                        pointCoords = []
                        

                        const distanceBetweenPoints = inputNum;
                        //distanceBetweenPoints = 0.1
                
                        // Crea los puntos a lo largo de la polilínea
                        for (let i = 0; i < numPoints + 1; i++) {
                          const distanceFromStart = i * distanceBetweenPoints;
                          pointCoords = getPointAlongPolyline2(polylineCoordenates, distanceFromStart);
                          var pointJson = {
                            "x": pointCoords[0], "y": pointCoords[1], "spatialReference": {"wkid": 4326 } 
                          }
                          var point = new Point(pointJson)
                          //polylinePoint.push(pointCoords)
                          segmentacionPoints.push(pointCoords)
                          var simpleMarkerSymbol = new SimpleMarkerSymbol()
                          var pointGraphic = new Graphic(point,simpleMarkerSymbol)

                          var kilometraje = getDistance(polylineCoordenates[0],[point.x, point.y])
                          var kilmetrajeToFixed = kilometraje.toFixed(2)
                          var kilometroTotalFormato = DescomponerKilometro(kilmetrajeToFixed)
                          console.log(kilometroTotalFormato)
                          var kilometrajeString = kilometroTotalFormato.toString()

                          var textSymbolSegmentar = new TextSymbol(kilometrajeString).setHorizontalAlignment('right').setVerticalAlignment('buttom')
                          var textSegmentar = new Graphic(point,textSymbolSegmentar)
                
                          //graphicsLayer.add(pointGraphic)
                          graphicsLayer.add(textSegmentar)

                          var limitarSegmentacion = geometryEngine.intersects(polyline, point);
                          if(!limitarSegmentacion){
                            graphicsLayer.remove(pointGraphic)
                            //Point.remove(point) ?? remover la geometria? 
                            break;
                          }
                        }
                
                        //segmentacion(polylinePoint,inputNum)
                        console.log(input.value);
                    };
                }
            }, 0);
            
            }
          })
          
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

      function DescomponerKilometro(numero){
        var millares = Math.floor(numero / 1000);
        numero = numero % 1000;
        var centenas = Math.floor(numero / 100);
        numero = numero % 100;
        var decenas = Math.floor(numero / 10);
        var unidades = Math.floor(numero % 10);

        // Para manejar los decimales
        var decimales = Math.floor((numero % 1) * 10);
        var centesimas = Math.floor(((numero * 10) % 1) * 10);

        estacionMillar = millares.toString()
        estacionCentenas = centenas.toString()
        estacionDecenas = decenas.toString()
        estacionUnidades = unidades.toString()
        estacionDecimetro = decimales.toString()
        estacionCentimetro = centesimas.toString()

        totalEstacionKilometro = estacionMillar + "+" + estacionCentenas + estacionDecenas + estacionUnidades + "." + estacionDecimetro + estacionCentimetro

        return totalEstacionKilometro
      }

      function segmentacion(vertices, distanciaSegmento) {
        let longitudTotal = 0;
        for (let i = 0; i < vertices.length - 1; i++) {
          const distancia = getDistance(vertices[i], vertices[i + 1]);
          longitudTotal += distancia;
          if (distancia >= distanciaSegmento){
            //marcar un text en la polyline
            console.log('aqui hay un segmento')
          }
        }
        return longitudTotal;
      }

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

      function getPointAlongPolyline2(vertices, distance) {
        // Recorre los vértices para encontrar el segmento adecuado
        let accumulatedDistance = 0;
        for (let i = 1; i < vertices.length; i++) {
          const segmentDistance = getDistance(vertices[i - 1], vertices[i]);

            // Calcula la fracción de la distancia en este segmento
            const remainingDistance = distance - accumulatedDistance;
            const fraction = remainingDistance / segmentDistance;

            // Interpola las coordenadas del punto
            const x = vertices[i - 1][0] + fraction * (vertices[i][0] - vertices[i - 1][0]);
            const y = vertices[i - 1][1] + fraction * (vertices[i][1] - vertices[i - 1][1]);

            return [x, y];
        }
      }

      function decimalToDMS(CoordX, CoordY) {
        /*const degrees = Math.floor(decimal);
        const minutesDecimal = (decimal - degrees) * 60;
        const minutes = Math.floor(minutesDecimal);
        const seconds = (minutesDecimal - minutes) * 60;

        const grados = coord / 111319.9
        const minutos = (grados - grados.toFixed()) * 60
        const segundos 
    
        return `${degrees}° ${minutes}' ${seconds.toFixed(2)}"`;*/

        const e = 2.7182818284;
        const X = 20037508.34;

        // Convierte la longitud de EPSG:3857 a EPSG:4326
        const long4326 = (CoordY * 180) / X;

        // Convierte la latitud de EPSG:3857 a EPSG:4326
        let lat4326 = CoordX / (X / 180);
        const exponent = (Math.PI / 180) * lat4326;
        lat4326 = Math.atan(e ** exponent);
        lat4326 = lat4326 / (Math.PI / 360);
        lat4326 = lat4326 - 90;

        return { lat: lat4326, lng: long4326 };
    }

      var self = this,  args = arguments;
      this._getUser().then(function(user) {
        //console.warn("AddData.user=",user);
        self._checkConfig();
        self._initTabs();
        return self._initContext(user);
      }).then(function() {
        self.inherited(args);
        if (self.tabContainer) {
          self.tabContainer.startup();
        } else if (self.searchPane) {
          // self.searchPane.startup();
        } else if (self.addFromUrlPane) {
          self.addFromUrlPane.startup();
        } else if (self.addFromFilePane) {
          self.addFromFilePane.startup();
        }
        self._initFooter(self.tabContainer, {
          "addFromUrlWidget": self.addFromUrlPane,
          "addFromFileWidget": self.addFromFilePane,
          // "searchWidget": self.searchPane,
        });
        self._initListeners();
        self.resize();
        //console.warn("AddData.startup",this);
      }).otherwise(function(error) {
        console.warn("AddData.startup error:", error);
        self.inherited(args);
        self.resize();
      });
    },

    onOpen: function(){
      var bSearch = (this.searchPane && this._addFromFilePaneOpen);
      this._isOpen = true;
      this._addFromFilePaneOpen = false;
      this.resize();
      if (bSearch) {
        this.searchPane.search();
      }
    },

    onClose: function(){
      console.log('onClose');
      this._isOpen = false;
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
    },

    _checkConfig: function() {
      if (!this.config) {
        this.config = {};
      }
      var initOption = function(options,name) {
        var opt = options[name];
        if (!opt) {
          opt = options[name] = {
            allow: true,
            label: null
          };
        }
        if (typeof opt.allow !== "boolean") {
          opt.allow = true;
        }
        if (name === "Curated") {
          if (typeof opt.filter !== "string" || lang.trim(opt.filter).length === 0) {
            opt.allow = false;
          }
        }
      };
      var config = this.config;
      if (!config.scopeOptions) {
        config.scopeOptions = {};
      }
      var options = config.scopeOptions;
      initOption(options,"MyContent");
      initOption(options,"MyOrganization");
      initOption(options,"Curated");
      initOption(options,"ArcGISOnline");
      initOption(config,"addFromUrl");
      initOption(config,"addFromFile");
    },

    getSharingUrl: function() {
      var p = portalUtils.getPortal(this.appConfig.portalUrl);
      return portalUrlUtils.getSharingUrl(p.portalUrl);
    },

    _getUser: function() {
      var dfd = new Deferred();
      var portalUrl = this.appConfig.portalUrl;
      if (tokenUtils.userHaveSignInPortal(portalUrl)) {
        portalUtils.getPortal(portalUrl).getUser().then(function(user) {
          dfd.resolve(user);
        }).otherwise(function(error) {
          console.warn("AddData._getUser error:", error);
          dfd.resolve(null);
        });
      } else {
        dfd.resolve(null);
      }
      return dfd;
    },

    _initBatchGeocoder: function(portal,user) {
      //console.warn("_initBatchGeocoder.portal",portal);
      //console.warn("_initBatchGeocoder.user",user);
      var roleOK = false;
      var regexWorld = /(arcgis.com\/arcgis\/rest\/services\/world\/geocodeserver).*/ig;
      var regexWorldProxy = /(\/servers\/[\da-z\.-]+\/rest\/services\/world\/geocodeserver).*/ig;
      var geocodeServers = portal && portal.helperServices && portal.helperServices.geocode || [];
      var isWorld, isWorldProxy, batchGeocodeServers = [];
      if (user && user.privileges) {
        roleOK = array.indexOf(user.privileges, "premium:user:geocode") > -1;
      }
      array.forEach(geocodeServers, function (server) {
        isWorld = !!server.url.match(regexWorld);
        isWorldProxy = !!server.url.match(regexWorldProxy);
        if ((isWorld && !portal.isPortal && roleOK) || isWorldProxy || !!server.batch) {
          batchGeocodeServers.push({
            "isWorldGeocodeServer": isWorld || isWorldProxy,
            "isWorldGeocodeServerProxy": isWorldProxy,
            "label": server.name,
            "value": server.url,
            "url": server.url,
            "name": server.name
          });
        }
      });
      this.batchGeocoderServers = batchGeocodeServers;
      //console.warn("batchGeocoderServers",this.batchGeocoderServers);
    },

    _initContext: function(user) {
      var dfd = new Deferred(), bResolve = true;
      // TODO configure this?
      var arcgisOnlineUrl = util.checkMixedContent("http://www.arcgis.com");
      var scopeOptions = this.config.scopeOptions;
      var hasUsername = (user && typeof user.username === "string" && user.username.length > 0);
      var searchContext = new SearchContext();
      var portal = portalUtils.getPortal(this.appConfig.portalUrl);
      this.isPortal = portal.isPortal;
      searchContext.portal = portal;

      // Issue #14908
      if (portal.isPortal) {
        searchContext.orgId = portal.id;
      }

      if (user) {
        if (typeof user.orgId === "string" && user.orgId.length > 0) {
          searchContext.orgId = user.orgId;
        }
      }
      if (hasUsername) {
        searchContext.username = user.username;
      } else {
        scopeOptions.MyContent.allow = false;
      }
      if (this.searchPane) {
        this.searchPane.searchContext = searchContext;
        this.searchPane.portal = portal;
      }
      this._initBatchGeocoder(portal,user);

      // KML and GeoRSS utility services
      if (portal.isPortal) {
        try {
          var kmlsvc = portalUrlUtils.getSharingUrl(portal.portalUrl) + "/kml";
          kmlsvc = kmlsvc.replace("/sharing/rest/kml","/sharing/kml");
          window.esri.config.defaults.kmlService = kmlsvc;
          window.esri.config.defaults.geoRSSService = kmlsvc.replace("/kml","/rss");
        } catch(ex) {
          console.error(ex);
        }
      }

      //console.warn("AddData.portal",portal);
      var msg = this.nls.search.loadError + arcgisOnlineUrl;
      var arcgisOnlineOption = scopeOptions.ArcGISOnline;
      searchContext.allowArcGISOnline = arcgisOnlineOption.allow;
      if (portal.isPortal && searchContext.allowArcGISOnline) {
        var arcgisOnlinePortal = portalUtils.getPortal(arcgisOnlineUrl);
        if (!arcgisOnlinePortal) {
          console.warn(msg);
          searchContext.allowArcGISOnline = false;
          arcgisOnlineOption.allow = false;
        } else {
          if (!arcgisOnlinePortal.helperServices) {
            bResolve = false;
            arcgisOnlinePortal.loadSelfInfo().then(function() {
              if (!arcgisOnlinePortal.helperServices) {
                console.warn(msg);
                searchContext.allowArcGISOnline = false;
                arcgisOnlineOption.allow = false;
              } else {
                searchContext.arcgisOnlinePortal = arcgisOnlinePortal;
                //console.warn("searchContext.arcgisOnlinePortal",arcgisOnlinePortal);
              }
              dfd.resolve();
            }).otherwise(function(error) {
              searchContext.allowArcGISOnline = false;
              arcgisOnlineOption.allow = false;
              console.warn(msg);
              console.warn(error);
              dfd.resolve();
            });
          }
        }
        //console.warn("arcgisOnlinePortal",arcgisOnlinePortal);
      } else {
        if (!hasUsername && !portal.isPortal) {
          // MyOrganization and ArcGISOnline are equivalent, - PUBLIC
          if (scopeOptions.MyOrganization.allow && scopeOptions.ArcGISOnline.allow) {
            scopeOptions.MyOrganization.allow = false;
          }
        }
      }
      if (bResolve) {
        dfd.resolve();
      }
      return dfd;
    },

    _initFooter: function(parentNode, widgets) {
      if(parentNode) {
        var searchWidget = widgets.searchWidget,
            hasSearchFooter = false;
        if(searchWidget &&
           searchWidget.footerNode &&
           searchWidget.footerNode.nodeName) {
          hasSearchFooter = true;
        }
        var footerContainer = this.footerContainer = document.createElement("DIV");
        footerContainer.className = this.baseClass + "-footer";
        if(hasSearchFooter) {
          footerContainer.appendChild(searchWidget.footerNode);
        }
        var layerListBtn = document.createElement("A");
        layerListBtn.className = "layerlist-button jimu-float-trailing";
        layerListBtn.href = "#";
        layerListBtn.innerHTML = "<span class='esri-icon-layers'></span>" + this.nls.layerList.caption;
        this.own(on(layerListBtn, "click", lang.hitch(this, function(evt) {
          evt.preventDefault();
          this.showLayers();
        })));
        footerContainer.appendChild(layerListBtn);
        var messageNode = this.messageNode = document.createElement("SPAN");
        messageNode.className = "message";
        footerContainer.appendChild(messageNode);
        var targetNode = parentNode.containerNode || parentNode.domNode || parentNode;
        if(targetNode.nodeName) {
          targetNode.appendChild(footerContainer);
        }
        this.own(on(this.tabContainer, "tabChanged", lang.hitch(this, function(title) {
          this._setStatus("");
          if(hasSearchFooter) {
            searchWidget.footerNode.style.display = title === this.nls.tabs.search ? "" : "none";
          }
          if(this.nls.tabs.search === title) {
            if(hasSearchFooter) {
              searchWidget.footerNode.style.display = "";
            }
            messageNode.style.display = "none";
          } else {
            if(hasSearchFooter) {
              searchWidget.footerNode.style.display = "none";
            }
            messageNode.style.display = "";
          }
        })));
      }
    },

    _initListeners: function() {
      var self = this;
      if (this.map) {
        this.own(this.map.on("extent-change", function() {
          try {
            if (self.searchPane && self.searchPane.bboxOption.bboxToggle.get("checked")) {
              if (self._isOpen) {
                self.searchPane.search();
              } else {
                self._searchOnOpen = true;
              }
            }
          } catch (ex) {
            console.warn(ex);
          }
        }));
      }
    },

    _initTabs: function(){
      var config = this.config, tabs = [];
      //console.warn("config",config);

      var supportsFile = !!(window.File && window.FileReader && window.FormData);
      var allowSearch = false, options = config.scopeOptions;
      var chkAllowSearch = function(name) {
        if (!allowSearch) {
          if (options && options[name] && options[name].allow) {
            allowSearch = true;
          }
        }
      };
      chkAllowSearch("MyContent");
      chkAllowSearch("MyOrganization");
      chkAllowSearch("Curated");
      chkAllowSearch("ArcGISOnline");

      // if (allowSearch) {
      //   this.searchPane = new SearchPane({
      //     wabWidget: this
      //   },this.searchNode);
      //   tabs.push({
      //     title: this.nls.tabs.search,
      //     content: this.searchPane.domNode
      //   });
      // }
      
      if (supportsFile && config.addFromFile && config.addFromFile.allow) {
        this.addFromFilePane = new AddFromFilePane({
          wabWidget: this
        },this.fileNode);
        tabs.push({
          title: this.nls.tabs.file,
          content: this.addFromFilePane.domNode
        });
      }
      if (config.addFromUrl && config.addFromUrl.allow) {
        this.addFromUrlPane = new AddFromUrlPane({
          wabWidget: this
        },this.urlNode);
        tabs.push({
          title: this.nls.tabs.url,
          content: this.addFromUrlPane.domNode
        });
      }

      var self = this;
      if (tabs.length > 0) {
        this.tabContainer = new TabContainer3({
          average: true,
          tabs: tabs
        }, this.tabsNode);
        try {
          if (tabs.length === 1 && this.tabContainer.controlNode &&
            this.tabContainer.containerNode) {
            this.tabContainer.controlNode.style.display = "none";
            this.tabContainer.containerNode.style.top = "0px";
            //console.warn("this.tabContainer",this.tabContainer);
          }
        } catch(ex1) {}
        //this.tabContainer.hideShelter();
        this.own(aspect.after(this.tabContainer,"selectTab",function(title){
          //console.warn("selectTab",title);
          if (self.searchPane && title === self.nls.tabs.search) {
            self.searchPane.resize();
          }
        },true));
      } else if (tabs.length === 0) {
        this.tabsNode.appendChild(document.createTextNode(this.nls.noOptionsConfigured));
      }
    },

    _setStatus: function(msg) {
      if (!this.messageNode) {
        return;
      }
      util.setNodeText(this.messageNode, msg);
      this.messageNode.title = msg;
    },

    resize: function() {
      var widgetWidth = this.domNode.clientWidth,
          widgetHeight = this.domNode.clientHeight;
      if (widgetWidth > 1000) {
        domClass.remove(this.domNode, "width-768");
        domClass.add(this.domNode, "width-1200");
      } else if (widgetWidth > 768) {
        domClass.remove(this.domNode, "width-1200");
        domClass.add(this.domNode, "width-768");
      } else {
        domClass.remove(this.domNode, ["width-768", "width-1200"]);
      }

      if (widgetWidth < 420) {
        domClass.remove(this.domNode, "width-medium");
        domClass.add(this.domNode, "width-small");
      } else if (widgetWidth < 750) {
        domClass.remove(this.domNode, "width-small");
        domClass.add(this.domNode, "width-medium");
      } else {
        domClass.remove(this.domNode, ["width-small", "width-medium"]);
      }

      //console.warn("widgetWidth",widgetWidth);
      if (widgetWidth < 340) {
        domClass.add(this.domNode,"filter-placeholder-on");
      } else {
        domClass.remove(this.domNode,"filter-placeholder-on");
      }

      if(widgetHeight < 400) {
        domClass.add(this.domNode, "height-small");
      } else {
        domClass.remove(this.domNode, "height-small");
      }

      if (this.searchPane) {
        this.searchPane.resize();
      }
    },

    showLayers: function(){
      if (!this.layerListPane) {
        this.layerListPane = new LayerListPane({
          wabWidget: this
        });
        this.layerListPane.placeAt(this.domNode);
      }
      this.layerListPane.show();
    },
  });
});