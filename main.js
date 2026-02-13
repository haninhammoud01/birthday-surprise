document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIG ---
    const config = {
        colors: {
            bg: 0x0a0a12,
            table: 0xf0f0f5,
        }
    };

    // --- TERMINAL ---
    const terminalLines = [ 
        '> initializing connection to my favorite person...', 
        '...',
        '> connecting to bubby\'s heart...',
        '...', 
        '> happy valentine\'s day & happy birthday, bubby :3', 
        '...', 
        '> preparing a small, elegant moment for you ^^',
        '...', 
        '> !(◕‿◕)? !(◕‿◕)? !(◕‿◕)?', 
        '...', 
        '> loading ...', 
        '> [████████████████████] 100%'
    ];

    async function typeTerminal() {
        const terminal = document.getElementById('terminal-content');
        for (let lineIndex = 0; lineIndex < terminalLines.length; lineIndex++) {
            const currentLine = terminalLines[lineIndex];
            const lineDiv = document.createElement('div');
            lineDiv.className = 'terminal-line';
            lineDiv.id = 'line-' + lineIndex;
            terminal.appendChild(lineDiv);

            for (let charIndex = 0; charIndex < currentLine.length; charIndex++) {
                lineDiv.textContent = currentLine.substring(0, charIndex + 1) + '█';
                await new Promise(r => setTimeout(r, 60));
            }
            lineDiv.textContent = currentLine;
            await new Promise(r => setTimeout(r, 300));
        }
        setTimeout(() => { 
            document.getElementById('terminal').classList.add('hidden'); 
            startExperience(); 
        }, 1000);
    }
    typeTerminal();

    // --- THREE.JS SETUP ---
    let scene, camera, renderer, cakeGroup;
    let greetingCard;
    let candlesBlown = false, cardOpen = false, raycaster, mouse;
    let hands, videoElement, isBlowing = false, prayerHands = false, blowStartTime = 0;
    
    // Rotation & Interaction
    let targetRotationX = 0, targetRotationY = 0;
    let currentRotationX = 0, currentRotationY = 0;
    let isDragging = false;
    let windParticles = [];

    function startExperience() {
        document.getElementById('container').classList.add('visible');
        initThree();
    }

    function initThree() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(config.colors.bg);
        scene.fog = new THREE.FogExp2(config.colors.bg, 0.03);

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 2.5, 7);
        camera.lookAt(0, 1, 0);

        renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas3d'), antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        // --- LIGHTING ---
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const spotLight = new THREE.SpotLight(0xfffaed, 1.5);
        spotLight.position.set(3, 8, 5);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.5;
        spotLight.castShadow = true;
        spotLight.shadow.bias = -0.0001;
        scene.add(spotLight);

        const rimLight = new THREE.SpotLight(0x4a9eff, 2.0);
        rimLight.position.set(-5, 5, -5);
        rimLight.lookAt(0,0,0);
        scene.add(rimLight);

        // --- BUILD SCENE ---
        createFloatingHearts(); // Fixed shape
        createTable();
        createCake(); // Silverqueen style + 5 Candles
        createPhotoFrame();
        createBouquet(); // Fixed flowers
        createGreetingCard(); // Fixed open book card

        // --- EVENTS ---
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        const canvas = document.getElementById('canvas3d');
        canvas.addEventListener('mousedown', () => isDragging = true);
        canvas.addEventListener('mouseup', () => isDragging = false);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('click', onCanvasClick);
        window.addEventListener('resize', onWindowResize);

        animate();
    }

    // --- OBJECTS ---

    function createTable() {
        const tableGroup = new THREE.Group();
        const tableTop = new THREE.Mesh(
            new THREE.BoxGeometry(12, 0.4, 9), 
            new THREE.MeshStandardMaterial({ color: config.colors.table, roughness: 0.1, metalness: 0.1 })
        );
        tableTop.position.y = -0.1;
        tableTop.receiveShadow = true;
        tableGroup.add(tableTop);
        
        const legGeo = new THREE.CylinderGeometry(0.2, 0.1, 3.5, 32);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, metalness: 0.8, roughness: 0.2 });
        
        [[-5.5, -4], [5.5, -4], [-5.5, 4], [5.5, 4]].forEach(pos => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(pos[0], -1.8, pos[1]);
            leg.castShadow = true;
            leg.receiveShadow = true;
            tableGroup.add(leg);
        });
        scene.add(tableGroup);
    }

    function createPhotoFrame() {
        const group = new THREE.Group();
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(1.0, 1.3, 0.1), 
            new THREE.MeshStandardMaterial({ color: 0xc5a059, metalness: 0.8, roughness: 0.2 })
        );
        frame.castShadow = true;
        group.add(frame);
        
        const loader = new THREE.TextureLoader();
        let texture;
        try {
            texture = loader.load('love.jpeg'); 
        } catch(e) { texture = null; }

        const photo = new THREE.Mesh(
            new THREE.PlaneGeometry(0.8, 1.05), 
            new THREE.MeshStandardMaterial({ map: texture || null, color: texture ? 0xffffff : 0xffe0e0, roughness: 0.4 })
        );
        photo.position.z = 0.06;
        group.add(photo);
        
        group.position.set(-3.5, 1.5, 0);
        group.rotation.y = Math.PI / 6;
        scene.add(group);
    }

    // --- FIXED: GREETING CARD (OPEN BOOK STYLE) ---
    function createGreetingCard() {
        const group = new THREE.Group();

        // Texture
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0,0,0,512);
        grad.addColorStop(0, '#880e4f'); grad.addColorStop(1, '#d81b60'); // Pink gradient
        ctx.fillStyle = grad; ctx.fillRect(0,0,512,512);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.strokeRect(20,20,472,472);
        
        // Text
        ctx.fillStyle = '#fff'; ctx.font='bold 70px Georgia'; ctx.textAlign='center';
        ctx.fillText('Happy', 256, 200);
        ctx.fillText('Birthday', 256, 280);
        
        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.3 });

        const width = 1.5;
        const height = 1.0;
        const depth = 0.02;

        // Left Page
        const leftPage = new THREE.Mesh(new THREE.BoxGeometry(width/2, height, depth), mat);
        leftPage.position.set(-width/4, 0, 0);
        leftPage.rotation.z = 0.2; // Slight angle up
        leftPage.rotation.y = -0.2; // Open angle
        
        // Right Page
        const rightPage = new THREE.Mesh(new THREE.BoxGeometry(width/2, height, depth), mat);
        rightPage.position.set(width/4, 0, 0);
        rightPage.rotation.z = 0.2;
        rightPage.rotation.y = 0.2; // Open angle

        // Spine (Middle)
        const spine = new THREE.Mesh(new THREE.BoxGeometry(0.02, height, depth+0.02), new THREE.MeshStandardMaterial({ color: 0x5e0028 }));
        spine.position.set(0, 0, 0);
        spine.rotation.z = 0.2;

        group.add(leftPage);
        group.add(rightPage);
        group.add(spine);

        // Click Target
        const hitPlane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ visible: false }));
        hitPlane.rotation.x = -Math.PI / 2;
        hitPlane.position.y = 0.02;
        hitPlane.userData.isCard = true;
        group.add(hitPlane);

        group.position.set(2.5, 0.1, 2.0);
        group.rotation.x = -Math.PI / 2;
        scene.add(group);
        greetingCard = group;
    }

    // --- FIXED: BEAUTIFUL FLOWERS ---
    function createBouquet() {
        const group = new THREE.Group();
        
        // Glass Vase
        const vase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.2, 2.0, 32), 
            new THREE.MeshPhysicalMaterial({ 
                color: 0xffffff, transmission: 0.95, opacity: 1, transparent: true,
                roughness: 0, metalness: 0, ior: 1.5, thickness: 0.5 
            })
        );
        vase.position.y = 1.0;
        group.add(vase);

        // Create Flowers (Roses)
        const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
        
        for(let i=0; i<6; i++) {
            const flowerGroup = new THREE.Group();
            
            // Stem
            const stem = new THREE.Mesh(stemGeo, stemMat);
            stem.position.y = 0.75;
            flowerGroup.add(stem);
            
            // Rose Bud (Cone)
            const roseColor = i % 2 === 0 ? 0xe91e63 : 0xaa00ff; // Pink and Purple
            const budMat = new THREE.MeshStandardMaterial({ color: roseColor, roughness: 0.2 });
            const bud = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 10), budMat);
            bud.position.y = 1.6;
            flowerGroup.add(bud);

            // Petals surrounding bud
            for(let p=0; p<6; p++) {
                const angle = (p / 6) * Math.PI * 2;
                const petal = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), budMat);
                petal.position.set(Math.cos(angle)*0.1, 1.55, Math.sin(angle)*0.1);
                petal.scale.set(1, 0.6, 1);
                flowerGroup.add(petal);
            }

            flowerGroup.position.set(
                (Math.random() - 0.5) * 0.3,
                1.8 + Math.random() * 0.4,
                (Math.random() - 0.5) * 0.3
            );
            flowerGroup.rotation.x = (Math.random() - 0.5) * 0.3;
            flowerGroup.rotation.z = (Math.random() - 0.5) * 0.3;
            group.add(flowerGroup);
        }
        group.position.set(3.5, 0.15, -1);
        scene.add(group);
    }

    // --- NEW: SILVERQUEEN CHOCOLATE CAKE + 5 CANDLES ---
    function createCake() {
        cakeGroup = new THREE.Group();
        
        // Materials
        const matSponge = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 }); // Dark Chocolate
        const matGanache = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.3 }); // Lighter Glaze
        const matChocoBar = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.2 }); // Silverqueen Bar

        // --- Bottom Layer ---
        const b1 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.5, 64), matSponge); 
        b1.position.y = 0.25; b1.castShadow = true; b1.receiveShadow = true;
        cakeGroup.add(b1);
        const g1 = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 0.1, 64), matGanache); g1.position.y = 0.55; cakeGroup.add(g1);

        // --- Middle Layer ---
        const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.4, 64), matSponge); 
        b2.position.y = 0.85; b2.castShadow = true; 
        cakeGroup.add(b2);
        const g2 = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.1, 64), matGanache); g2.position.y = 1.1; cakeGroup.add(g2);

        // --- Top Layer ---
        const b3 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.3, 64), matSponge); 
        b3.position.y = 1.35; b3.castShadow = true; 
        cakeGroup.add(b3);
        const g3 = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 64), matGanache); g3.position.y = 1.55; cakeGroup.add(g3);

        // --- SILVERQUEEN DECORATION ---
        // Chocolate Drips
        for(let i=0; i<12; i++) {
            const angle = (i/12) * Math.PI * 2;
            const drip = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.3, 8), matGanache);
            drip.position.set(Math.cos(angle)*0.9, 1.05, Math.sin(angle)*0.9);
            cakeGroup.add(drip);
        }

        // Chocolate Squares on top (Silverqueen style)
        for(let i=0; i<6; i++) {
            const angle = (i/6) * Math.PI * 2;
            const sq = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.3), matChocoBar);
            sq.position.set(Math.cos(angle)*0.45, 1.62, Math.sin(angle)*0.45);
            sq.rotation.y = -angle + Math.PI/4;
            cakeGroup.add(sq);
        }

        // --- 5 CANDLES ---
        window.flames = [];
        window.flameLights = [];
        
        // Positions for 5 candles in a small circle on top
        for(let i=0; i<5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const x = Math.cos(angle) * 0.35;
            const z = Math.sin(angle) * 0.35;

            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4), new THREE.MeshLambertMaterial({color:0xffffff}));
            body.position.set(x, 1.8, z); cakeGroup.add(body);
            
            const flameGeo = new THREE.ConeGeometry(0.04, 0.12, 8);
            const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
            const flame = new THREE.Mesh(flameGeo, flameMat);
            flame.position.set(x, 2.1, z);
            cakeGroup.add(flame);
            window.flames.push(flame);
            
            const light = new THREE.PointLight(0xffaa00, 0.8, 2);
            light.position.set(x, 2.0, z);
            cakeGroup.add(light);
            window.flameLights.push(light);
        }

        scene.add(cakeGroup);
    }

    // --- FIXED: FLOATING HEARTS (PROPER SHAPE) ---
    function createFloatingHearts() {
        // Shape Definition (Proper Orientation)
        const x = 0, y = 0;
        const heartShape = new THREE.Shape();
        
        heartShape.moveTo( x + 0.25, y + 0.25 );
        heartShape.bezierCurveTo( x + 0.25, y + 0.25, x + 0.20, y, x, y );
        heartShape.bezierCurveTo( x - 0.30, y, x - 0.30, y + 0.35,x - 0.30, y + 0.35 );
        heartShape.bezierCurveTo( x - 0.30, y + 0.55, x - 0.10, y + 0.77, x + 0.25, y + 0.95 );
        heartShape.bezierCurveTo( x + 0.60, y + 0.77, x + 0.80, y + 0.55, x + 0.80, y + 0.35 );
        heartShape.bezierCurveTo( x + 0.80, y + 0.35, x + 0.80, y, x + 0.50, y );
        heartShape.bezierCurveTo( x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25 );

        const meshGeo = new THREE.ExtrudeGeometry(heartShape, {depth:0.05, bevelEnabled:false});
        // Center the geometry
        meshGeo.center();
        
        const meshMat = new THREE.MeshBasicMaterial({ color: 0xff4081, transparent: true, opacity: 0.8, side: THREE.DoubleSide });

        for(let i=0; i<15; i++) {
            const mesh = new THREE.Mesh(meshGeo, meshMat);
            mesh.scale.set(0.2, 0.2, 0.2);
            mesh.position.set((Math.random()-0.5)*12, Math.random()*3+1, (Math.random()-0.5)*10 - 3);
            mesh.userData = { 
                isHeart: true,
                speed: 0.005 + Math.random()*0.01, 
                offset: Math.random()*Math.PI 
            };
            scene.add(mesh);
        }
    }

    function spawnWindParticle(pos) {
        if(Math.random() > 0.3) return; 
        const geo = new THREE.BoxGeometry(0.02, 0.02, 0.02);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent:true, opacity:0.8 });
        const p = new THREE.Mesh(geo, mat);
        p.position.copy(pos);
        p.position.y += 0.1;
        p.userData = { life: 1.0, velocity: new THREE.Vector3((Math.random()-0.5)*0.1, -0.1 - Math.random()*0.1, (Math.random()-0.5)*0.1) };
        scene.add(p);
        windParticles.push(p);
    }

    // --- LOGIC ---
    function onMouseMove(e) {
        if (isDragging) {
            targetRotationY += e.movementX * 0.005;
            targetRotationX += e.movementY * 0.005;
            targetRotationX = Math.max(-0.5, Math.min(0.5, targetRotationX));
        }
    }

    function onCanvasClick(e) {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0 && intersects[0].object.userData.isCard && !cardOpen) {
            openGreetingCard();
        }
    }

    window.closeCardPopup = function() {
        document.getElementById('birthdayCardPopup').classList.remove('visible');
        cardOpen = true;
        initMediaPipe();
    }

    function openGreetingCard() {
        document.getElementById('birthdayCardPopup').classList.add('visible');
    }

    // --- MEDIAPIPE ---
    function initMediaPipe() {
        document.getElementById('loading').style.display = 'block';
        videoElement = document.getElementById('videoElement');
        const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
        hands.setOptions({maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6});
        hands.onResults(onResults);
        const camera = new Camera(videoElement, {onFrame: async () => { await hands.send({image: videoElement}); }, width: 640, height: 480});
        camera.start();
    }

    function onResults(results) {
        document.getElementById('loading').style.display = 'none';
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0 && !candlesBlown) {
            const lm = results.multiHandLandmarks[0];
            const tips = [4,8,12,16,20];
            const avg = tips.reduce((acc, i) => ({x: acc.x+lm[i].x, y: acc.y+lm[i].y}), {x:0,y:0});
            avg.x /= 5; avg.y /= 5;
            const isClose = tips.every(i => Math.hypot(lm[i].x-avg.x, lm[i].y-avg.y) < 0.08);
            
            if (isClose) {
                if (!prayerHands) {
                    prayerHands = true;
                    isBlowing = true;
                    blowStartTime = performance.now();
                }
                window.flames.forEach(f => spawnWindParticle(f.position));
            } else {
                prayerHands = false;
                isBlowing = false;
            }
        } else {
            prayerHands = false; isBlowing = false;
        }
    }

    // --- ANIMATION LOOP ---
    function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();

        currentRotationY += (targetRotationY - currentRotationY) * 0.05;
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;
        
        // FIXED: Removed auto-rotation (targetRotationY += 0.001)
        // It stays still now unless dragged.

        scene.rotation.y = currentRotationY;
        scene.rotation.x = currentRotationX;

        scene.traverse(obj => {
            if(obj.userData.speed) {
                obj.position.y += Math.sin(performance.now() * 0.002 + obj.userData.offset) * obj.userData.speed;
            }
            
            // Make hearts face camera
            if(obj.userData.isHeart) {
                obj.lookAt(camera.position);
            }
        });

        if (window.flames && !candlesBlown) {
            const t = performance.now();
            window.flames.forEach((f, i) => {
                const scale = 1 + Math.sin(t * 0.01 + i) * 0.2;
                f.scale.set(scale, scale, scale);
                window.flameLights[i].intensity = 0.8 + Math.sin(t * 0.01 + i) * 0.3;
            });
        }

        for(let i = windParticles.length - 1; i >= 0; i--) {
            const p = windParticles[i];
            p.position.add(p.userData.velocity);
            p.userData.life -= 0.02;
            p.material.opacity = p.userData.life;
            if(p.userData.life <= 0) {
                scene.remove(p);
                windParticles.splice(i, 1);
            }
        }

        if (isBlowing && !candlesBlown) {
            if (performance.now() - blowStartTime > 2000) {
                blowOutCandles();
            }
        }

        renderer.render(scene, camera);
    }

    function blowOutCandles() {
        candlesBlown = true;
        
        window.flames.forEach((f, i) => {
            new TWEEN.Tween({ s: 1, i: 0.8 })
                .to({ s: 0.01, i: 0 }, 1000)
                .delay(i * 100)
                .onUpdate(function() {
                    f.scale.set(this.s, this.s, this.s);
                    window.flameLights[i].intensity = this.i;
                })
                .start();
        });

        setTimeout(startCelebration, 2000);
    }

    function startCelebration() {
        const el = document.getElementById('celebration');
        el.style.display = 'block';
        
        const colors = ['#ff0', '#f0f', '#0ff', '#f00'];
        for(let i=0; i<50; i++) {
            setTimeout(() => {
                const div = document.createElement('div');
                div.className = 'firework';
                div.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
                div.style.left = '50%'; div.style.top = '50%';
                document.body.appendChild(div);
                
                const angle = Math.random() * Math.PI * 2;
                const dist = 200 + Math.random() * 300;
                const tx = Math.cos(angle) * dist;
                const ty = Math.sin(angle) * dist;
                
                div.animate([
                    { transform: 'translate(0,0) scale(1)', opacity: 1 },
                    { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
                ], { duration: 1000 + Math.random()*1000, easing: 'cubic-bezier(0, .9, .57, 1)' })
                .onfinish = () => div.remove();
            }, i * 50);
        }

        setTimeout(() => el.style.display = 'none', 4000);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});