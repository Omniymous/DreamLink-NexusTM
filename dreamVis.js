export class DreamVisualizer {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;
    this.draggingNode = null;
    this.canvas = null;
    this.ctx = null;
    this.isDragging = false;
    this.mouseOffset = { x: 0, y: 0 };
    
    this.setupElements();
    this.setupEventListeners();
    this.loadDreamData();
  }

  setupElements() {
    this.visContainer = document.querySelector('.dream-visualizer');
    this.canvas = document.getElementById('dreamCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());
    
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
    
    // Listen for new dream entries
    document.addEventListener('dreamAdded', () => this.loadDreamData());
  }

  resizeCanvas() {
    this.canvas.width = this.visContainer.clientWidth;
    this.canvas.height = 500;
    this.render();
  }

  loadDreamData() {
    // Get dreams from journal
    const dreams = JSON.parse(localStorage.getItem('dreamJournal')) || [];
    const dreamLinks = JSON.parse(localStorage.getItem('dreamLinks')) || [];
    
    // Create nodes for each dream
    this.nodes = dreams.map(dream => ({
      id: dream.id,
      x: Math.random() * (this.canvas.width - 100) + 50,
      y: Math.random() * (this.canvas.height - 100) + 50,
      radius: 30,
      title: dream.title,
      date: new Date(dream.date),
      lucidity: dream.lucidity,
      tags: dream.tags
    }));

    // Create edges from dream links
    this.edges = dreamLinks.map(link => ({
      from: this.nodes.find(n => n.id === link.dream1Id),
      to: this.nodes.find(n => n.id === link.dream2Id),
      type: link.connectionType
    })).filter(edge => edge.from && edge.to);

    this.applyForceLayout();
  }

  applyForceLayout() {
    const simulation = d3.forceSimulation(this.nodes)
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(this.canvas.width / 2, this.canvas.height / 2))
      .force('collision', d3.forceCollide().radius(40))
      .force('link', d3.forceLink(this.edges)
        .id(d => d.id)
        .distance(150));

    // Run simulation
    for (let i = 0; i < 300; ++i) simulation.tick();
    
    this.render();
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicked on a node
    this.nodes.forEach(node => {
      const dx = mouseX - node.x;
      const dy = mouseY - node.y;
      if (dx * dx + dy * dy < node.radius * node.radius) {
        this.draggingNode = node;
        this.mouseOffset.x = dx;
        this.mouseOffset.y = dy;
        this.isDragging = true;
      }
    });

    // Update selection
    this.selectedNode = this.draggingNode;
    this.render();
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    this.draggingNode.x = mouseX - this.mouseOffset.x;
    this.draggingNode.y = mouseY - this.mouseOffset.y;

    this.render();
  }

  handleMouseUp() {
    this.isDragging = false;
    this.draggingNode = null;
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw edges
    this.edges.forEach(edge => {
      this.ctx.beginPath();
      this.ctx.moveTo(edge.from.x, edge.from.y);
      this.ctx.lineTo(edge.to.x, edge.to.y);
      this.ctx.strokeStyle = this.getConnectionColor(edge.type);
      this.ctx.setLineDash([5, 5]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Draw edge label
      const midX = (edge.from.x + edge.to.x) / 2;
      const midY = (edge.from.y + edge.to.y) / 2;
      this.ctx.fillStyle = '#ccc';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(edge.type, midX, midY - 5);
    });

    // Draw nodes
    this.nodes.forEach(node => {
      // Node circle
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.getLucidityColor(node.lucidity);
      this.ctx.fill();
      
      if (node === this.selectedNode) {
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }

      // Node title
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.truncateText(node.title, 15), node.x, node.y);
      
      // Node date
      this.ctx.fillStyle = '#ccc';
      this.ctx.font = '10px Arial';
      this.ctx.fillText(node.date.toLocaleDateString(), node.x, node.y + 15);
    });

    // Draw selection details
    if (this.selectedNode) {
      this.drawSelectionDetails();
    }
  }

  drawSelectionDetails() {
    const padding = 10;
    const lineHeight = 20;
    const x = 10;
    let y = this.canvas.height - 100;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(x, y - padding, 250, 90);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    
    this.ctx.fillText(`Title: ${this.selectedNode.title}`, x + padding, y += lineHeight);
    this.ctx.fillText(`Date: ${this.selectedNode.date.toLocaleDateString()}`, x + padding, y += lineHeight);
    this.ctx.fillText(`Lucidity: ${this.selectedNode.lucidity}/10`, x + padding, y += lineHeight);
    this.ctx.fillText(`Tags: ${this.selectedNode.tags.join(', ')}`, x + padding, y += lineHeight);
  }

  getConnectionColor(type) {
    const colors = {
      'Recurring Theme': '#9370DB',
      'Same Spirit Guide': '#FFD700',
      'Similar Location': '#87CEEB',
      'Shared Symbol': '#DDA0DD',
      'Sequential Events': '#90EE90',
      'Related Message': '#FFA07A'
    };
    return colors[type] || '#ccc';
  }

  getLucidityColor(level) {
    const hue = 270; // Purple
    const saturation = 60;
    const lightness = 40 + (level * 3); // Brighter as lucidity increases
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
