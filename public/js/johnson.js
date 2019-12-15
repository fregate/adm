// https://gist.github.com/m-mujica/1d1f25579a49bee300813aa1dc76da2a

function JGraph(nnn, aaa) {
    if(nnn == undefined || nnn.lenght == 0)
        this.nodes = [];
    else
        this.nodes = nnn;
    if (aaa == undefined || aaa.size == 0)
        this.arrows = new Map();
    else
        this.arrows = aaa;
  }
  
  // Tarjan's strongly connected components algorithm
  JGraph.prototype.stronglyConnectedComponents = function tarjan() {
    var index = 0;
    var stack = [];
    var result = [];
    var meta = new Map();
  
    var graph = this;
  
    var connect = function connect(node) {
      var entry = {
        onStack: true,
        index: index,
        lowLink: index
      };
  
      meta.set(node, entry);
      stack.push(node);
      index += 1;
  
      graph.arrows.get(node).forEach(function(adj) {
        if (!meta.has(adj)) {
          // adjacent node has not yet been visited, do it
          connect(adj);
          entry.lowLink = Math.min(entry.lowLink, meta.get(adj).lowLink);
        } else if (meta.get(adj).onStack) {
          entry.lowLink = Math.min(entry.lowLink, meta.get(adj).index);
        }
      });
  
      // check if node is a root node, pop the stack and generated an SCC
      if (entry.lowLink === entry.index) {
        var scc = [];
        var adj = null;
  
        do {
          adj = stack.pop();
          meta.get(adj).onStack = false;
          scc.push(adj);
        } while (node !== adj);
  
        result.push(scc);
      }
    };
  
    graph.nodes.forEach(function(node) {
      if (!meta.has(node)) {
        connect(node);
      }
    });
  
    return result;
  };
  
  // Based on Donald B. Johnson 1975 paper
  // Finding all the elementary circuits of a directed graph
  JGraph.prototype.findCircuits = function findCircuits(F) {
    var startNode;
    var stack = [];
    var circuits = [];
    var blocked = new Map();
  
    // book keeping to prevent Tarjan's algorithm fruitless searches
    var b = new Map();
  
    var graph = this;

    function addCircuit(start, stack) {
      var orders = [start.order].concat(
        stack.map(function(n) {
          return n.order;
        })
      );
  
      // prevent duplicated cycles
      // TODO: figure out why this is needed, this is most likely related to
      // startNode being the "least" vertex in Vk
      if (Math.min.apply(null, orders) !== start.order) {
          var c = [].concat(stack).concat(start);
          if (F == undefined || F(c))
            circuits.push(c);
      }
    }
  
    function unblock(u) {
      blocked.set(u, false);
  
      if (b.has(u)) {
        b.get(u).forEach(function(w) {
          b.get(u).delete(w);
          if (blocked.get(w)) {
            unblock(w);
          }
        });
      }
    }
  
    function circuit(node) {
      var found = false;
  
      stack.push(node);
      blocked.set(node, true);
  
      graph.arrows.get(node).forEach(function(w) {
        if (w === startNode) {
          found = true;
          addCircuit(startNode, stack);
        } else if (!blocked.get(w)) {
          if (circuit(w)) {
            found = true;
          }
        }
      });
  
      if (found) {
        unblock(node);
      } else {
        graph.arrows.get(node).forEach(function(w) {
          var entry = b.get(w);
  
          if (!entry) {
            entry = new Set();
            b.set(w, entry);
          }
  
          entry.add(node);
        });
      }
  
      stack.pop();
      return found;
    }
  
    graph.nodes.forEach(function(node) {
      startNode = node;
      graph.arrows.get(node).forEach(circuit);
    });
  
    return circuits;
  };
