define({
  root: ({
    _widgetLabel: "Análisis de Ingeniería",
    _featureAction_ShowVertex: "Show Vertex Count",
    label1: "I am a demo widget.",
    label2: "This is configurable.",
    
    noOptionsConfigured: "No options were configured.",

    tabs: {
      search: "Search",
      url: "URL",
      file: "File"
    },

    search: {
      featureLayerTitlePattern: "{serviceName} - {layerName}",
      layerInaccessible: "The layer is inaccessible.",
      loadError: "AddData, unable to load:",
      searchBox: {
        search: "Search",
        placeholder: "Search..."
      },
      bboxOption: {
        bbox: "Within map"
      },
      scopeOptions: {
        anonymousContent: "Content",
        myContent: "My Content",
        myOrganization: "My Organization",
        curated: "Curated",
        ArcGISOnline: "ArcGIS Online"
      },
      sortOptions: {
        prompt: "Sort By:",
        relevance: "Relevance",
        title: "Title",
        owner: "Owner",
        rating: "Rating",
        views: "Views",
        date: "Date",
        switchOrder: "Switch"
      },
      typeOptions: {
        prompt: "Type",
        mapService: "Map Service",
        featureService: "Feature Service",
        imageService: "Image Service",
        vectorTileService: "Vector Tile Service",
        kml: "KML",
        wms: "WMS"
      },
      resultsPane: {
        noMatch: "No results were found."
      },
      paging: {
        first: "<<",
        firstTip: "First",
        previous: "<",
        previousTip: "Previous",
        next: ">",
        nextTip: "Next",
        pagePattern: "{page}"
      },
      resultCount: {
        countPattern: "{count} {type}",
        itemSingular: "Item",
        itemPlural: "Items"
      },

      item: {
        actions: {
          add: "Add",
          close: "Close",
          remove: "Remove",
          details: "Details",
          done: "Done",
          editName: "Edit Name"
        },
        messages: {
          adding: "Adding...",
          removing: "Removing...",
          added: "Added",
          addFailed: "Add failed",
          unsupported: "Unsupported"
        },
        typeByOwnerPattern: "{type} by {owner}",
        dateFormat: "MMMM d, yyyy",
        datePattern: "{date}",
        ratingsCommentsViewsPattern: "{ratings} {ratingsIcon} {comments} {commentsIcon} {views} {viewsIcon}",
        ratingsCommentsViewsLabels: {"ratings": "ratings", "comments": "comments", "views": "views"},
        types: {
          "Map Service": "Map Service",
          "Feature Service": "Feature Service",
          "Image Service": "Image Service",
          "Vector Tile Service": "Vector Tile Service",
          "WMS": "WMS",
          "KML": "KML"
        }
      }
    },

    addFromUrl: {
      type: "Type",
      url: "URL",
      types: {
        "ArcGIS": "An ArcGIS Server Web Service",
        "WMS": "A WMS OGC Web Service",
        "WMTS": "A WMTS OGC Web Service",
        "WFS": "A WFS OGC Web Service",
        "KML": "A KML File",
        "GeoRSS": "A GeoRSS File",
        "CSV": "A CSV File"
      },
      samplesHint: "Sample URL(s)",
      invalidURL: "Please enter a URL starting with http:// or https://. "
    },

    addFromFile: {
      intro: "You can drop or browse for one the following file types:",
      types: {
        "Shapefile": "A Shapefile (.zip, ZIP archive containing all shapefile files)",
        "CSV": "A CSV File (.csv, with address or latitude, longitude and comma, semi-colon or tab delimited)",
        "KML": "A KML File (.kml)",
        "GPX": "A GPX File (.gpx, GPS Exchange Format)",
        "GeoJSON": "A GeoJSON File (.geo.json or .geojson)"
      },
      generalizeOn: "Generalize features for web display",
      dropOrBrowse: "Drop or Browse",
      browse: "Browse",
      invalidType: "This file type is not supported.",
      addingPattern: "{filename}: adding...",
      addFailedPattern: "{filename}: add failed",
      featureCountPattern: "{filename}: {count} feature(s)",
      invalidTypePattern: "{filename}: this type is not supported",
      maxFeaturesAllowedPattern: "A maximum of {count} features is allowed",
      layerNamePattern: "{filename} - {name}",
      generalIssue: "There was an issue.",
      kmlProjectionMismatch: "The spatial reference of the map and KML layer do not match, and the conversion cannot be done on the client.",
      featureLocationsCouldNotBeFound: "Features could not be located: unknown or invalid location fields. The file will be added as a table."
    },

    layerList: {
      caption: "Layers",
      noLayersAdded: "No layers have been added.",
      removeLayer: "Remove Layer",
      back: "Back"
    }
  }),
  "es": 1,
  "zh-cn": 1
});
