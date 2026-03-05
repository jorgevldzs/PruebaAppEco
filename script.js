        // ════════════════════════════════════
        // NAVIGATION
        // ════════════════════════════════════
        let prevScreen = 'home';
        let cameraStream = null;

        function showScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-' + id).classList.add('active');
        }

        function goToHome() {
            stopCamera();
            showScreen('home');
            prevScreen = 'home';
        }

        function goToScan() {
            prevScreen = getCurrentScreen();
            showScreen('scan');
            startCamera();
        }

        function goToMap() {
            prevScreen = getCurrentScreen();
            showScreen('map');
        }

        function goBack() {
            stopCamera();
            if (prevScreen === 'result') showScreen('home');
            else showScreen(prevScreen || 'home');
            prevScreen = 'home';
        }

        function getCurrentScreen() {
            const active = document.querySelector('.screen.active');
            return active ? active.id.replace('screen-', '') : 'home';
        }

        // ════════════════════════════════════
        // CAMERA
        // ════════════════════════════════════
        async function startCamera() {
            const video = document.getElementById('video');
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
                });
                video.srcObject = cameraStream;
                video.style.display = 'block';
                document.getElementById('canvas-capture').style.display = 'none';
            } catch (e) {
                document.getElementById('camera-hint').textContent = '📁 Usa galería (cámara no disponible)';
            }
        }

        function stopCamera() {
            if (cameraStream) {
                cameraStream.getTracks().forEach(t => t.stop());
                cameraStream = null;
            }
        }

        function toggleFlash() {
            const icon = document.getElementById('flash-icon');
            icon.textContent = icon.textContent === '🔦' ? '💡' : '🔦';
            showToast(icon.textContent === '💡' ? 'Flash activado' : 'Flash desactivado');
        }

        // ════════════════════════════════════
        // CAPTURE & ANALYZE (mock)
        // ════════════════════════════════════
        function capturePhoto() {
            const video = document.getElementById('video');
            const canvas = document.getElementById('canvas-capture');
            const ctx = canvas.getContext('2d');

            // If real camera available
            if (cameraStream && video.videoWidth > 0) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                stopCamera();
                analyzeImageMock(imageData);
            } else {
                // Trigger file input as fallback
                document.getElementById('fileInputScan').click();
            }
        }

        document.getElementById('fileInputScan').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.getElementById('canvas-capture');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    canvas.getContext('2d').drawImage(img, 0, 0);
                    const imageData = canvas.toDataURL('image/jpeg', 0.8);
                    stopCamera();
                    analyzeImageMock(imageData);
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        });

        // ════════════════════════════════════
        // MOCK DATA
        // ════════════════════════════════════
        const mockResults = [
            {
                tipo: 'reciclable',
                nombre: 'Botella PET',
                descripcion: 'Botella de plástico PET (Polietileno Tereftalato). Una de las más reciclables del mundo. El 80% se puede convertir en nuevas botellas o fibra textil.',
                instrucciones: 'Enjuaga y aplasta antes de tirar. Retira la tapa y tírala por separado. Va al contenedor amarillo o azul según tu colonia.',
                bote: { emoji: '🔵', titulo: 'Contenedor Azul (Reciclables)', desc: 'Plástico, vidrio, metal y cartón limpio', color: '#4dabf7', bg: 'rgba(77,171,247,0.15)' },
                badge: { text: '♻️ Reciclable', bg: 'rgba(77,171,247,0.2)', color: '#4dabf7' }
            },
            {
                tipo: 'orgánico',
                nombre: 'Residuo Orgánico',
                descripcion: 'Material biodegradable de origen vegetal o animal. Se descompone naturalmente y puede convertirse en composta de alta calidad para plantas.',
                instrucciones: 'Ponlo en bolsa compostable o periódico. Va al contenedor gris o verde según tu delegación. Ideal para hacer composta en casa.',
                bote: { emoji: '🟢', titulo: 'Contenedor Gris (Orgánicos)', desc: 'Restos de comida, hojas, madera y más', color: '#b5ff4d', bg: 'rgba(181,255,77,0.15)' },
                badge: { text: '🌱 Orgánico', bg: 'rgba(181,255,77,0.2)', color: '#b5ff4d' }
            },
            {
                tipo: 'no reciclable',
                nombre: 'Residuo No Reciclable',
                descripcion: 'Material que no puede ser reciclado en los programas convencionales. Incluye plásticos multicapa, papeles sucios o materiales mixtos contaminados.',
                instrucciones: 'Va directo al contenedor negro o residual. Intenta reducir este tipo de basura eligiendo productos con menos empaques o más eco-friendly.',
                bote: { emoji: '⚫', titulo: 'Contenedor Negro (Residual)', desc: 'Lo que no puede reciclarse ni compostar', color: '#a0aec0', bg: 'rgba(160,174,192,0.15)' },
                badge: { text: '🗑️ No Reciclable', bg: 'rgba(160,174,192,0.2)', color: '#a0aec0' }
            },
            {
                tipo: 'peligroso',
                nombre: 'Residuo Peligroso',
                descripcion: 'Material que contiene sustancias tóxicas, corrosivas o inflamables. Si se tira mal puede contaminar suelo y agua por décadas.',
                instrucciones: 'Nunca lo tires a la basura común. Llévalo a un Punto Verde de la CDMX o al centro de acopio más cercano. Muchas ferreterías y tiendas también los reciben.',
                bote: { emoji: '🟡', titulo: 'Punto Verde Especial ⚠️', desc: 'Pilas, electrónicos, medicamentos, tintas', color: '#ffd60a', bg: 'rgba(255,214,10,0.15)' },
                badge: { text: '⚠️ Peligroso', bg: 'rgba(255,214,10,0.2)', color: '#ffd60a' }
            }
        ];

        function analyzeImageMock(imageData) {
            showScreen('result');
            document.getElementById('loading-overlay').classList.add('show');

            setTimeout(() => {
                document.getElementById('loading-overlay').classList.remove('show');

                // Random result
                const result = mockResults[Math.floor(Math.random() * mockResults.length)];
                displayResult(imageData, result);
                prevScreen = 'scan';
            }, 1800);
        }

        function displayResult(imageData, result) {
            document.getElementById('result-img').src = imageData;

            // Badge
            const badge = document.getElementById('result-badge');
            badge.textContent = result.badge.text;
            badge.style.background = result.badge.bg;
            badge.style.color = result.badge.color;
            badge.style.border = `1.5px solid ${result.badge.color}`;

            // Card
            document.getElementById('res-name').textContent = result.nombre;
            const catEl = document.getElementById('res-cat');
            catEl.textContent = result.tipo.charAt(0).toUpperCase() + result.tipo.slice(1);
            catEl.style.color = result.badge.color;
            document.getElementById('res-desc').textContent = result.descripcion;
            document.getElementById('res-instruc').textContent = result.instrucciones;

            // Bin card
            const binCard = document.getElementById('bin-card');
            binCard.style.background = result.bote.bg;
            binCard.style.border = `1.5px solid ${result.bote.color}30`;
            document.getElementById('bin-emoji').textContent = result.bote.emoji;
            document.getElementById('bin-title').textContent = result.bote.titulo;
            document.getElementById('bin-title').style.color = result.bote.color;
            document.getElementById('bin-desc').textContent = result.bote.desc;

            // Scroll to top
            document.getElementById('screen-result').scrollTop = 0;
        }

        // ════════════════════════════════════
        // TOAST
        // ════════════════════════════════════
        let toastTimer;
        function showToast(msg) {
            const t = document.getElementById('toast');
            t.textContent = msg;
            t.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
        }
