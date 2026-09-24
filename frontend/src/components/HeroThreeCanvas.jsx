import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * HeroThreeCanvas
 * Ultra-smooth interactive 3D WebGL background.
 * Features:
 * - 3D Multi-colored particle nebula with smooth orbiting motion
 * - Interactive 3D Wireframe Icosahedron & Neon Torus Rings
 * - Real-time mouse ray parallax with smooth inertia damping
 * - Full memory/context cleanup on component unmount
 */
const HeroThreeCanvas = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 600;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 25;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. 3D Particle Starfield
    const particleCount = 850;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color("#6366f1"), // Indigo
      new THREE.Color("#a855f7"), // Purple
      new THREE.Color("#06b6d4"), // Cyan
      new THREE.Color("#ec4899"), // Pink
      new THREE.Color("#3b82f6"), // Blue
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 7 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.7;
      positions[i3 + 2] = radius * Math.cos(phi) * 0.85;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Particle sprite canvas
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.3, "rgba(255,255,255,0.75)");
      grad.addColorStop(0.7, "rgba(255,255,255,0.15)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.42,
      map: particleTexture,
      transparent: true,
      opacity: 0.7,
      vertexColors: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 4. 3D Floating Geometry Cluster in Right Half
    const clusterGroup = new THREE.Group();
    clusterGroup.position.set(7.5, 0, -3);
    scene.add(clusterGroup);

    // Dynamic Wireframe Torus Rings
    const torusGeo1 = new THREE.TorusGeometry(6, 0.035, 16, 100);
    const ring1 = new THREE.Mesh(
      torusGeo1,
      new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.3 })
    );
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    clusterGroup.add(ring1);

    const torusGeo2 = new THREE.TorusGeometry(7.6, 0.03, 16, 100);
    const ring2 = new THREE.Mesh(
      torusGeo2,
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.25 })
    );
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 4;
    clusterGroup.add(ring2);

    // Floating 3D Geometric Mesh Core
    const coreGeo = new THREE.IcosahedronGeometry(3.2, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      roughness: 0.1,
      metalness: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    clusterGroup.add(coreMesh);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 2.5, 50);
    pointLight1.position.set(10, 12, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 40);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // 6. Smooth Mouse Parallax Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouse.targetX = (clientX / rect.width) * 2 - 1;
      mouse.targetY = -(clientY / rect.height) * 2 + 1;
    };

    const handleMouseLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    // 7. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 8. Animation Loop
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Damped interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Rotate group
      clusterGroup.rotation.y = elapsedTime * 0.12 + mouse.x * 0.45;
      clusterGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.1 - mouse.y * 0.25;

      ring1.rotation.z += 0.005;
      ring2.rotation.y -= 0.004;
      coreMesh.rotation.y += 0.003;
      coreMesh.rotation.x += 0.002;

      // Particle drift
      particles.rotation.y = elapsedTime * 0.02 + mouse.x * 0.08;
      particles.rotation.x = mouse.y * 0.06;

      // Camera parallax
      camera.position.x = mouse.x * 2.2;
      camera.position.y = mouse.y * 1.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      torusGeo1.dispose();
      torusGeo2.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.9 }}
      aria-hidden="true"
    />
  );
};

export default HeroThreeCanvas;
