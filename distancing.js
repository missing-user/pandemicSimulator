importScripts('quadtree.js');

var myTree

function distance(actors) {
  myTree.clear();
  //update myObjects and insert them into the tree again

  for (var actor of actors) {
    myTree.insert(actor)
  }


  if (distancingStrength > 0)
    for (var actor of actors) {
      var candidates = myTree.retrieve(actor);
      for (var cand of candidates) {
        /*if (Math.abs(actor.x - cand.x) < distancingRadius)
          if (Math.abs(actor.y - cand.y) < distancingRadius)*/
        dist = Math.sqrt((cand.x - actor.x) * (cand.x - actor.x) + (cand.y - actor.y) * (cand.y - actor.y))
        if (dist < distancingRadius) {
          dist = Math.max(dist, 0.001)
          actor.vx += (actor.x - cand.x) * distancingStrength / dist
          actor.vy += (actor.y - cand.y) * distancingStrength / dist
        }
      }
      actor.vx = Math.max(Math.min(actor.vx, 0.5), -0.5)
      actor.vy = Math.max(Math.min(actor.vy, 0.5), -0.5)
    }
}

onmessage = function(e) {
  console.log('Message received from main script', e);
  myTree = new Quadtree(e.data.bounds)
  distance(e.data.actors)
  postMessage(e.data.actors);
}
