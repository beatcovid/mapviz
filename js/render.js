//many, many, many thanks:
//http://raphaeljs.com/world/
//http://raphaeljs.com
//www.jquery.com
//http://www.apress.com/9781430236658

// Australia centroid as "home base"

jQuery(document).ready(function() {
  ;(function() {
    //////////
    //Settings
    //////////

    //colors used in JavaScript (see CSS for for other colors such as data key)

    //see settings.js for more helpful settings to users such as slide show, data source locations, etc.

    //////////////////////////
    //likely no need to change
    //////////////////////////

    var mapOrigWidth = 1000 //Raphael map starts this way
    var mapOrigHeight = 400 //Raphael map starts this way
    var mapBackOrigWidth = 2048
    var mapBackOrigHeight = 1024
    var mapBackScale = 1.0
    var mapScale = 1.0 //will change with window size
    var rMap //will allow access to Raphael world map canvas and individual countries
    var dataCanvasLeft = 0 //where map and data starts, a little off the left edge to line up with background map

    /////////
    //the map
    /////////

    //based on map that cuts off the poles from original example at
    var latLonToXY = function(lat, lon, scale) {
      var x, y
      return {
        y: lat * (-2.6938 * scale) + 227.066 * scale,
        x: lon * (2.6938 * scale) + 465.4 * scale,
      }
    }

    //determines map scale
    //may need additional work for very wide but not very tall screens
    var setMapScale = function() {
      var fullWidth = window.innerWidth
      var fullHeight = window.innerHeight

      mapBackScale = fullWidth / mapBackOrigWidth

      mapScale = fullWidth / (mapOrigWidth - 31)

      dataCanvasLeft = (39 * mapScale) / 2
    }

    //draw map background
    var mapBackImg = new Image()
    var mapBackImgLoaded = false
    var mapBackCanvas
    var mapBackContext
    var drawMapBack = function() {
      //setup canvas
      mapBackCanvas = $("#mapBackLayer")[0]
      mapBackContext = mapBackCanvas.getContext("2d")

      mapBackContext.canvas.width = window.innerWidth
      mapBackContext.canvas.height = mapBackOrigHeight * mapBackScale
      $("#mapBackLayer").css(
        "top",
        window.innerHeight / 2 -
          (Math.round(mapBackContext.canvas.height / 2) - 100 * mapBackScale) +
          "px",
      )

      //only load once, otherwise runs into issues on resize
      if (mapBackImgLoaded == false) {
        mapBackImgLoaded = true

        mapBackImg.onload = function() {
          console.log("back image loaded")
          mapBackContext.drawImage(
            mapBackImg,
            0,
            0,
            mapBackContext.canvas.width,
            mapBackContext.canvas.height,
          )
        }
        mapBackImg.src = "img/map2.jpg"
      } else {
        mapBackContext.drawImage(
          mapBackImg,
          0,
          0,
          mapBackContext.canvas.width,
          mapBackContext.canvas.height,
        )
      }
    }

    //draw that map
    var r
    var drawMap = function() {
      setMapScale()
      drawMapBack()

      var target = "mapLayer"
      $("#" + target).html("") //clear it for redrawing

      //center over map background
      $("#" + target).css(
        "top",
        window.innerHeight / 2 -
          Math.round(mapOrigHeight * mapScale) / 2 +
          20.5 * mapScale +
          "px",
      )
      $("#" + target).css("left", dataCanvasLeft + "px")

      //cut off extra map on right to prevent scrolling
      $("#" + target).css(
        "width",
        Math.round(mapOrigWidth * mapScale) -
          dataCanvasLeft -
          (Math.round(mapOrigWidth * mapScale) -
            Math.round(mapBackOrigWidth * mapBackScale)) +
          "px",
      )

      Raphael(
        target,
        Math.round(mapOrigWidth * mapScale),
        Math.round(mapOrigHeight * mapScale),
        function() {
          r = this
          //console.log(((mapBackOrigHeight * mapBackScale) - (mapOrigHeight * mapScale) - dataCanvasLeft));
          r.rect(
            0,
            0,
            Math.round(mapOrigWidth * mapScale),
            Math.round(mapOrigHeight * mapScale),
            10,
          ).attr({
            stroke: "none",
            fill: "none",
          })

          r.setStart()
          var hue = Math.random()
          for (var country in worldmap.shapes) {
            r.path(worldmap.shapes[country])
              .attr({
                stroke: colors["mapLines"],
                fill: colors["mapFill"],
                "stroke-opacity": 1.0,
                "stroke-width": 1.5,
              })
              .scale(mapScale, mapScale, 0, 0)
              .data("cc", country)
          }
          var world = r.setFinish()
        },
      )
    }

    //get map going
    drawMap()
    window.addEventListener("resize", drawMap, false) //!!! call a function that handles all canvas layers all at once

    ////////////////////
    //draw data movement
    ////////////////////

    var dataCanvas
    var dataContext
    var homeBaseXY //data will flow to a from here
    var areciboXY
    var dataTransfers = [] //animated transfer dots/objects

    var initDataCanvas = function() {
      //set where data flows to and from:
      homeBaseXY = latLonToXY(homeBase.lat, homeBase.lon, mapScale)

      //position
      $("#dataLayer").css(
        "top",
        window.innerHeight / 2 -
          Math.round(mapOrigHeight * mapScale) / 2 +
          20.5 * mapScale +
          "px",
      )

      //setup canvas
      dataCanvas = $("#dataLayer")[0]
      dataContext = dataCanvas.getContext("2d")

      dataContext.canvas.width =
        Math.round(mapOrigWidth * mapScale) - dataCanvasLeft * 2
      dataContext.canvas.height = Math.round(mapOrigHeight * mapScale)
    }

    //get data canvas going
    initDataCanvas()
    window.addEventListener("resize", initDataCanvas, false)

    ////////////////////
    //draw data sources
    ////////////////////
    var dataSourcesCanvas
    var dataSourcesContext
    var dataSourcesTrack = []

    //set the stage and plot observatories and other SETI data sources
    var initDataSources = function() {
      var i, source, tmpX, tmpY, tmpLocXY
      //position canvas
      $("#dataSourcesLayer").css(
        "top",
        window.innerHeight / 2 -
          Math.round(mapOrigHeight * mapScale) / 2 +
          20.5 * mapScale +
          "px",
      )

      //setup canvas
      dataSourcesCanvas = $("#dataSourcesLayer")[0]
      dataSourcesContext = dataSourcesCanvas.getContext("2d")

      dataSourcesContext.canvas.width =
        Math.round(mapOrigWidth * mapScale) - dataCanvasLeft * 2
      dataSourcesContext.canvas.height = Math.round(mapOrigHeight * mapScale)

      //init data source locations (which animate themselves)
      dataSourcesTrack = []
      for (i = 0; i < dataSources.length; i++) {
        tmpLocXY = latLonToXY(dataSources[i].lat, dataSources[i].lon, mapScale)
        tmpX = tmpLocXY.x + dataCanvasLeft
        tmpY = tmpLocXY.y
        source = new DataSource(dataSources[i].name, tmpX, tmpY, "#FFF")
        dataSourcesTrack.push(source)
      }
    }

    //get data sources canvas going
    initDataSources()
    window.addEventListener("resize", initDataSources, false)

    //Show homeBase label
    var plotHomeBase = function() {
      //text shadow
      dataSourcesContext.font = "12px Helvetica"
      dataSourcesContext.fillStyle = "rgba(0, 54, 74, 1.0)"
      dataSourcesContext.fillText(
        homeBase.name,
        homeBaseXY.x - 30 + dataCanvasLeft,
        homeBaseXY.y + 6,
      )
      //text
      dataSourcesContext.fillStyle = "rgba(255, 255, 255, 1.0)"
      dataSourcesContext.fillText(
        homeBase.name,
        homeBaseXY.x - 30 + dataCanvasLeft,
        homeBaseXY.y + 4,
      )
    }

    // //offset everything on the right side of the map to fly in/out from the other side for 'actual' shortest distance
    var offsetX = function(x, lon) {
      if (lon > homeBase.opp) {
        x -= mapBackOrigWidth * mapBackScale
      }

      return x
    }

    var winActive = true

    setTimeout(function() {
      var loc
      let plot = Math.floor(Math.random() * inlocs.length)
      iloc = outlocs[plot]
      oloc = inlocs[plot]
      if (iloc.la != 0 && iloc.lo != 0) {
        var trans, locXY
        locXY = latLonToXY(iloc.la, iloc.lo, mapScale)
        locXY.x = offsetX(locXY.x, iloc.lo)
        olocXY = latLonToXY(oloc.la, oloc.lo, mapScale)
        olocXY.x = offsetX(olocXY.x, oloc.lo)
        trans = new Transfer(
          locXY.x + dataCanvasLeft,
          locXY.y,
          olocXY.x + dataCanvasLeft,
          olocXY.y,
          colors["workUnitIn"],
          iloc.cc,
          false,
          false,
          mapBackOrigWidth * mapBackScale,
        )
        dataTransfers.push(trans)
      }
      // inCounts[countSec] += 1 //tally transfer
      setTimeout(arguments.callee, Math.round(100 / inlocs.length) * 1)
    }, Math.round(1000 / inlocs.length) * 1)

    /////////
    //animate
    /////////
    ;(function drawFrame() {
      window.requestAnimationFrame(drawFrame, dataCanvas)
      if (winActive == true) {
        //animate data transfers
        dataContext.clearRect(0, 0, dataCanvas.width, dataCanvas.height)
        var dataTransCount = dataTransfers.length
        var spliceThese = []
        for (i = 0; i < Math.round(Math.sqrt(dataTransCount)); i++) {
          if (dataTransfers[i].active == true) {
            dataTransfers[i].draw(dataContext)
          } else {
            spliceThese.push(i)
          }
        }

        //data transfer cleanup
        for (i = spliceThese.length - 1; i >= 0; i--) {
          dataTransfers[spliceThese[i]] = null
          dataTransfers.splice(spliceThese[i], 1)
        }
      }

      //plot homeBase
      plotHomeBase()
    })()
  })()
})
