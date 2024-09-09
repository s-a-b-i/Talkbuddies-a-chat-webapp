// components/LoadingSpinner.js
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const LoadingSpinner = ({ isLoading }) => {
  const mountRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading) return;

    let scene, camera, renderer, spinner;
    const width = 200;
    const height = 200;

    const init = () => {
      // Scene setup
      scene = new THREE.Scene();

      // Camera setup
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      // Renderer setup
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      // Spinner geometry
      const geometry = new THREE.TorusGeometry(1, 0.2, 16, 100);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x6366f1,
        transparent: true,
        opacity: 0.8
      });
      spinner = new THREE.Mesh(geometry, material);
      scene.add(spinner);

      setIsReady(true);
    };

    const animate = () => {
      if (!isLoading) return;
      requestAnimationFrame(animate);
      if (spinner) {
        spinner.rotation.x += 0.01;
        spinner.rotation.y += 0.02;
      }
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    init();
    animate();

    return () => {
      if (mountRef.current && renderer) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if (spinner) {
        spinner.geometry.dispose();
        spinner.material.dispose();
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [isLoading]);

  if (!isLoading || !isReady) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div ref={mountRef} />
    </div>
  );
};

export default LoadingSpinner;