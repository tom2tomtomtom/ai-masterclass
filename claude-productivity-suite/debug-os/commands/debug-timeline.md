':
        return `${event.data.operation} ${event.data.key}`;
      default:
        return JSON.stringify(event.data).substring(0, 50);
    }
  }
  
  formatState(snapshot) {
    if (!snapshot) return 'No snapshot available';
    
    return `
Memory: ${(snapshot.memory.heapUsed / 1024 / 1024).toFixed(2)}MB
CPU: ${(snapshot.cpu.user / 1000).toFixed(2)}ms
Active Requests: ${snapshot.state.activeRequests}
Cache Size: ${snapshot.state.cacheSize}
Queue Depth: ${snapshot.state.queueDepth}
Connections: ${snapshot.state.connectionPool.active}/${snapshot.state.connectionPool.total}
    `.trim();
  }
  
  formatEventDetails(event) {
    return JSON.stringify(event, null, 2);
  }
}
```

### 2.2 Timeline Analysis
```javascript
class TimelineAnalyzer {
  constructor(timeline) {
    this.timeline = timeline;
  }
  
  findPatterns() {
    const patterns = {
      sequences: this.findSequences(),
      anomalies: this.findAnomalies(),
      bottlenecks: this.findBottlenecks(),
      cascades: this.findCascades()
    };
    
    return patterns;
  }
  
  findSequences() {
    // Look for repeated sequences of events
    const sequences = [];
    const windowSize = 5;
    
    for (let i = 0; i < this.timeline.events.length - windowSize; i++) {
      const window = this.timeline.events.slice(i, i + windowSize);
      const signature = window.map(e => `${e.type}:${e.data.operation || e.data.method}`).join(',');
      
      // Check if this sequence appears again
      for (let j = i + windowSize; j < this.timeline.events.length - windowSize; j++) {
        const compareWindow = this.timeline.events.slice(j, j + windowSize);
        const compareSignature = compareWindow.map(e => `${e.type}:${e.data.operation || e.data.method}`).join(',');
        
        if (signature === compareSignature) {
          sequences.push({
            pattern: signature,
            occurrences: [i, j],
            events: window
          });
        }
      }
    }
    
    return sequences;
  }
  
  findAnomalies() {
    const anomalies = [];
    
    // Calculate normal durations for each event type
    const durations = {};
    
    for (const event of this.timeline.events) {
      if (event.data.duration) {
        if (!durations[event.type]) {
          durations[event.type] = [];
        }
        durations[event.type].push(event.data.duration);
      }
    }
    
    // Calculate statistics
    const stats = {};
    for (const [type, values] of Object.entries(durations)) {
      const sorted = values.sort((a, b) => a - b);
      stats[type] = {
        median: sorted[Math.floor(sorted.length / 2)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        max: sorted[sorted.length - 1]
      };
    }
    
    // Find anomalous events
    for (const event of this.timeline.events) {
      if (event.data.duration && stats[event.type]) {
        const threshold = stats[event.type].p95 * 2;
        
        if (event.data.duration > threshold) {
          anomalies.push({
            event,
            expected: stats[event.type].median,
            actual: event.data.duration,
            severity: event.data.duration / stats[event.type].median
          });
        }
      }
    }
    
    return anomalies;
  }
  
  findBottlenecks() {
    // Find operations that block others
    const bottlenecks = [];
    
    for (let i = 0; i < this.timeline.events.length - 1; i++) {
      const event = this.timeline.events[i];
      const nextEvent = this.timeline.events[i + 1];
      
      // Large gap between events suggests blocking
      const gap = nextEvent.timestamp - (event.timestamp + (event.data.duration || 0));
      
      if (gap > 100) { // 100ms gap
        bottlenecks.push({
          blockingEvent: event,
          blockedEvent: nextEvent,
          delay: gap
        });
      }
    }
    
    return bottlenecks;
  }
  
  findCascades() {
    // Find error cascades
    const cascades = [];
    let currentCascade = null;
    
    for (const event of this.timeline.events) {
      if (event.data.error || event.data.success === false) {
        if (!currentCascade) {
          currentCascade = {
            start: event,
            events: [event],
            duration: 0
          };
        } else {
          currentCascade.events.push(event);
        }
      } else if (currentCascade) {
        // End of cascade
        currentCascade.duration = 
          currentCascade.events[currentCascade.events.length - 1].timestamp - 
          currentCascade.start.timestamp;
        
        if (currentCascade.events.length > 1) {
          cascades.push(currentCascade);
        }
        
        currentCascade = null;
      }
    }
    
    return cascades;
  }
}
```

## 3. Visual Timeline

### 3.1 Generate Timeline Visualization
```javascript
function generateTimelineVisualization(timeline) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Debug Timeline</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .timeline { width: 100%; height: 600px; overflow-x: auto; }
    .event { cursor: pointer; }
    .event:hover { opacity: 0.8; }
    .error { fill: #ff4444; }
    .success { fill: #44ff44; }
    .slow { fill: #ffaa44; }
    .tooltip { 
      position: absolute; 
      background: rgba(0,0,0,0.8); 
      color: white; 
      padding: 10px; 
      border-radius: 5px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>Debug Timeline</h1>
  <div id="timeline" class="timeline"></div>
  <div id="details"></div>
  
  <script>
    const data = ${JSON.stringify(timeline)};
    
    // Setup dimensions
    const margin = {top: 20, right: 20, bottom: 100, left: 70};
    const width = data.events.length * 10 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select("#timeline")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", \`translate(\${margin.left},\${margin.top})\`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, data.duration])
      .range([0, width]);
    
    const yScale = d3.scaleBand()
      .domain(['http', 'database', 'cache', 'custom', 'system'])
      .range([0, height])
      .padding(0.1);
    
    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(['success', 'error', 'slow'])
      .range(['#44ff44', '#ff4444', '#ffaa44']);
    
    // Draw events
    svg.selectAll(".event")
      .data(data.events)
      .enter()
      .append("rect")
      .attr("class", "event")
      .attr("x", d => xScale(d.relativeTime))
      .attr("y", d => yScale(d.type))
      .attr("width", d => Math.max(2, xScale(d.data.duration || 10)))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => {
        if (d.data.error) return colorScale('error');
        if (d.data.duration > 1000) return colorScale('slow');
        return colorScale('success');
      })
      .on("click", function(event, d) {
        showDetails(d);
      })
      .on("mouseover", function(event, d) {
        const tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
        
        tooltip.html(\`
          <strong>\${d.type}</strong><br>
          Time: \${new Date(d.timestamp).toLocaleTimeString()}<br>
          Duration: \${d.data.duration || 0}ms
        \`);
      })
      .on("mouseout", function() {
        d3.select(".tooltip").remove();
      });
    
    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => (d / 1000).toFixed(1) + 's');
    
    svg.append("g")
      .attr("transform", \`translate(0,\${height})\`)
      .call(xAxis);
    
    svg.append("g")
      .call(d3.axisLeft(yScale));
    
    // Details panel
    function showDetails(event) {
      document.getElementById('details').innerHTML = \`
        <h3>Event Details</h3>
        <pre>\${JSON.stringify(event, null, 2)}</pre>
      \`;
    }
  </script>
</body>
</html>`;
  
  fs.writeFileSync('timeline-visualization.html', html);
  console.log('📊 Timeline visualization created: timeline-visualization.html');
}
```

## 4. Replay Timeline

### 4.1 Timeline Replay Engine
```javascript
class TimelineReplayer {
  constructor(timeline) {
    this.timeline = timeline;
    this.replayState = {
      position: 0,
      speed: 1,
      paused: false,
      breakpoints: []
    };
  }
  
  async replay(options = {}) {
    const {
      startAt = 0,
      endAt = this.timeline.events.length - 1,
      speed = 1,
      onEvent = () => {},
      onError = () => {},
      beforeEvent = () => true
    } = options;
    
    console.log('🔄 Starting timeline replay...');
    
    for (let i = startAt; i <= endAt && !this.replayState.paused; i++) {
      const event = this.timeline.events[i];
      this.replayState.position = i;
      
      // Check breakpoints
      if (this.replayState.breakpoints.includes(i)) {
        console.log(`⏸️  Breakpoint hit at event ${i}`);
        this.pause();
        await this.waitForResume();
      }
      
      // Before event hook
      const shouldContinue = await beforeEvent(event, i);
      if (!shouldContinue) {
        console.log(`⏭️  Skipping event ${i}`);
        continue;
      }
      
      // Calculate delay
      if (i > startAt) {
        const prevEvent = this.timeline.events[i - 1];
        const delay = (event.timestamp - prevEvent.timestamp) / speed;
        
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, Math.min(delay, 1000)));
        }
      }
      
      // Replay event
      try {
        await this.replayEvent(event);
        await onEvent(event, i);
      } catch (error) {
        console.error(`❌ Error replaying event ${i}:`, error);
        await onError(error, event, i);
        
        if (options.stopOnError) {
          break;
        }
      }
    }
    
    console.log('✅ Timeline replay complete');
  }
  
  async replayEvent(event) {
    console.log(`▶️  [${new Date(event.timestamp).toISOString()}] ${event.type}: ${this.getEventDescription(event)}`);
    
    switch (event.type) {
      case 'http':
        // Replay HTTP request
        if (event.data.method && event.data.path) {
          // Mock the request instead of actually making it
          console.log(`   ${event.data.method} ${event.data.path} → ${event.data.statusCode}`);
        }
        break;
        
      case 'database':
        // Log database operation
        console.log(`   Query: ${event.data.sql?.substring(0, 50)}...`);
        break;
        
      case 'cache':
        // Log cache operation
        console.log(`   ${event.data.operation} ${event.data.key}`);
        break;
        
      case 'error':
        // Replay error
        throw new Error(event.data.message);
        
      default:
        // Custom event
        console.log(`   Custom: ${JSON.stringify(event.data)}`);
    }
  }
  
  getEventDescription(event) {
    if (event.data.error) {
      return `ERROR: ${event.data.error}`;
    }
    
    switch (event.type) {
      case 'http':
        return `${event.data.method} ${event.data.path}`;
      case 'database':
        return event.data.sql?.substring(0, 50) + '...';
      case 'cache':
        return `${event.data.operation} ${event.data.key}`;
      default:
        return JSON.stringify(event.data).substring(0, 50);
    }
  }
  
  setBreakpoint(eventIndex) {
    this.replayState.breakpoints.push(eventIndex);
  }
  
  pause() {
    this.replayState.paused = true;
  }
  
  resume() {
    this.replayState.paused = false;
    this.resumePromise?.resolve();
  }
  
  waitForResume() {
    return new Promise(resolve => {
      this.resumePromise = { resolve };
    });
  }
}
```

## 5. Debug Report

### 5.1 Timeline Analysis Report
```markdown
# Timeline Debug Report

## Overview
- **Total Events**: 1,234
- **Duration**: 45.2 seconds
- **Error Events**: 23
- **Slow Operations**: 15

## Event Distribution
| Type | Count | Avg Duration | Errors |
|------|-------|--------------|--------|
| HTTP | 456 | 125ms | 12 |
| Database | 234 | 45ms | 8 |
| Cache | 544 | 2ms | 3 |

## Critical Path Analysis

### Sequence Leading to Error
```
10:30:45.123 [HTTP] POST /api/users/login → 200 (125ms)
10:30:45.250 [Cache] GET user:123 → MISS (2ms)
10:30:45.252 [Database] SELECT * FROM users WHERE id = 123 → 1 row (45ms)
10:30:45.297 [Cache] SET user:123 → OK (1ms)
10:30:45.298 [HTTP] GET /api/dashboard → 200 (89ms)
10:30:45.387 [Cache] EXPIRE user:123 → OK (1ms)  ⚠️ Suspicious
10:30:45.388 [HTTP] GET /api/profile → 500 (5ms) ❌ ERROR
```

### Root Cause
Cache key expired immediately after being set, causing null reference error.

## Patterns Detected

### 1. Cache Stampede Pattern
- **Occurrences**: 3
- **Pattern**: Multiple requests for same expired cache key
- **Impact**: Database overload

### 2. Retry Storm
- **Occurrences**: 5  
- **Pattern**: Failed requests retried too quickly
- **Impact**: Cascading failures

## Performance Analysis

### Bottlenecks Identified
1. **Database Query**: `SELECT * FROM orders WHERE user_id = ?`
   - Average: 450ms (10x normal)
   - Cause: Missing index on user_id

2. **External API Call**: `POST /payment/process`
   - Average: 2500ms
   - Cause: Third-party service degradation

## Recommendations

1. **Immediate Actions**
   - Fix cache TTL configuration
   - Add missing database index
   - Implement circuit breaker for external API

2. **Preventive Measures**
   - Add cache stampede protection
   - Implement exponential backoff for retries
   - Add timeline collection to monitoring

## Replay Instructions

To replay this timeline:
```bash
node replay-timeline.js --file timeline-capture.json --speed 2
```

Set breakpoints at critical events:
- Event 234: Before cache expiry
- Event 245: Before error occurs
```

Save timeline for future analysis.