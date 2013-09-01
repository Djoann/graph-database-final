
  
  
  
  
  
  
  
  
  function xlink(listId, source, target) {
        console.log("xlink function on");
        
        console.log("listid:",listId,"source:", source.id,"target:", target.id);
        // a partir de source et target, retrouve une x et x
  
        findNodeSource(listId,source);
        findNodeTarget(listId,target);
        
  
  //**********   REACTIVER
        links.push(link);
        
        function findNodeSource (listId,source) {
            for (var i in listId) {if (listId[i].id === source) return
  
                xlinksource = source.x;
                ylinksource = source.y;
                
                console.log("ListId source", source.id, "x",xlinksource, "y", ylinksource);
              
            };
        }
        
        function findNodeTarget (listId,target) {
            for (var i in listId) {if (listId[i].id === target) return
  
                xlinktarget = target.x;
                ylinktarget = target.y;
                
                console.log("ListId target", source.id, "x",xlinktarget, "y", ylinktarget);
              
            };
        }
    
    
    };