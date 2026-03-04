// landing-3d.js - Three.js Particle Network for Landing Page

const init3DScene = () => {
    const container = document.getElementById('canvas-bg');
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0B0E14, 0.001); // Blend into dark background

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 250;
    // Slightly elevated angle
    camera.position.y = 50;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    container.appendChild(renderer.domElement);

    // Create Subject Nodes (Representing Math, Physics, Chem, Eng, Prog)
    const nodeGeometry = new THREE.IcosahedronGeometry(2, 1);

    // Core accent color material with glow
    const nodeMaterial = new THREE.MeshBasicMaterial({
        color: 0x58A6FF,
        transparent: true,
        opacity: 0.8,
        wireframe: true
    });

    // Particle system for ambient background
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 400;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        // Spread particles out widely
        posArray[i] = (Math.random() - 0.5) * 800;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Subtle dots
    const particlesMaterial = new THREE.PointsMaterial({
        size: 1.5,
        color: 0x8B949E, // text-muted
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create Main Nodes
    const nodes = [];
    const numNodes = 15; // Few main thematic nodes

    for (let i = 0; i < numNodes; i++) {
        const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);

        // Distribute nicely
        mesh.position.x = (Math.random() - 0.5) * 400;
        mesh.position.y = (Math.random() - 0.5) * 200;
        mesh.position.z = (Math.random() - 0.5) * 200;

        // Add subtle drifting velocities
        mesh.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
        );

        scene.add(mesh);
        nodes.push(mesh);
    }

    // Connect nodes with glowing lines
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x58A6FF,
        transparent: true,
        opacity: 0.15
    });

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.1;
        mouseY = (event.clientY - windowHalfY) * 0.1;
    });

    // Lines container - recreate geometry every frame for dynamics
    let linesMesh;

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Parallax cursor effect
        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y + 50) * 0.05;
        camera.lookAt(scene.position);

        // Rotate ambient particles
        particlesMesh.rotation.y = elapsedTime * 0.02;
        particlesMesh.rotation.x = elapsedTime * 0.01;

        // Move main nodes
        nodes.forEach(node => {
            node.position.add(node.userData.velocity);
            node.rotation.x += 0.01;
            node.rotation.y += 0.01;

            // Bounce off boundaries
            if (node.position.x > 200 || node.position.x < -200) node.userData.velocity.x *= -1;
            if (node.position.y > 100 || node.position.y < -100) node.userData.velocity.y *= -1;
            if (node.position.z > 200 || node.position.z < -200) node.userData.velocity.z *= -1;
        });

        // Update connecting lines dynamically
        if (linesMesh) scene.remove(linesMesh);

        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = [];

        // Draw lines between nodes that are close to each other
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = nodes[i].position.distanceTo(nodes[j].position);
                if (dist < 120) {
                    linePositions.push(
                        nodes[i].position.x, nodes[i].position.y, nodes[i].position.z,
                        nodes[j].position.x, nodes[j].position.y, nodes[j].position.z
                    );
                }
            }
        }

        if (linePositions.length > 0) {
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
            scene.add(linesMesh);
        }

        renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

document.addEventListener('DOMContentLoaded', init3DScene);
