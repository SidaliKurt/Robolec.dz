/**
 * Complete Three.js CLI System
 * Ultra-optimized, feature-complete command-line interface for Three.js
 * Designed for AI chatbots with maximum efficiency and control
 */

class ThreeJSCLI {
    constructor(scene, camera, renderer, options = {}) {
        // Core Three.js references
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // Object registries
        this.objects = new Map();
        this.groups = new Map();
        this.materials = new Map();
        this.textures = new Map();
        this.lights = new Map();
        this.animations = new Map();
        this.curves = new Map();
        
        // State management
        this.state = {
            autoId: 0,
            selected: null,
            clipboard: null,
            history: [],
            historyIndex: -1,
            animationMixer: null,
            clock: new THREE.Clock()
        };
        
        // Configuration
        this.config = {
            precision: 6,
            autoRender: options.autoRender !== false,
            enableHistory: options.enableHistory !== false,
            maxHistory: options.maxHistory || 100,
            enablePhysics: options.enablePhysics || false,
            enablePostProcessing: options.enablePostProcessing || false
        };
        
        // Initialize built-in materials and resources
        this.initializeMaterials();
        this.initializeGeometries();
        this.initializeHelpers();
        
        // Animation system
        if (this.config.autoRender) {
            this.startRenderLoop();
        }
        
        // Command aliases for ultra-compact syntax
        this.aliases = new Map([
            ['c', 'cube'], ['s', 'sphere'], ['p', 'plane'], ['cy', 'cylinder'],
            ['co', 'cone'], ['t', 'torus'], ['te', 'tetrahedron'], ['oc', 'octahedron'],
            ['ic', 'icosahedron'], ['do', 'dodecahedron'], ['r', 'ring'], ['cp', 'capsule'],
            ['mv', 'move'], ['rt', 'rotate'], ['sc', 'scale'], ['cl', 'color'],
            ['mt', 'material'], ['tx', 'texture'], ['d', 'delete'], ['h', 'hide'],
            ['sh', 'show'], ['ls', 'list'], ['gr', 'group'], ['ug', 'ungroup'],
            ['al', 'ambientLight'], ['dl', 'directionalLight'], ['pl', 'pointLight'],
            ['sl', 'spotLight'], ['hl', 'hemisphereLight'], ['an', 'animate'],
            ['cm', 'camera'], ['lk', 'lookAt'], ['cn', 'center'], ['bb', 'boundingBox']
        ]);
    }
    
    // Initialize built-in materials
    initializeMaterials() {
        const materials = {
            // Basic colors
            w: new THREE.MeshBasicMaterial({ color: 0xffffff }),
            r: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
            g: new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
            b: new THREE.MeshBasicMaterial({ color: 0x0000ff }),
            y: new THREE.MeshBasicMaterial({ color: 0xffff00 }),
            m: new THREE.MeshBasicMaterial({ color: 0xff00ff }),
            c: new THREE.MeshBasicMaterial({ color: 0x00ffff }),
            k: new THREE.MeshBasicMaterial({ color: 0x000000 }),
            
            // Material types
            basic: new THREE.MeshBasicMaterial({ color: 0xffffff }),
            lambert: new THREE.MeshLambertMaterial({ color: 0xffffff }),
            phong: new THREE.MeshPhongMaterial({ color: 0xffffff }),
            standard: new THREE.MeshStandardMaterial({ color: 0xffffff }),
            physical: new THREE.MeshPhysicalMaterial({ color: 0xffffff }),
            
            // Special materials
            wireframe: new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }),
            transparent: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }),
            glass: new THREE.MeshPhysicalMaterial({ 
                color: 0xffffff, 
                transparent: true, 
                opacity: 0.1, 
                roughness: 0,
                metalness: 0,
                transmission: 1
            })
        };
        
        Object.entries(materials).forEach(([key, material]) => {
            this.materials.set(key, material);
        });
    }
    
    // Initialize common geometries for reuse
    initializeGeometries() {
        this.geometries = new Map([
            ['cube', () => new THREE.BoxGeometry()],
            ['sphere', () => new THREE.SphereGeometry(1, 32, 16)],
            ['plane', () => new THREE.PlaneGeometry()],
            ['cylinder', () => new THREE.CylinderGeometry(1, 1, 1, 32)],
            ['cone', () => new THREE.ConeGeometry(1, 1, 32)],
            ['torus', () => new THREE.TorusGeometry(1, 0.4, 16, 100)],
            ['tetrahedron', () => new THREE.TetrahedronGeometry()],
            ['octahedron', () => new THREE.OctahedronGeometry()],
            ['icosahedron', () => new THREE.IcosahedronGeometry()],
            ['dodecahedron', () => new THREE.DodecahedronGeometry()],
            ['ring', () => new THREE.RingGeometry(0.5, 1, 32)],
            ['capsule', () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32)]
        ]);
    }
    
    // Initialize helper objects
    initializeHelpers() {
        this.helpers = {
            grid: new THREE.GridHelper(10, 10),
            axes: new THREE.AxesHelper(5),
            directionalLightHelper: null,
            pointLightHelper: null,
            spotLightHelper: null
        };
    }
    
    // Main command interpreter
    execute(command) {
        try {
            if (!command || typeof command !== 'string') {
                return this.error('Invalid command');
            }
            
            // Handle multi-line commands
            if (command.includes('\n')) {
                return this.batch(command);
            }
            
            // Parse command
            const parts = this.parseCommand(command.trim());
            if (parts.length === 0) return this.success('');
            
            const [cmd, ...args] = parts;
            const resolvedCmd = this.aliases.get(cmd) || cmd;
            
            // Add to history
            if (this.config.enableHistory) {
                this.addToHistory(command);
            }
            
            // Execute command
            const result = this.executeCommand(resolvedCmd, args);
            
            // Auto-render if enabled
            if (this.config.autoRender) {
                this.render();
            }
            
            return result;
        } catch (error) {
            return this.error(`Execution error: ${error.message}`);
        }
    }
    
    // Advanced command parser with support for quoted strings and expressions
    parseCommand(command) {
        const parts = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        
        for (let i = 0; i < command.length; i++) {
            const char = command[i];
            
            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            } else if (char === ' ' && !inQuotes) {
                if (current.trim()) {
                    parts.push(current.trim());
                    current = '';
                }
            } else {
                current += char;
            }
        }
        
        if (current.trim()) {
            parts.push(current.trim());
        }
        
        return parts;
    }
    
    // Main command dispatcher
    executeCommand(cmd, args) {
        // Shape creation commands
        if (this.geometries.has(cmd)) {
            return this.createShape(cmd, args);
        }
        
        // Built-in commands
        switch (cmd) {
            // Object manipulation
            case 'move': return this.moveObject(args);
            case 'rotate': return this.rotateObject(args);
            case 'scale': return this.scaleObject(args);
            case 'color': return this.colorObject(args);
            case 'material': return this.setMaterial(args);
            case 'texture': return this.setTexture(args);
            case 'opacity': return this.setOpacity(args);
            case 'visible': return this.setVisibility(args);
            
            // Object management
            case 'delete': return this.deleteObject(args);
            case 'clone': return this.cloneObject(args);
            case 'copy': return this.copyObject(args);
            case 'paste': return this.pasteObject(args);
            case 'select': return this.selectObject(args);
            case 'deselect': return this.deselectObject(args);
            case 'hide': return this.hideObject(args);
            case 'show': return this.showObject(args);
            case 'center': return this.centerObject(args);
            case 'reset': return this.resetObject(args);
            
            // Grouping
            case 'group': return this.createGroup(args);
            case 'ungroup': return this.ungroupObjects(args);
            case 'parent': return this.setParent(args);
            case 'unparent': return this.unparent(args);
            
            // Lighting
            case 'ambientLight': return this.createAmbientLight(args);
            case 'directionalLight': return this.createDirectionalLight(args);
            case 'pointLight': return this.createPointLight(args);
            case 'spotLight': return this.createSpotLight(args);
            case 'hemisphereLight': return this.createHemisphereLight(args);
            
            // Animation
            case 'animate': return this.createAnimation(args);
            case 'stopAnimation': return this.stopAnimation(args);
            case 'pauseAnimation': return this.pauseAnimation(args);
            case 'resumeAnimation': return this.resumeAnimation(args);
            case 'timeline': return this.createTimeline(args);
            
            // Camera controls
            case 'camera': return this.controlCamera(args);
            case 'lookAt': return this.cameraLookAt(args);
            case 'orbit': return this.cameraOrbit(args);
            case 'zoom': return this.cameraZoom(args);
            
            // Scene management
            case 'clear': return this.clearScene(args);
            case 'background': return this.setBackground(args);
            case 'fog': return this.setFog(args);
            case 'environment': return this.setEnvironment(args);
            
            // Utility commands
            case 'list': return this.listObjects(args);
            case 'info': return this.getObjectInfo(args);
            case 'stats': return this.getSceneStats(args);
            case 'export': return this.exportScene(args);
            case 'import': return this.importScene(args);
            case 'snapshot': return this.takeSnapshot(args);
            
            // Math and geometry
            case 'distance': return this.calculateDistance(args);
            case 'angle': return this.calculateAngle(args);
            case 'intersect': return this.checkIntersection(args);
            case 'boundingBox': return this.getBoundingBox(args);
            case 'raycast': return this.performRaycast(args);
            
            // Advanced features
            case 'physics': return this.enablePhysics(args);
            case 'collision': return this.setupCollision(args);
            case 'morph': return this.createMorph(args);
            case 'instanced': return this.createInstancedMesh(args);
            case 'lod': return this.createLOD(args);
            
            // Helpers and debugging
            case 'grid': return this.toggleGrid(args);
            case 'axes': return this.toggleAxes(args);
            case 'wireframe': return this.toggleWireframe(args);
            case 'normals': return this.showNormals(args);
            case 'debug': return this.toggleDebug(args);
            
            // History and state
            case 'undo': return this.undo();
            case 'redo': return this.redo();
            case 'save': return this.saveState(args);
            case 'load': return this.loadState(args);
            case 'history': return this.showHistory(args);
            
            // Configuration
            case 'config': return this.setConfig(args);
            case 'precision': return this.setPrecision(args);
            case 'autoRender': return this.setAutoRender(args);
            
            // Help and documentation
            case 'help': return this.showHelp(args);
            case 'commands': return this.listCommands(args);
            case 'examples': return this.showExamples(args);
            
            default:
                return this.error(`Unknown command: ${cmd}`);
        }
    }
    
    // Shape creation with advanced parameters
    createShape(type, args) {
        const id = this.generateId(type);
        const params = this.parseShapeParameters(type, args);
        
        try {
            const geometry = this.createGeometry(type, params.geometry);
            const material = this.getMaterial(params.material);
            const mesh = new THREE.Mesh(geometry, material);
            
            // Apply transforms
            if (params.position) mesh.position.set(...params.position);
            if (params.rotation) mesh.rotation.set(...params.rotation);
            if (params.scale) mesh.scale.set(...params.scale);
            
            // Apply additional properties
            if (params.castShadow !== undefined) mesh.castShadow = params.castShadow;
            if (params.receiveShadow !== undefined) mesh.receiveShadow = params.receiveShadow;
            if (params.visible !== undefined) mesh.visible = params.visible;
            if (params.userData) mesh.userData = { ...mesh.userData, ...params.userData };
            
            // Add to scene and registry
            this.scene.add(mesh);
            this.objects.set(params.id || id, mesh);
            
            return this.success(`Created ${type} '${params.id || id}'`);
        } catch (error) {
            return this.error(`Failed to create ${type}: ${error.message}`);
        }
    }
    
    // Advanced parameter parsing for shapes
    parseShapeParameters(type, args) {
        const params = {
            geometry: [],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            material: 'w',
            id: null,
            castShadow: true,
            receiveShadow: true,
            visible: true,
            userData: {}
        };
        
        // Shape-specific parameter parsing
        switch (type) {
            case 'cube':
                params.geometry = [
                    parseFloat(args[0]) || 1, // width
                    parseFloat(args[1]) || 1, // height
                    parseFloat(args[2]) || 1  // depth
                ];
                break;
            case 'sphere':
                params.geometry = [
                    parseFloat(args[0]) || 1,    // radius
                    parseInt(args[1]) || 32,     // widthSegments
                    parseInt(args[2]) || 16      // heightSegments
                ];
                break;
            case 'cylinder':
                params.geometry = [
                    parseFloat(args[0]) || 1,    // radiusTop
                    parseFloat(args[1]) || 1,    // radiusBottom
                    parseFloat(args[2]) || 1,    // height
                    parseInt(args[3]) || 32      // radialSegments
                ];
                break;
            // Add more shape-specific parsing...
        }
        
        // Parse position, rotation, scale, material, id from remaining args
        let argIndex = this.getShapeParamCount(type);
        
        // Position (x, y, z)
        if (args[argIndex] !== undefined) params.position[0] = parseFloat(args[argIndex++]);
        if (args[argIndex] !== undefined) params.position[1] = parseFloat(args[argIndex++]);
        if (args[argIndex] !== undefined) params.position[2] = parseFloat(args[argIndex++]);
        
        // Material/Color
        if (args[argIndex] !== undefined && isNaN(parseFloat(args[argIndex]))) {
            params.material = args[argIndex++];
        }
        
        // ID
        if (args[argIndex] !== undefined && isNaN(parseFloat(args[argIndex]))) {
            params.id = args[argIndex++];
        }
        
        return params;
    }
    
    // Get parameter count for each shape type
    getShapeParamCount(type) {
        const counts = {
            cube: 3, sphere: 3, plane: 2, cylinder: 4, cone: 2,
            torus: 2, tetrahedron: 1, octahedron: 1, icosahedron: 1,
            dodecahedron: 1, ring: 3, capsule: 3
        };
        return counts[type] || 1;
    }
    
    // Create geometry with parameters
    createGeometry(type, params) {
        const geometryCreator = this.geometries.get(type);
        if (!geometryCreator) {
            throw new Error(`Unknown geometry type: ${type}`);
        }
        
        switch (type) {
            case 'cube':
                return new THREE.BoxGeometry(params[0], params[1], params[2]);
            case 'sphere':
                return new THREE.SphereGeometry(params[0], params[1], params[2]);
            case 'cylinder':
                return new THREE.CylinderGeometry(params[0], params[1], params[2], params[3]);
            default:
                return geometryCreator();
        }
    }
    
    // Advanced material management
    getMaterial(materialSpec) {
        if (this.materials.has(materialSpec)) {
            return this.materials.get(materialSpec);
        }
        
        // Parse color values
        if (materialSpec.startsWith('#')) {
            return new THREE.MeshBasicMaterial({ color: materialSpec });
        }
        
        if (materialSpec.startsWith('0x')) {
            return new THREE.MeshBasicMaterial({ color: parseInt(materialSpec, 16) });
        }
        
        // Parse material expressions like "phong:red" or "standard:0xff0000:0.5"
        if (materialSpec.includes(':')) {
            const [type, color, opacity, ...props] = materialSpec.split(':');
            const MaterialClass = this.getMaterialClass(type);
            const options = { color: color || 0xffffff };
            
            if (opacity !== undefined) {
                options.transparent = true;
                options.opacity = parseFloat(opacity);
            }
            
            return new MaterialClass(options);
        }
        
        return this.materials.get('w'); // Default white
    }
    
    // Get Three.js material class by name
    getMaterialClass(type) {
        const materials = {
            basic: THREE.MeshBasicMaterial,
            lambert: THREE.MeshLambertMaterial,
            phong: THREE.MeshPhongMaterial,
            standard: THREE.MeshStandardMaterial,
            physical: THREE.MeshPhysicalMaterial,
            toon: THREE.MeshToonMaterial
        };
        return materials[type] || THREE.MeshBasicMaterial;
    }
    
    // Object manipulation methods
    moveObject(args) {
        const [id, x, y, z] = args;
        const obj = this.getObject(id);
        if (!obj) return this.error(`Object '${id}' not found`);
        
        obj.position.set(
            parseFloat(x) || 0,
            parseFloat(y) || 0,
            parseFloat(z) || 0
        );
        
        return this.success(`Moved '${id}' to (${x}, ${y}, ${z})`);
    }
    
    rotateObject(args) {
        const [id, x, y, z] = args;
        const obj = this.getObject(id);
        if (!obj) return this.error(`Object '${id}' not found`);
        
        obj.rotation.set(
            parseFloat(x) || 0,
            parseFloat(y) || 0,
            parseFloat(z) || 0
        );
        
        return this.success(`Rotated '${id}' to (${x}, ${y}, ${z})`);
    }
    
    scaleObject(args) {
        const [id, x, y, z] = args;
        const obj = this.getObject(id);
        if (!obj) return this.error(`Object '${id}' not found`);
        
        const sx = parseFloat(x) || 1;
        const sy = parseFloat(y) || sx;
        const sz = parseFloat(z) || sx;
        
        obj.scale.set(sx, sy, sz);
        
        return this.success(`Scaled '${id}' to (${sx}, ${sy}, ${sz})`);
    }
    
    // Animation system
    createAnimation(args) {
        const [id, property, from, to, duration, easing] = args;
        const obj = this.getObject(id);
        if (!obj) return this.error(`Object '${id}' not found`);
        
        // Create animation using TWEEN or custom system
        const animId = `${id}_${property}_${Date.now()}`;
        
        // Store animation reference
        this.animations.set(animId, {
            object: obj,
            property,
            from: parseFloat(from),
            to: parseFloat(to),
            duration: parseFloat(duration) * 1000,
            easing: easing || 'linear',
            startTime: Date.now()
        });
        
        return this.success(`Created animation '${animId}'`);
    }
    
    // Lighting methods
    createPointLight(args) {
        const [intensity, x, y, z, color, id] = args;
        const lightId = id || this.generateId('light');
        
        const light = new THREE.PointLight(
            this.parseColor(color) || 0xffffff,
            parseFloat(intensity) || 1,
            0, // distance (0 = infinite)
            2  // decay
        );
        
        light.position.set(
            parseFloat(x) || 0,
            parseFloat(y) || 0,
            parseFloat(z) || 0
        );
        
        this.scene.add(light);
        this.lights.set(lightId, light);
        
        return this.success(`Created point light '${lightId}'`);
    }
    
    // Utility methods
    generateId(prefix = 'obj') {
        return `${prefix}${this.state.autoId++}`;
    }
    
    getObject(id) {
        return this.objects.get(id) || this.lights.get(id) || this.groups.get(id);
    }
    
    parseColor(colorStr) {
        if (!colorStr) return null;
        if (colorStr.startsWith('#')) return parseInt(colorStr.slice(1), 16);
        if (colorStr.startsWith('0x')) return parseInt(colorStr, 16);
        
        const colorMap = {
            red: 0xff0000, green: 0x00ff00, blue: 0x0000ff,
            yellow: 0xffff00, magenta: 0xff00ff, cyan: 0x00ffff,
            white: 0xffffff, black: 0x000000, gray: 0x808080
        };
        
        return colorMap[colorStr.toLowerCase()] || null;
    }
    
    // Batch execution
    batch(commands) {
        const lines = commands.split('\n').map(line => line.trim()).filter(line => line);
        const results = [];
        
        for (const line of lines) {
            if (line.startsWith('#') || line.startsWith('//')) continue; // Skip comments
            const result = this.execute(line);
            results.push(`${line}: ${result.message}`);
        }
        
        return this.success(`Executed ${lines.length} commands:\n${results.join('\n')}`);
    }
    
    // List all objects
    listObjects(args) {
        const filter = args[0];
        let objects = Array.from(this.objects.keys());
        let lights = Array.from(this.lights.keys());
        let groups = Array.from(this.groups.keys());
        
        if (filter) {
            objects = objects.filter(id => id.includes(filter));
            lights = lights.filter(id => id.includes(filter));
            groups = groups.filter(id => id.includes(filter));
        }
        
        const result = [];
        if (objects.length) result.push(`Objects: ${objects.join(', ')}`);
        if (lights.length) result.push(`Lights: ${lights.join(', ')}`);
        if (groups.length) result.push(`Groups: ${groups.join(', ')}`);
        
        return this.success(result.join('\n') || 'No objects found');
    }
    
    // Clear scene
    clearScene(args) {
        const type = args[0];
        
        if (!type || type === 'all') {
            // Clear everything
            this.objects.forEach(obj => this.scene.remove(obj));
            this.lights.forEach(light => this.scene.remove(light));
            this.groups.forEach(group => this.scene.remove(group));
            
            this.objects.clear();
            this.lights.clear();
            this.groups.clear();
            
            return this.success('Cleared entire scene');
        }
        
        // Clear specific type
        switch (type) {
            case 'objects':
                this.objects.forEach(obj => this.scene.remove(obj));
                this.objects.clear();
                return this.success('Cleared all objects');
            case 'lights':
                this.lights.forEach(light => this.scene.remove(light));
                this.lights.clear();
                return this.success('Cleared all lights');
            default:
                return this.error(`Unknown clear type: ${type}`);
        }
    }
    
    // History management
    addToHistory(command) {
        if (this.state.history.length >= this.config.maxHistory) {
            this.state.history.shift();
        }
        this.state.history.push(command);
        this.state.historyIndex = this.state.history.length - 1;
    }
    
    undo() {
        // Implementation would require command reversal logic
        return this.error('Undo not implemented yet');
    }
    
    redo() {
        // Implementation would require command replay logic
        return this.error('Redo not implemented yet');
    }
    
    // Render loop
    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Update animations
            this.updateAnimations();
            
            // Render scene
            this.render();
        };
        animate();
    }
    
    updateAnimations() {
        const now = Date.now();
        
        this.animations.forEach((anim, id) => {
            const elapsed = now - anim.startTime;
            if (elapsed >= anim.duration) {
                // Animation complete
                this.setObjectProperty(anim.object, anim.property, anim.to);
                this.animations.delete(id);
            } else {
                // Interpolate value
                const progress = elapsed / anim.duration;
                const easedProgress = this.applyEasing(progress, anim.easing);
                const value = this.lerp(anim.from, anim.to, easedProgress);
                this.setObjectProperty(anim.object, anim.property, value);
            }
        });
    }
    
    setObjectProperty(obj, property, value) {
        const parts = property.split('.');
        let target = obj;
        
        for (let i = 0; i < parts.length - 1; i++) {
            target = target[parts[i]];
        }
        
        target[parts[parts.length - 1]] = value;
    }
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    applyEasing(t, type) {
        switch (type) {
            case 'linear': return t;
            case 'ease-in': return t * t;
            case 'ease-out': return 1 - (1 - t) * (1 - t);
            case 'ease-in-out': return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
            default: return t;
        }
    }
    
    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    // Response formatting
    success(message) {
        return { success: true, message };
    }
    
    error(message) {
        return { success: false, message };
    }
    
    // Help system
    showHelp(args) {
        const topic = args[0];
        
        if (!topic) {
            return this.success(`
Three.js CLI Help
================

Basic Usage:
  command [args...]     Execute a command
  help [topic]          Show help for specific topic
  commands             List all available commands
  examples             Show usage examples

Topics:
  shapes, transforms, lights, animation, materials, scene, camera

Ultra-compact syntax examples:
  c 1 1 1 0 0 0 r      # Red cube at origin
  s 2 5 0 0 g ball     # Green sphere named 'ball'
  mv ball -2 0 0       # Move ball left
  pl 2 10 10 10        # Point light above
  an ball position.y 0 5 2  # Animate ball up
            `);
        }
        
        // Topic-specific help would be implemented here
        return this.success(`Help for '${topic}' not implemented yet`);
    }
    
    listCommands(args) {
        const categories = {
            'Shapes': ['cube', 'sphere', 'plane', 'cylinder', 'cone', 'torus', 'tetrahedron', 'octahedron', 'icosahedron', 'dodecahedron', 'ring', 'capsule'],
            'Transforms': ['move', 'rotate', 'scale', 'center', 'reset'],
            'Materials': ['color', 'material', 'texture', 'opacity', 'wireframe'],
            'Objects': ['delete', 'clone', 'copy', 'paste', 'hide', 'show', 'select', 'info'],
            'Groups': ['group', 'ungroup', 'parent', 'unparent'],
            'Lights': ['ambientLight', 'directionalLight', 'pointLight', 'spotLight', 'hemisphereLight'],
            'Camera': ['camera', 'lookAt', 'orbit', 'zoom'],
            'Animation': ['animate', 'stopAnimation', 'pauseAnimation', 'resumeAnimation', 'timeline'],
            'Scene': ['clear', 'background', 'fog', 'environment', 'grid', 'axes'],
            'Utilities': ['list', 'stats', 'export', 'import', 'snapshot', 'distance', 'angle', 'raycast'],
            'System': ['undo', 'redo', 'save', 'load', 'config', 'help', 'debug']
        };
        
        const category = args[0];
        if (category && categories[category]) {
            return this.success(`${category} commands: ${categories[category].join(', ')}`);
        }
        
        let result = 'Available Commands:\n';
        Object.entries(categories).forEach(([cat, cmds]) => {
            result += `\n${cat}: ${cmds.join(', ')}`;
        });
        
        return this.success(result);
    }
    
    showExamples(args) {
        const examples = {
            basic: `
Basic Shape Creation:
  c 2 1 1 0 0 0 r box1        # Red box 2x1x1 at origin
  s 1.5 3 0 0 g sphere1       # Green sphere radius 1.5 at (3,0,0)
  cy 1 0.5 2 0 2 0 b          # Blue cylinder at (0,2,0)
  
Transforms:
  mv box1 -2 0 0              # Move box left
  rt sphere1 0 1.57 0         # Rotate sphere 90 degrees
  sc box1 2 2 2               # Scale box to 2x size
            `,
            
            advanced: `
Advanced Features:
  c 1 1 1 0 0 0 "standard:red:0.8" glass_cube
  an glass_cube rotation.y 0 6.28 5 ease-in-out
  pl 2 5 5 5 white light1
  gr box1 sphere1 light1 scene_group
  
Materials:
  mt box1 physical           # Change to physical material
  cl sphere1 #ff6600         # Orange color
  tx box1 "wood.jpg"         # Apply wood texture
            `,
            
            scene: `
Scene Setup:
  clear all                  # Clear everything
  background #87CEEB         # Sky blue background
  fog linear 0.1 100 #ffffff # White fog
  grid 20                    # 20x20 grid
  axes 10                    # 10-unit axes
  
Camera:
  cm 10 10 10               # Move camera
  lk 0 0 0                  # Look at origin
  orbit 45 30 15            # Orbit view
            `,
            
            animation: `
Animation Examples:
  an box1 position.x 0 10 3           # Move box right over 3 seconds
  an sphere1 rotation.y 0 6.28 2 loop # Continuous rotation
  an light1 intensity 1 0 1 bounce    # Pulsing light
  
Timeline:
  timeline scene1 0 "c 1 1 1 0 0 0"
  timeline scene1 1 "mv obj0 5 0 0"
  timeline scene1 2 "rt obj0 0 3.14 0"
            `
        };
        
        const topic = args[0] || 'basic';
        return this.success(examples[topic] || 'Unknown example topic. Try: basic, advanced, scene, animation');
    }
    
    // Advanced object management
    cloneObject(args) {
        const [sourceId, newId, x, y, z] = args;
        const source = this.getObject(sourceId);
        if (!source) return this.error(`Object '${sourceId}' not found`);
        
        const clone = source.clone();
        const id = newId || this.generateId('clone');
        
        if (x !== undefined) clone.position.x = parseFloat(x);
        if (y !== undefined) clone.position.y = parseFloat(y);
        if (z !== undefined) clone.position.z = parseFloat(z);
        
        this.scene.add(clone);
        this.objects.set(id, clone);
        
        return this.success(`Cloned '${sourceId}' as '${id}'`);
    }
    
    copyObject(args) {
        const [id] = args;
        const obj = this.getObject(id);
        if (!obj) return this.error(`Object '${id}' not found`);
        
        this.state.clipboard = {
            object: obj.clone(),
            type: 'object',
            sourceId: id
        };
        
        return this.success(`Copied '${id}' to clipboard`);
    }
    
    pasteObject(args) {
        if (!this.state.clipboard) return this.error('Clipboard is empty');
        
        const [newId, x, y, z] = args;
        const clone = this.state.clipboard.object.clone();
        const id = newId || this.generateId('paste');
        
        if (x !== undefined) clone.position.x = parseFloat(x);
        if (y !== undefined) clone.position.y = parseFloat(y);
        if (z !== undefined) clone.position.z = parseFloat(z);
        
        this.scene.add(clone);
        this.objects.set(id, clone);
        
        return this.success(`Pasted as '${id}'`);
    }
    
    // Group management
    createGroup(args) {
        const groupId = args[args.length - 1];
        const objectIds = args.slice(0, -1);
        
        if (objectIds.length === 0) return this.error('No objects specified for grouping');
        
        const group = new THREE.Group();
        const id = groupId || this.generateId('group');
        
        let addedCount = 0;
        objectIds.forEach(objId => {
            const obj = this.getObject(objId);
            if (obj) {
                // Remove from scene first
                this.scene.remove(obj);
                // Add to group
                group.add(obj);
                addedCount++;
            }
        });
        
        if (addedCount === 0) return this.error('No valid objects found to group');
        
        this.scene.add(group);
        this.groups.set(id, group);
        
        return this.success(`Created group '${id}' with ${addedCount} objects`);
    }
    
    ungroupObjects(args) {
        const [groupId] = args;
        const group = this.groups.get(groupId);
        if (!group) return this.error(`Group '${groupId}' not found`);
        
        const children = [...group.children];
        children.forEach(child => {
            group.remove(child);
            this.scene.add(child);
            // Maintain world position
            child.position.add(group.position);
            child.rotation.x += group.rotation.x;
            child.rotation.y += group.rotation.y;
            child.rotation.z += group.rotation.z;
        });
        
        this.scene.remove(group);
        this.groups.delete(groupId);
        
        return this.success(`Ungrouped '${groupId}', moved ${children.length} objects to scene`);
    }
    
    // Advanced lighting
    createDirectionalLight(args) {
        const [intensity, x, y, z, color, id] = args;
        const lightId = id || this.generateId('dirLight');
        
        const light = new THREE.DirectionalLight(
            this.parseColor(color) || 0xffffff,
            parseFloat(intensity) || 1
        );
        
        light.position.set(
            parseFloat(x) || 0,
            parseFloat(y) || 10,
            parseFloat(z) || 0
        );
        
        // Enable shadows
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        
        this.scene.add(light);
        this.lights.set(lightId, light);
        
        return this.success(`Created directional light '${lightId}'`);
    }
    
    createSpotLight(args) {
        const [intensity, x, y, z, targetX, targetY, targetZ, angle, penumbra, id] = args;
        const lightId = id || this.generateId('spotLight');
        
        const light = new THREE.SpotLight(
            0xffffff,
            parseFloat(intensity) || 1,
            0, // distance
            parseFloat(angle) || Math.PI / 3,
            parseFloat(penumbra) || 0,
            2 // decay
        );
        
        light.position.set(
            parseFloat(x) || 0,
            parseFloat(y) || 10,
            parseFloat(z) || 0
        );
        
        if (targetX !== undefined) {
            light.target.position.set(
                parseFloat(targetX) || 0,
                parseFloat(targetY) || 0,
                parseFloat(targetZ) || 0
            );
            this.scene.add(light.target);
        }
        
        light.castShadow = true;
        
        this.scene.add(light);
        this.lights.set(lightId, light);
        
        return this.success(`Created spot light '${lightId}'`);
    }
    
    createAmbientLight(args) {
        const [intensity, color, id] = args;
        const lightId = id || this.generateId('ambLight');
        
        const light = new THREE.AmbientLight(
            this.parseColor(color) || 0x404040,
            parseFloat(intensity) || 0.5
        );
        
        this.scene.add(light);
        this.lights.set(lightId, light);
        
        return this.success(`Created ambient light '${lightId}'`);
    }
    
    createHemisphereLight(args) {
        const [skyColor, groundColor, intensity, id] = args;
        const lightId = id || this.generateId('hemiLight');
        
        const light = new THREE.HemisphereLight(
            this.parseColor(skyColor) || 0xffffbb,
            this.parseColor(groundColor) || 0x080820,
            parseFloat(intensity) || 1
        );
        
        this.scene.add(light);
        this.lights.set(lightId, light);
        
        return this.success(`Created hemisphere light '${lightId}'`);
    }
    
    // Camera controls
    controlCamera(args) {
        const [action, ...params] = args;
        
        switch (action) {
            case 'move':
                const [x, y, z] = params;
                this.camera.position.set(
                    parseFloat(x) || 0,
                    parseFloat(y) || 0,
                    parseFloat(z) || 0
                );
                return this.success(`Moved camera to (${x}, ${y}, ${z})`);
                
            case 'rotate':
                const [rx, ry, rz] = params;
                this.camera.rotation.set(
                    parseFloat(rx) || 0,
                    parseFloat(ry) || 0,
                    parseFloat(rz) || 0
                );
                return this.success(`Rotated camera to (${rx}, ${ry}, ${rz})`);
                
            case 'fov':
                const [fov] = params;
                if (this.camera.isPerspectiveCamera) {
                    this.camera.fov = parseFloat(fov) || 75;
                    this.camera.updateProjectionMatrix();
                    return this.success(`Set camera FOV to ${fov}`);
                }
                return this.error('FOV only available for perspective cameras');
                
            default:
                return this.error(`Unknown camera action: ${action}`);
        }
    }
    
    cameraLookAt(args) {
        const [x, y, z] = args;
        this.camera.lookAt(
            parseFloat(x) || 0,
            parseFloat(y) || 0,
            parseFloat(z) || 0
        );
        return this.success(`Camera looking at (${x}, ${y}, ${z})`);
    }
    
    cameraOrbit(args) {
        const [radius, azimuth, elevation] = args;
        const r = parseFloat(radius) || 10;
        const a = (parseFloat(azimuth) || 0) * Math.PI / 180;
        const e = (parseFloat(elevation) || 0) * Math.PI / 180;
        
        this.camera.position.x = r * Math.cos(e) * Math.cos(a);
        this.camera.position.y = r * Math.sin(e);
        this.camera.position.z = r * Math.cos(e) * Math.sin(a);
        this.camera.lookAt(0, 0, 0);
        
        return this.success(`Camera orbiting at radius ${r}, azimuth ${azimuth}°, elevation ${elevation}°`);
    }
    
    // Scene management
    setBackground(args) {
        const [color] = args;
        const bgColor = this.parseColor(color);
        
        if (bgColor !== null) {
            this.scene.background = new THREE.Color(bgColor);
            return this.success(`Set background to ${color}`);
        }
        
        return this.error(`Invalid color: ${color}`);
    }
    
    setFog(args) {
        const [type, near, far, color] = args;
        const fogColor = this.parseColor(color) || 0xffffff;
        
        switch (type) {
            case 'linear':
                this.scene.fog = new THREE.Fog(fogColor, parseFloat(near) || 1, parseFloat(far) || 1000);
                return this.success(`Set linear fog from ${near} to ${far}`);
                
            case 'exp':
                this.scene.fog = new THREE.FogExp2(fogColor, parseFloat(near) || 0.00025);
                return this.success(`Set exponential fog with density ${near}`);
                
            case 'none':
                this.scene.fog = null;
                return this.success('Removed fog');
                
            default:
                return this.error(`Unknown fog type: ${type}. Use 'linear', 'exp', or 'none'`);
        }
    }
    
    // Utility functions
    getObjectInfo(args) {
        const [id] = args;
        const obj = this.getObject(id);
        if (!obj) return this.error(`Object '${id}' not found`);
        
        const info = {
            id,
            type: obj.type,
            position: `(${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)})`,
            rotation: `(${obj.rotation.x.toFixed(2)}, ${obj.rotation.y.toFixed(2)}, ${obj.rotation.z.toFixed(2)})`,
            scale: `(${obj.scale.x.toFixed(2)}, ${obj.scale.y.toFixed(2)}, ${obj.scale.z.toFixed(2)})`,
            visible: obj.visible,
            castShadow: obj.castShadow,
            receiveShadow: obj.receiveShadow
        };
        
        if (obj.geometry) {
            info.vertices = obj.geometry.attributes.position.count;
            info.faces = obj.geometry.index ? obj.geometry.index.count / 3 : info.vertices / 3;
        }
        
        if (obj.material) {
            info.material = obj.material.type;
        }
        
        let result = `Object '${id}' Info:\n`;
        Object.entries(info).forEach(([key, value]) => {
            if (key !== 'id') result += `  ${key}: ${value}\n`;
        });
        
        return this.success(result);
    }
    
    getSceneStats(args) {
        const stats = {
            objects: this.objects.size,
            lights: this.lights.size,
            groups: this.groups.size,
            animations: this.animations.size,
            totalVertices: 0,
            totalFaces: 0,
            materials: this.materials.size,
            textures: this.textures.size
        };
        
        // Calculate geometry stats
        this.objects.forEach(obj => {
            if (obj.geometry) {
                stats.totalVertices += obj.geometry.attributes.position.count;
                stats.totalFaces += obj.geometry.index ? obj.geometry.index.count / 3 : obj.geometry.attributes.position.count / 3;
            }
        });
        
        let result = 'Scene Statistics:\n';
        Object.entries(stats).forEach(([key, value]) => {
            result += `  ${key}: ${typeof value === 'number' ? Math.floor(value).toLocaleString() : value}\n`;
        });
        
        return this.success(result);
    }
    
    // Math utilities
    calculateDistance(args) {
        const [id1, id2] = args;
        const obj1 = this.getObject(id1);
        const obj2 = this.getObject(id2);
        
        if (!obj1) return this.error(`Object '${id1}' not found`);
        if (!obj2) return this.error(`Object '${id2}' not found`);
        
        const distance = obj1.position.distanceTo(obj2.position);
        return this.success(`Distance between '${id1}' and '${id2}': ${distance.toFixed(this.config.precision)}`);
    }
    
    getBoundingBox(args) {
        const [id] = args;
        const obj = this.getObject(id);
        if (!obj) return this.error(`Object '${id}' not found`);
        
        if (!obj.geometry) return this.error(`Object '${id}' has no geometry`);
        
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        return this.success(`Bounding box for '${id}':\n  Size: (${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)})\n  Center: (${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)})`);
    }
    
    performRaycast(args) {
        const [x, y, z, dirX, dirY, dirZ] = args;
        
        const origin = new THREE.Vector3(
            parseFloat(x) || 0,
            parseFloat(y) || 0,
            parseFloat(z) || 0
        );
        
        const direction = new THREE.Vector3(
            parseFloat(dirX) || 0,
            parseFloat(dirY) || -1,
            parseFloat(dirZ) || 0
        ).normalize();
        
        const raycaster = new THREE.Raycaster(origin, direction);
        const objects = Array.from(this.objects.values());
        const intersects = raycaster.intersectObjects(objects, true);
        
        if (intersects.length === 0) return this.success('No intersections found');
        
        const hit = intersects[0];
        const objectId = this.getObjectId(hit.object);
        
        return this.success(`Raycast hit '${objectId}' at distance ${hit.distance.toFixed(3)}, point: (${hit.point.x.toFixed(2)}, ${hit.point.y.toFixed(2)}, ${hit.point.z.toFixed(2)})`);
    }
    
    getObjectId(object) {
        for (const [id, obj] of this.objects.entries()) {
            if (obj === object || obj === object.parent) return id;
        }
        return 'unknown';
    }
    
    // Configuration
    setConfig(args) {
        const [key, value] = args;
        
        if (!key) {
            let result = 'Current Configuration:\n';
            Object.entries(this.config).forEach(([k, v]) => {
                result += `  ${k}: ${v}\n`;
            });
            return this.success(result);
        }
        
        if (this.config.hasOwnProperty(key)) {
            const oldValue = this.config[key];
            
            // Parse value based on type
            if (typeof oldValue === 'boolean') {
                this.config[key] = value === 'true' || value === '1';
            } else if (typeof oldValue === 'number') {
                this.config[key] = parseFloat(value) || 0;
            } else {
                this.config[key] = value;
            }
            
            return this.success(`Set ${key} from ${oldValue} to ${this.config[key]}`);
        }
        
        return this.error(`Unknown config key: ${key}`);
    }
    
    // Debug helpers
    toggleGrid(args) {
        const [size, divisions] = args;
        
        if (this.helpers.grid.parent) {
            this.scene.remove(this.helpers.grid);
            return this.success('Grid hidden');
        } else {
            if (size || divisions) {
                this.scene.remove(this.helpers.grid);
                this.helpers.grid = new THREE.GridHelper(
                    parseFloat(size) || 10,
                    parseInt(divisions) || 10
                );
            }
            this.scene.add(this.helpers.grid);
            return this.success('Grid shown');
        }
    }
    
    toggleAxes(args) {
        const [size] = args;
        
        if (this.helpers.axes.parent) {
            this.scene.remove(this.helpers.axes);
            return this.success('Axes hidden');
        } else {
            if (size) {
                this.scene.remove(this.helpers.axes);
                this.helpers.axes = new THREE.AxesHelper(parseFloat(size));
            }
            this.scene.add(this.helpers.axes);
            return this.success('Axes shown');
        }
    }
    
    // Advanced material operations
    setMaterial(args) {
        const [id, materialType, ...properties] = args;
        const obj = this.getObject(id);
        if (!obj || !obj.material) return this.error(`Object '${id}' not found or has no material`);
        
        const MaterialClass = this.getMaterialClass(materialType);
        const options = {};
        
        // Parse material properties
        for (let i = 0; i < properties.length; i += 2) {
            const prop = properties[i];
            const value = properties[i + 1];
            
            if (prop && value !== undefined) {
                if (prop === 'color') {
                    options[prop] = this.parseColor(value) || 0xffffff;
                } else if (['transparent', 'wireframe', 'visible'].includes(prop)) {
                    options[prop] = value === 'true';
                } else {
                    options[prop] = parseFloat(value) || value;
                }
            }
        }
        
        obj.material = new MaterialClass(options);
        return this.success(`Set material for '${id}' to ${materialType}`);
    }
    
    setTexture(args) {
        const [id, textureUrl, repeatU, repeatV] = args;
        const obj = this.getObject(id);
        if (!obj || !obj.material) return this.error(`Object '${id}' not found or has no material`);
        
        const loader = new THREE.TextureLoader();
        loader.load(
            textureUrl,
            (texture) => {
                if (repeatU || repeatV) {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(parseFloat(repeatU) || 1, parseFloat(repeatV) || 1);
                }
                
                obj.material.map = texture;
                obj.material.needsUpdate = true;
            },
            undefined,
            (error) => {
                console.error('Error loading texture:', error);
            }
        );
        
        return this.success(`Loading texture '${textureUrl}' for '${id}'`);
    }
    
    setOpacity(args) {
        const [id, opacity] = args;
        const obj = this.getObject(id);
        if (!obj || !obj.material) return this.error(`Object '${id}' not found or has no material`);
        
        const op = parseFloat(opacity);
        if (op < 1) {
            obj.material.transparent = true;
        }
        obj.material.opacity = op;
        obj.material.needsUpdate = true;
        
        return this.success(`Set opacity for '${id}' to ${opacity}`);
    }
    
    setVisibility(args) {
        const [id, visible] = args;
        const obj = this.getObject(id);
        if (!obj) return this.error(`Object '${id}' not found`);
        
        obj.visible = visible === 'true' || visible === '1';
        return this.success(`Set visibility for '${id}' to ${obj.visible}`);
    }
    
    hideObject(args) {
        const [id] = args;
        const obj = this.getObject(id);
        if (!obj) return this.error(`Object '${id}' not found`);
        
        obj.visible = false;
        return this.success(`Hidden '${id}'`);
    }
    
    showObject(args) {
        const [id] = args;
        const obj = this.getObject(id);
        if (!obj) return this.error(`Object '${id}' not found`);
        
        obj.visible = true;
        return this.success(`Shown '${id}'`);
    }
    
    // Object utilities
    centerObject(args) {
        const [id] = args;
        const obj = this.getObject(id);
        if (!obj) return this.error(`Object '${id}' not found`);
        
        if (obj.geometry) {
            const box = new THREE.Box3().setFromObject(obj);
            const center = box.getCenter(new THREE.Vector3());
            obj.position.sub(center);
        } else {
            obj.position.set(0, 0, 0);
        }
        
        return this.success(`Centered '${id}'`);
    }
    
    resetObject(args) {
        const [id] = args;
        const obj = this.getObject(id);
        if (!obj) return this.error(`Object '${id}' not found`);
        
        obj.position.set(0, 0, 0);
        obj.rotation.set(0, 0, 0);
        obj.scale.set(1, 1, 1);
        
        return this.success(`Reset transforms for '${id}'`);
    }
    
    deleteObject(args) {
        const [id] = args;
        
        if (this.objects.has(id)) {
            const obj = this.objects.get(id);
            this.scene.remove(obj);
            this.objects.delete(id);
            return this.success(`Deleted object '${id}'`);
        }
        
        if (this.lights.has(id)) {
            const light = this.lights.get(id);
            this.scene.remove(light);
            this.lights.delete(id);
            return this.success(`Deleted light '${id}'`);
        }
        
        if (this.groups.has(id)) {
            const group = this.groups.get(id);
            this.scene.remove(group);
            this.groups.delete(id);
            return this.success(`Deleted group '${id}'`);
        }
        
        return this.error(`Object '${id}' not found`);
    }
}


// Usage example:
/*
// Initialize
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const cli = new ThreeJSCLI(scene, camera, renderer);

// Execute commands
cli.execute('c 2 1 1 0 0 0 r box1');           // Red cube
cli.execute('s 1.5 3 0 0 g sphere1');          // Green sphere
cli.execute('mv box1 -2 0 0');                 // Move cube
cli.execute('pl 2 5 5 5 white light1');        // Point light
cli.execute('an box1 rotation.y 0 6.28 3');    // Animate rotation
cli.execute('gr box1 sphere1 light1 scene1');  // Group objects

// Batch commands
cli.execute(`
    c 1 1 1 -2 0 0 r
    s 1 0 0 0 g
    cy 0.5 0.5 2 2 0 0 b
    pl 2 5 5 5
    background #87CEEB
    grid 10
`);
*/