// Metadata helper functions

function getMetaData(name){
  var meta = {
    "mauricio_giraldo": {
      fullName: "Mauricio Giraldo",
      talkTitle: "NYPL Labs Building Inspector: Extracting Data from Historic Maps",
      videoId: "Oph1o3IZEFU",
      "abstract": "This demo site uses one of the presentations from OpenVisConf 2014 as an example. Here is where the talk abstract would go."
    }
  };
  return meta[name];
}

function getFullname(name){
    var meta = getMetaData(name);
    if(meta){
      return meta["fullName"];
    } else{
      return name;
    }
  }


function getTalkTitle(name){
  var meta = getMetaData(name);
  if(meta){
    return meta["talkTitle"];
  } else{
    return name;
  }
}

function getVideoId(name){
  var meta = getMetaData(name);
  if(meta){
    return meta["videoId"];
  }
}

function getAbstract(name){
  var meta = getMetaData(name);
  if(meta){
    return meta["abstract"];
  }
}

// Returns relative urls to tile images
function getImagePath(name, frameNumber){
  return "/data/" + name + "/images/eigth/" + name + "-" + frameNumber + ".png";
}


function getData(url, callback) {
  d3.json(url, function(data){
    // Pre-process data here.
    callback(data);
  });
}

//
// Main Rendering
//

function renderTiles(data){


  var smallTileWidth = "8px";
  var smallTileHeight = "55px";
  var largeTileWidth = "140px";
  var largeTileHeight = "100px";

  var dispatch = d3.dispatch("expand", "contract",
    "showImage", "hideImage", "loadImage");

  var container = d3.select("#container");

  // Add Row

  var speaker = container.selectAll(".speaker")
    .data(data);

  speaker.enter().append("div")
      .attr("class", "speaker");

  // Add 1st Col (Talk Info and controls)

  var infoArea = speaker.append("div")
      .attr("class", "speaker-info");

  var toggleFrame = function(d, i){
    var isMobile = d3.select("#state-indicator").style("z-index") == "2";
    if(isMobile){
      playVideo(d);
    } else {
      toggle(d["name"]);
    }
  };

  infoArea.append("h2")
    .attr("class", "speaker_name")
    .html(function(d,i) {
      return getFullname(d["name"]);
    })
    .on("click", toggleFrame);

  infoArea.append("i")
    .attr("class", "fa fa-plus")
    .attr("data-name", function(d){ return d["name"];} )
    .on("click", toggleFrame);

  infoArea.append("i")
    .attr("class", "fa fa-youtube-play")
    .attr("data-name", function(d){ return d["name"];} )
    .on("click", function(d, i){
      playVideo(d, true);
    });

  infoArea
    .append("h2")
    .attr("class", "talk_name")
    .html(function(d,i) {
      return getTalkTitle(d["name"]);
    })
    .on("click", toggleFrame);

   infoArea
    .append("span")
    .attr("class", "abstract")
    .html(function(d,i) {
      return getAbstract(d["name"]);
    });


  // Add 2nd Col (Frame tiles)

  var tileArea = speaker.append("div")
      .attr("class", "tile-area");

  var tiles = tileArea.selectAll(".tile")
    .data(function(d,i) {
      //Attach data from the parent onto each child object
      //to make fetching the name easier;
      var frames = d.frames;
      _.each(frames, function(f){
        f["name"] = d["name"];
      });
      return frames;
    });

  // Create the tile div
  tiles.enter().append("div")
    .attr("class", function(d, i) { return "tile " + d["name"]; })
    .on("click", function(d, i){
      expand(d["name"], this);
    })
    .on("mouseover", function(d, i){
      var el = d3.select(this);
      if(_expanded[d["name"]] !== true){
        el
        .transition()
        .duration(150)
        .style("background-size", "100% 200%")
        .style("background-position", "0 90%")
        .style("width", "18px")
        .style("height", smallTileHeight);
      }
    })
    .on("mouseout", function(d, i){
      var el = d3.select(this);
      if(_expanded[d["name"]] !== true){
        el
          .transition()
          .duration(150)
          .style("background-size", "100% 100%")
          .style("background-position", "0 0%")
          .style("width", smallTileWidth)
          .style("height", smallTileHeight);
      }
    });

  //Style the tile
  var linearGradientTemplate = _.template("linear-gradient(<%= direction %>, <%= from %> <%= stop%>%, <%= to %>)");
  tiles
    .style("width", smallTileWidth)
    .style("height", smallTileHeight)
    .style("margin-right", "1px")
    .style("background-color", function(d, i){
      //Set this for browsers that do not support the gradient we
      //set below
      var byHsl = _.sortBy(d.dominant_cols, function(datum){
        var rgbArr = datum.col;
        var rgbCol = d3.rgb(rgbArr[0], rgbArr[1], rgbArr[2]);
        var hsl = rgbCol.hsl();
        return hsl.s;
      }).reverse();
      var c = byHsl[0].col;
      return d3.rgb(c[0], c[1], c[2]);
    })
    .style("background-image", function(d, i){
      var byHsl = _.sortBy(d.dominant_cols, function(datum){
        var rgbArr = datum.col;
        var rgbCol = d3.rgb(rgbArr[0], rgbArr[1], rgbArr[2]);
        var hsl = rgbCol.hsl();
        return hsl.s;
      }).reverse();

      var c1 = byHsl[0].col;
      var c2 = byHsl[1].col;

      var gradient = linearGradientTemplate({
        direction: "to bottom",
        from: d3.rgb(c1[0], c1[1], c1[2]),
        to: d3.rgb(c2[0], c2[1], c2[2]),
        stop: (Math.random() * 5) + 50
      });
      return gradient;
    });


  //
  // Tile events
  //


  //Trigger the expanded view of a set of tiles
  dispatch.on("expand", function(name, element){
    speakerTiles = container.selectAll(".tile." + name);
    speakerTiles.transition()
      .style("width", largeTileWidth)
      .style("height", largeTileHeight)
      .each("end", function(d,i){
        //Once we are done expanding, scroll the tile into view
        if(!_.isUndefined(element)){
          if(this === element){
            var target = element.getBoundingClientRect().top - 100;
            $('html,body').animate({scrollTop: target}, 600);
          }

          //Once scrolled into view add a little bounce effect
          //to  highlight it.
          var img = d3.select(element).select("img");
          img.transition()
            .ease("linear")
            .delay(620)
            .duration(400)
            .style("border-width", "20px")
            .each("end", function(){
              img.transition()
                .ease("bounce")
                .duration(500)
                .style("border-width", "0px");
            });
        }
      });

    //Decolor the little plus sign for expanding/contracting
    d3.select(speakerTiles[0][0].parentNode.parentNode).selectAll("i.fa.fa-plus")
      .classed("fa-minus", true)
      .classed("fa-plus", false)
      .transition()
      .style("color", "#bbb");

    //Show the abstract
    d3.select(speakerTiles[0][0].parentNode.parentNode).selectAll("span.abstract")
      .style("display", "block");


  });

  //Trigger the non-expanded view of a set of tiles
  dispatch.on("contract", function(name){
    speakerTiles = container.selectAll(".tile." + name);
    speakerTiles.transition()
      .style("width", smallTileWidth)
      .style("height", smallTileHeight);

    //Recolor the little plus sign for expanding/contracting
    d3.select(speakerTiles[0][0].parentNode.parentNode).selectAll("i.fa.fa-minus")
      .classed("fa-plus", true)
      .classed("fa-minus", false)
      .transition()
      .style("color", "#ff4b5c");

    //Hide the abstract
    d3.select(speakerTiles[0][0].parentNode.parentNode).selectAll("span.abstract")
      .style("display", "none");
  });

  //Trigger the loading of images of a set of tiles
  var _loadMap = {};
  dispatch.on("loadImage", function(name){
    if(_loadMap[name]){
      return;
    }
    speakerTiles = container.selectAll(".tile." + name);

    speakerTiles.append("img")
      .attr("src", function(d, i){
        return getImagePath(d["name"], d.frame_number);
      })
      .attr("class", "tile-thumb")
      .style("display", "none")
      .style("opacity", 0)
      .style("width", largeTileWidth)
      .style("height", largeTileHeight)
      .style("border-width", "0px")
      .style("border-color", "#ffffff")
      .style("border-style", "solid")
      .on("click", function(d,i){
        playVideo(d);
      })
      .attr("onload", function(d,i){
        d3.select(this).classed("loaded", true);
      });
      _loadMap[name] = true;
  });

  //Trigger the display of images of a set of tiles
  dispatch.on("showImage", function(name){
    speakerTiles = container.selectAll(".tile." + name);
    speakerTileImages = container.selectAll(".tile." + name + " img.loaded");

    speakerTileImages.style('display', "inherit");
    speakerTileImages.transition()
      .delay(200)
      .duration(600)
      .style("opacity", 1);

    if(speakerTiles.size() !== speakerTileImages.size()){
      // Not all the images were loaded. Schedule another showImage call
      console.log("not yet loaded, will try again in 500ms");
      setTimeout(function(){
        dispatch.showImage(name);
      }, 1000);
    }
  });

  // Trigger the hiding of images of a set of tiles
  dispatch.on("hideImage", function(name){
    speakerTileImages = container.selectAll(".tile." + name + " img");
    speakerTileImages.transition()
      .duration(200)
      .style("opacity", 0)
      .each("end", function(d,i){
        d3.select(this).style("display", "none");
      });
  });

  // Some helper functions to expand and contract tiles
  // under various conditions.

  var _expanded = {};
  function toggle(name){
    if(_.isUndefined(name)){
      name = getOrder();
    } else {
      if(!_.isArray(name)){
        name = [name];
      }
    }

    _.each(name, function(n){
      if(_expanded[name]){
        contract(name);
      } else {
        expand(name);
      }

    });
  }

  function expand(name, element){
    if(_.isUndefined(name)){
      name = getOrder();
    } else {
      if(!_.isArray(name)){
        name = [name];
      }
    }

    _.each(name, function(n){
      _expanded[name] = true;
      dispatch.loadImage(n);
      dispatch.expand(n, element);
      dispatch.showImage(n);
    });
  }

  function contract(name){
    if(_.isUndefined(name)){
      name = getOrder();
    } else {
      if(!_.isArray(name)){
        name = [name];
      }
    }

    _.each(name, function(n){
      _expanded[name] = false;
      dispatch.hideImage(n);
      dispatch.contract(n);
    });
  }

  // Controls

  d3.select("#expand_all")
    .on("click", function(){
      expand();
      d3.event.preventDefault();
    });

  d3.select("#contract_all")
    .on("click", function(){
      contract();
      d3.event.preventDefault();
    });


  d3.select("#close_yt")
    .on("click", hidePlayArea);

}

// YouTube Area Controls

// The play area is the larger (usually hidden) footer that contains the
// youtube embed
function showPlayArea(){
  d3.select(".video-container")
    .transition()
    .style("height", "480px")
    .each("end", function(){
      d3.select("#close_yt")
        .transition()
        .duration(100)
        .style("opacity", 1);
    });
}

function hidePlayArea(){
  d3.event.preventDefault();
  if(!_.isUndefined(player)){
    player.pauseVideo();
  }

  d3.select(".video-container")
    .transition()
    .style("height", "30px")
    .each("end", function(){
      d3.select("#close_yt")
        .transition()
        .duration(100)
        .style("opacity", 0);
    });
}

var player;
//When youtube api has loaded this will
//create a player in the div specified.
function onYouTubePlayerAPIReady() {
  player = new YT.Player('ytplayer', {
    height: '390',
    width: '640',
  });
}

function playVideo(d, fromStart){
  d3.event.preventDefault();
  var isMobile = d3.select("#state-indicator").style("z-index") == "2";
  var url;
  if(isMobile){
    var id = getVideoId(d["name"]);
    if(id){
      url = "http://m.youtube.com/watch?v=" + id;
      window.open(url, '_blank');
    }
  } else if(!_.isUndefined(player)){
    var startTime;
    if(fromStart){
      startTime = 0;
    } else{
      startTime = d.frame_number;
    }
    var videoId = getVideoId(d["name"]);

    // Check if current video is the requested one. If so seek else load
    url = player.getVideoUrl();

    if(url.match(videoId)){
      player.seekTo(startTime, true);
    } else {
      player.loadVideoById({
        'videoId': videoId,
        'startSeconds': startTime,
        'suggestedQuality': 'small'
      });
    }

    showPlayArea();
  }
}


// Start

window.addEventListener("load", function() {
  var dataFile = "data/metadata.json";
  getData(dataFile, renderTiles);
});