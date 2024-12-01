import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// Initialize scene
const container = document.getElementById('hero-model');
const canvas = container.querySelector('canvas');
const loader = document.getElementById('model-loader');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#012833');

// Camera
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 3, 0.5);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.setClearColor('#012833', 1);

// Animation control
let isAnimating = true;
let animationFrameId = null;
let autoRotate = true;
const ROTATION_SPEED = 0.005;

// Load HDR Environment Map
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/brown_photostudio_06_1k.hdr', 
    function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        
        // After HDR is loaded, load the model
        loadModel();
    },
    undefined,
    function(error) {
        console.error('Error loading HDR:', error);
        // If HDR fails to load, continue with model loading
        loadModel();
    }
);

// Load 3D Model
function loadModel() {
    const gltfLoader = new GLTFLoader();
    
    try {
        gltfLoader.load(
            './book_and_pencil_set/scene.gltf',
            (gltf) => {
                const model = gltf.scene;
                
                // Traverse the model and update materials
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        if (child.material) {
                            child.material.envMapIntensity = 2;
                            child.material.needsUpdate = true;
                        }
                    }
                });
                
                // Scale and position
                model.scale.set(5, 5, 5);
                model.position.set(0, 0.1, 1.6);
                model.rotation.set(-1.36, 0, 0);
                
                scene.add(model);

                // Hide loader
                if (loader) {
                    loader.style.display = 'none';
                }

                // Store model reference for rotation
                window.model = model;

                animate();
            },
            // Progress callback
            (progress) => {
                const percentComplete = (progress.loaded / progress.total) * 100;
                console.log(`Loading: ${percentComplete}% completed`);
            },
            // Error callback
            (error) => {
                console.error('Error loading model:', error);
                if (loader) {
                    loader.innerHTML = `
                        <div class="text-center p-4">
                            <div class="text-white mb-2">Error loading 3D model</div>
                            <div class="text-sm text-gray-300">Please try refreshing the page</div>
                        </div>
                    `;
                }
            }
        );
    } catch (error) {
        console.error('Error in model loading setup:', error);
    }
}

// Handle resize
const handleResize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
};

window.addEventListener('resize', handleResize);

// Animation loop
function animate() {
    if (!isAnimating) return;

    animationFrameId = requestAnimationFrame(animate);
    
    if (window.model && autoRotate) {
        window.model.rotation.y += ROTATION_SPEED;
    }
    
    renderer.render(scene, camera);
}

// Cleanup function
function cleanup() {
    isAnimating = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Dispose of scene resources
    scene.traverse(object => {
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            if (object.material.map) object.material.map.dispose();
            object.material.dispose();
        }
    });
    
    if (scene.environment) {
        scene.environment.dispose();
    }
    
    renderer.dispose();
    window.removeEventListener('resize', handleResize);
}

// Export cleanup if needed
export { cleanup };

// Force scroll to top on page load/refresh
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

// Alternative method
document.addEventListener('DOMContentLoaded', function() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOpenIcon = document.querySelector('.menu-open');
    const menuCloseIcon = document.querySelector('.menu-close');
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        // Toggle menu visibility
        mobileMenu.classList.toggle('hidden');
        
        // Toggle icons
        menuOpenIcon.style.opacity = isMenuOpen ? '0' : '1';
        menuCloseIcon.style.opacity = isMenuOpen ? '1' : '0';
        
        // Optional: Prevent body scrolling when menu is open
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    // Toggle menu on button click
    menuButton.addEventListener('click', toggleMenu);

    // Close menu when clicking menu items
    const menuItems = mobileMenu.querySelectorAll('a');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu();
        });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (isMenuOpen && 
            !mobileMenu.contains(e.target) && 
            !menuButton.contains(e.target)) {
            toggleMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    });

    // Close menu on resize if screen becomes larger than mobile breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && isMenuOpen) { // 768px is the md breakpoint
            toggleMenu();
        }
    });
});




    
   