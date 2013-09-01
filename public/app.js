console.log("App js loaded");

// set up SVG for D3
var width  = 700,
    height = 500,
    colors = d3.scale.category10();

var svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.




var nodes = [],
lastNodeId = 2,
links = [], 
listLink = [],
listId = [];


$.ajax({
  url: '/graphdb?dirty=true',
  async: false,
  dataType: 'json',
  success: function (json) {
    mydata = json;
    console.log("json callback : ", json);
    for (var i = 0; i <json.length; i++) {
        if (mydata[i].node.name != undefined) {
            
            var name = mydata[i].node.name;
            var textNode = mydata[i].node.text;
            simplenode = {id: name, reflexive: false, text: textNode };
            //node.x = Math.floor(Math.random()*200);
            //node.y = Math.floor(Math.random()*200);
            nodes.push(simplenode);
            listId.push(simplenode);
            //console.log(node.id, "added");            
        }
        
        //if link
        if (mydata[i].node.source != undefined) {
            var source = mydata[i].node.source;
            var target = mydata[i].node.target;
            
            var dblink = {source: source, target: target, left: false, right: false};
            //console.log("db link :", dblink);
            //console.log("nodes to analyse:", nodes);
            
            //à à faire : xlink ici?
            listLink.push(dblink);
            
            //links.push(link);
        }
    }
  }
});


    
// ********** IMPORTANT : Bootstrapping new database
//var nodes = [
//    {id: 0, reflexive: false},
//    {id: 1, reflexive: true },
//    {id: 2, reflexive: false}
//  ],
//  lastNodeId = 2,
//  links = [
//    {source: nodes[0], target: nodes[1], left: false, right: true },
//    {source: nodes[1], target: nodes[2], left: false, right: true }
//  ];
//
//console.log(nodes);

















// init D3 force layout
var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(150)
    .charge(-500)
    .on('tick', tick)

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');
//console.log("hello problem", d);

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 4)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');

// line displayed when dragging new nodes
var drag_line = svg.append('svg:path')
  .attr('class', 'link dragline hidden')
  .attr('d', 'M0,0L0,0');

// handles to link and node element groups
var path = svg.append('svg:g').selectAll('path'),
    circle = svg.append('svg:g').selectAll('g');
    
//only charging at the start i think console.log("hello path : ", path, " and circle : ", circle);

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;
    

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}

// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers


//*******************  PROBLEM parsing links


  path.attr('d', function(d) {
      
      

    var deltaX = parseFloat(d.target.x) - parseFloat(d.source.x),
        deltaY = parseFloat(d.target.y) - parseFloat(d.source.y),
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = d.left ? 17 : 12,
        targetPadding = d.right ? 17 : 12,
        sourceX = parseFloat(d.source.x) + (sourcePadding * normX),
        sourceY = parseFloat(d.source.y) + (sourcePadding * normY),
        targetX = parseFloat(d.target.x) - (targetPadding * normX),
        targetY = parseFloat(d.target.y) - (targetPadding * normY);
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
    
  });
}

// update graph (called when needed)
function restart() {
  // path (link) group
  path = path.data(links);
  //console.log("show new path list at each graph interactions : ", path);
  // after have that ==> catch new path list in the database


  // update existing links
  path.classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


  // add new links
  path.enter().append('svg:path')
    .attr('class', 'link')
    .classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;

      // select link
      mousedown_link = d;
      console.log("d = ", d);
      if(mousedown_link === selected_link) selected_link = null;
      //console.log(mousedown_link,selected_link);
      else selected_link = mousedown_link;
      selected_node = null;
      
      restart();
    });

  // remove old links
  path.exit().remove();


  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) { return d.id; });

  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
    .classed('reflexive', function(d) { return d.reflexive; });

  // add new nodes
  var g = circle.enter().append('svg:g');
  
  
  //console log all nodes and movements presents in the graph
  //console.log("listening : ",g);

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', 12)
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
    .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
    .classed('reflexive', function(d) { return d.reflexive; })
    .on('mouseover', function(d) {
      if(!mousedown_node || d === mousedown_node) return;
      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.1)');
    })
    .on('mouseout', function(d) {
      if(!mousedown_node || d === mousedown_node) return;
      // unenlarge target node
      d3.select(this).attr('transform', '');
    })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;

      // select node
      mousedown_node = d;
      
      //console.log clicked node object :
      console.log(d);
      
      if(mousedown_node === selected_node) selected_node = null;
      else selected_node = mousedown_node;
      selected_link = null;

      // reposition drag line
      drag_line
        .style('marker-end', 'url(#end-arrow)')
        .classed('hidden', false)
        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

      restart();
    })
    
    
    
    
    //CREATE NEW ADD LINK
       .on('mouseup', function(d) {
          if(!mousedown_node) return;
    
          // needed by FF
          drag_line
            .classed('hidden', true)
            .style('marker-end', '');
    
          // check for drag-to-self
          mouseup_node = d;
          if(mouseup_node === mousedown_node) { resetMouseVars(); return; }
    
          // unenlarge target node
          d3.select(this).attr('transform', '');
    
          // add link to graph (update if exists)
          // NB: links are strictly source < target; arrows separately specified by booleans
          var source, target, direction;
          if(mousedown_node.id < mouseup_node.id) {
            source = mousedown_node;
            target = mouseup_node;
            direction = 'right';
          } else {
            source = mouseup_node;
            target = mousedown_node;
            direction = 'left';
          }
    
          var link;
          link = links.filter(function(l) {
            return (l.source === source && l.target === target);
          })[0];
    
          if(link) {
            link[direction] = true;
          } else {
            link = {source: source, target: target, left: false, right: false};
            link[direction] = true;
            links.push(link);
            //console.log("linnnnnk :", link);
            
            //INSERT LINK DATABASE
                    var sourceid = source.id;
                    var targetid = target.id;
                    var json = { source: sourceid, target: targetid, left: false, right: false};
                    
                    $.post("/graphdb", json, function (c) {
                        alert("Saved" + JSON.stringify(c));
                        console.log(JSON.stringify(c));
                    });
          }
    
          // select new link
          selected_link = link;
          selected_node = null;
          restart();
        });
    














  // show node IDs
  g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .text(function(d) { return d.id; });

  // remove old nodes
  circle.exit().remove();

  // set the graph in motion
  force.start();
  

//************************** demain ***************************************
  //create function xlinks for database links (inspired by xlink()
  
  // source and target are inversed
  
  
  
}













  




  
  
  
  
  



function SetDbLinks() {
    

            console.log("list listLink:",listLink);
            console.log("list listId :",listId);
            console.log("working links :", links);
            console.log("working nodes :", nodes);
          
  
              
          for (var i = 0; i <1; i++) {
                
                //console.log("listLink[i]:",listLink[i]);
                
                var source2 = listLink[0].source;
                var target2 = listLink[0].target;
                
                var lastsource;
                var lastarget;
                
                console.log("listLink source:",source2,"listLink target:", target2 );
                
                
                //xylink : attribution des coordonnées (source/target) à partir des id du node
                xySource(linkfinal, source2,listId);
                xyTarget(linkfinal, target2,listId);
                
                
                
                //serialize link to push in links array
                //console.log("lastsource:",lastsource, "lastarget:", lastarget);
                 
                var linkfinal = {source: lastsource, target: lastarget, left: false, right: false};
                
                console.log("final link:", linkfinal);
                //console.log("liiiiiiiinkk :", link);
                
                links.push(linkfinal);
                restart();
          }
          
          
          
          
          
          function xySource (linkfinal, source2,listId) {
                
                for (var i = 0; i <2; i++) {
                
                    if (listId[i].id === source2) {
                    
                        var xlinksource = listId[i].x;
                        var ylinksource = listId[i].y;
                        
                        console.log("print source:", xlinksource, ylinksource);
                    } 
                    
                    
                    lastsource = {id: source2, x: xlinksource, y: ylinksource, reflexive: false, weight: 1};
                    
                    //linkfinal.source = lastsource;
                    
                } // end for
                //console.log("lastsource:", lastsource);
                
                return lastsource
            };
            
            function xyTarget (linkfinal, target2, listId) {
              
              for (var i = 0; i <2; i++) {
              
                  if (listId[i].id === target2) {
                  
                      var xlinktarget = listId[i].x;
                      var ylinktarget = listId[i].y;
                      console.log("print target:", xlinktarget, ylinktarget);  

                  } 
              }// end for
                          
                
                lastarget = {id: target2, x: xlinktarget, y: ylinktarget, reflexive: false, weight: 1};
                
                
            }
            
        
                      
                      
            
          
      
      
      
      
        
      
      

      
    

    
      
      //xyLink (source, target,listId);
      
          
       // end xyLink function
    
      //console.log("new links :", links);  
      
      
      function findNodeSource (listId,source) {
          for (var i in listId) {if (listId[i].id === source) return
              console.log("source:",source);
              console.log("listid i : ",listId[i].id);
          };
      }
      
      function findNodeTarget (listId,target) {
          for (var i in listId) {if (listId[i].id === target) return
              xlinktarget = target.x;
              ylinktarget = target.y;
              
              console.log("ListId target", source.id, "x",xlinktarget, "y", ylinktarget);
            
          };
      }
    
    
    restart();
}

















function mousedown() {
  // prevent I-bar on drag
  //d3.event.preventDefault();
  
  // because :active only works in WebKit?
  svg.classed('active', true);

  if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;
  
  
  
  //**********************  INSERT DATABASE HERE  *********************//
  // insert new node at point
  var point = d3.mouse(this),
      // old id : id: ++lastNodeId
      //query = $(".addquery").val();
      query = prompt("Node name : ");
      if (query.length == 0) {
          query ="random" + Math.floor(Math.random()*200);
      } else {
      } // end if
      
      var textNode = prompt("Node text : ");
      if (textNode.length == 0) {
          textNode ="randomtext" + Math.floor(Math.random()*20000);
      } else {
      } // end if
//***************** DJOANN MODIFICATION 
      //send node id to database
      
//***************** DJOANN MODIFICATION 
 
      node = {id: query, reflexive: false};
  node.px = point[0];
  node.py = point[1];
  node.text = textNode;
  nodes.push(node);
  
  var json = { "name" : query, "text" : textNode };
  
  $.post("/graphdb", json, function (c) {
      alert("Saved" + JSON.stringify(c));
      console.log(JSON.stringify(c));
      //savegarder
  });
  
  console.log("hello new node : ", node);

  restart();
}

function mousemove() {
  if(!mousedown_node) return;

  // update drag line
  drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

  restart();
}

function mouseup() {
  if(mousedown_node) {
    // hide drag line
    drag_line
      .classed('hidden', true)
      .style('marker-end', '');
  }

  // because :active only works in WebKit?
  svg.classed('active', false);

  // clear mouse event vars
  resetMouseVars();
}

function spliceLinksForNode(node) {
  var toSplice = links.filter(function(l) {
    return (l.source === node || l.target === node);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
}

// only respond once per keydown
var lastKeyDown = -1;

function keydown() {
  d3.event.preventDefault();

  if(lastKeyDown !== -1) return;
  lastKeyDown = d3.event.keyCode;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle.call(force.drag);
    svg.classed('ctrl', true);
  }

  if(!selected_node && !selected_link) return;
  switch(d3.event.keyCode) {
    case 8: // backspace
    case 46: // delete
      if(selected_node) {
        nodes.splice(nodes.indexOf(selected_node), 1);
        spliceLinksForNode(selected_node);
      } else if(selected_link) {
        links.splice(links.indexOf(selected_link), 1);
      }
      selected_link = null;
      selected_node = null;
      restart();
      break;
    case 66: // B
      if(selected_link) {
        // set link direction to both left and right
        selected_link.left = true;
        selected_link.right = true;
      }
      restart();
      break;
    case 76: // L
      if(selected_link) {
        // set link direction to left only
        selected_link.left = true;
        selected_link.right = false;
      }
      restart();
      break;
    case 82: // R
      if(selected_node) {
        // toggle node reflexivity
        selected_node.reflexive = !selected_node.reflexive;
      } else if(selected_link) {
        // set link direction to right only
        selected_link.left = false;
        selected_link.right = true;
      }
      restart();
      break;
  }
}

function keyup() {
  lastKeyDown = -1;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle
      .on('mousedown.drag', null)
      .on('touchstart.drag', null);
    svg.classed('ctrl', false);
  }
}

// app starts here
svg.on('mousedown', mousedown)
  .on('mousemove', mousemove)
  .on('mouseup', mouseup);
d3.select(window)
  .on('keydown', keydown)
  .on('keyup', keyup);
restart();
