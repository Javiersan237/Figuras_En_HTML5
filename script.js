// ==============================================================================
// 1. CONFIGURACIÓN DEL CANVAS Y CENTRO DE PANTALLA
// ==============================================================================
const canvas = document.getElementById('lienzo3D');
const ctx = canvas.getContext('2d');
const CENTRO_X = canvas.width / 2;
const CENTRO_Y = canvas.height / 2;

// Paleta personalizada (violeta / cian / amarillo)
const PALETA = {
    violeta: '#a855f7',               // Aristas de la figura
    cian: '#22d3ee',                  // Acentos de la interfaz
    amarillo: '#facc15',              // Vértices
    ejes: 'rgba(34, 211, 238, 0.22)'  // Ejes cartesianos de guía (cian tenue)
};

// ==============================================================================
// 2. TEMAS 3.1 & 3.2: GEOMETRÍA TRIDIMENSIONAL (MODELOS LOCALES)
// ==============================================================================
// Cada primitiva se define centrada en el origen (0,0,0) con:
//   - vertices: lista de puntos {x, y, z}
//   - aristas:  pares de índices de vértices que forman líneas
// Nota: el eje Y del modelo crece hacia ARRIBA (se invierte al proyectar).
const PRIMITIVAS = {

    // ---- CUBO: 8 vértices / 12 aristas ---------------------------------------
    cubo: {
        nombre: 'Cubo',
        vertices: [
            {x: -80, y: -80, z: -80}, // V0: Inferior Trasero Izq
            {x:  80, y: -80, z: -80}, // V1: Inferior Trasero Der
            {x:  80, y:  80, z: -80}, // V2: Superior Trasero Der
            {x: -80, y:  80, z: -80}, // V3: Superior Trasero Izq
            {x: -80, y: -80, z:  80}, // V4: Inferior Frontal Izq
            {x:  80, y: -80, z:  80}, // V5: Inferior Frontal Der
            {x:  80, y:  80, z:  80}, // V6: Superior Frontal Der
            {x: -80, y:  80, z:  80}  // V7: Superior Frontal Izq
        ],
        aristas: [
            // Cara Trasera (Z = -80)
            [0, 1], [1, 2], [2, 3], [3, 0],
            // Cara Frontal (Z = +80)
            [4, 5], [5, 6], [6, 7], [7, 4],
            // Aristas Longitudinales
            [0, 4], [1, 5], [2, 6], [3, 7]
        ]
    },

    // ---- PIRÁMIDE DE BASE CUADRADA: 5 vértices / 8 aristas -------------------
    piramide: {
        nombre: 'Pirámide base cuadrada',
        vertices: [
            {x: -80, y: -70, z: -80}, // V0: Base Trasera Izq
            {x:  80, y: -70, z: -80}, // V1: Base Trasera Der
            {x:  80, y: -70, z:  80}, // V2: Base Frontal Der
            {x: -80, y: -70, z:  80}, // V3: Base Frontal Izq
            {x:   0, y:  90, z:   0}  // V4: Ápice
        ],
        aristas: [
            // Base cuadrada
            [0, 1], [1, 2], [2, 3], [3, 0],
            // Aristas laterales hacia el ápice
            [0, 4], [1, 4], [2, 4], [3, 4]
        ]
    },

    // ---- PRISMA TRIANGULAR: 6 vértices / 9 aristas ---------------------------
    prisma: {
        nombre: 'Prisma triangular',
        vertices: [
            {x: -80, y: -70, z: -80}, // V0: Triángulo trasero, base izq
            {x:  80, y: -70, z: -80}, // V1: Triángulo trasero, base der
            {x:   0, y:  70, z: -80}, // V2: Triángulo trasero, vértice superior
            {x: -80, y: -70, z:  80}, // V3: Triángulo frontal, base izq
            {x:  80, y: -70, z:  80}, // V4: Triángulo frontal, base der
            {x:   0, y:  70, z:  80}  // V5: Triángulo frontal, vértice superior
        ],
        aristas: [
            // Triángulo trasero
            [0, 1], [1, 2], [2, 0],
            // Triángulo frontal
            [3, 4], [4, 5], [5, 3],
            // Aristas longitudinales
            [0, 3], [1, 4], [2, 5]
        ]
    },

    // ---- OCTAEDRO: 6 vértices / 12 aristas -----------------------------------
    octaedro: {
        nombre: 'Octaedro',
        vertices: [
            {x:  100, y:    0, z:    0}, // V0: +X
            {x: -100, y:    0, z:    0}, // V1: -X
            {x:    0, y:  100, z:    0}, // V2: +Y
            {x:    0, y: -100, z:    0}, // V3: -Y
            {x:    0, y:    0, z:  100}, // V4: +Z
            {x:    0, y:    0, z: -100}  // V5: -Z
        ],
        aristas: [
            // Cada vértice se conecta con todos excepto con su opuesto
            [0, 2], [0, 3], [0, 4], [0, 5],
            [1, 2], [1, 3], [1, 4], [1, 5],
            [2, 4], [2, 5],
            [3, 4], [3, 5]
        ]
    }
};

// Primitiva actualmente seleccionada
let primitivaActual = 'cubo';

// ==============================================================================
// 3. TEMA 3.3: PIPELINE DE TRANSFORMACIONES TRIDIMENSIONALES
//    Orden correcto: Escalamiento -> Sesgado -> Rotación -> Traslación
// ==============================================================================
function transformarVertice3D(v, params) {
    let { tx, ty, tz, sx, sy, sz, rx, ry, rz, shxy, shxz } = params;

    // Convertir ángulos a radianes
    let radX = rx * Math.PI / 180;
    let radY = ry * Math.PI / 180;
    let radZ = rz * Math.PI / 180;

    // --- 3.3.2 ESCALAMIENTO (S) ---
    let x1 = v.x * sx;
    let y1 = v.y * sy;
    let z1 = v.z * sz;

    // --- 3.3.4 SESGADO / SHEAR (Sh) ---
    let x2 = x1 + (shxy * y1) + (shxz * z1);
    let y2 = y1;
    let z2 = z1;

    // --- 3.3.3 ROTACIÓN EN EJE X (Pitch) ---
    let x3 = x2;
    let y3 = y2 * Math.cos(radX) - z2 * Math.sin(radX);
    let z3 = y2 * Math.sin(radX) + z2 * Math.cos(radX);

    // --- 3.3.3 ROTACIÓN EN EJE Y (Yaw) ---
    let x4 = x3 * Math.cos(radY) + z3 * Math.sin(radY);
    let y4 = y3;
    let z4 = -x3 * Math.sin(radY) + z3 * Math.cos(radY);

    // --- 3.3.3 ROTACIÓN EN EJE Z (Roll) ---
    let x5 = x4 * Math.cos(radZ) - y4 * Math.sin(radZ);
    let y5 = x4 * Math.sin(radZ) + y4 * Math.cos(radZ);
    let z5 = z4;

    // --- 3.3.1 TRASLACIÓN (T) ---
    let xFinal = x5 + tx;
    let yFinal = y5 + ty;
    let zFinal = z5 + tz;

    return { x: xFinal, y: yFinal, z: zFinal };
}

// ==============================================================================
// 4. TEMA 3.1: PROYECCIÓN PERSPECTIVA (3D A PANTALLA 2D)
// ==============================================================================
function proyectar3Da2D(v3d) {
    const distanciaCamara = 500;

    let zAjustado = v3d.z + distanciaCamara;
    if (zAjustado < 1) zAjustado = 1;

    // Factor de escala por perspectiva (división entre Z): d / (z + d)
    let factorProyeccion = distanciaCamara / zAjustado;

    // Mapeo a píxeles en el lienzo
    let x2d = CENTRO_X + (v3d.x * factorProyeccion);
    let y2d = CENTRO_Y - (v3d.y * factorProyeccion); // Inversión en eje Y

    return { x: x2d, y: y2d };
}

// ==============================================================================
// 5. BUCLE DE RENDERIZADO EN TIEMPO REAL
// ==============================================================================
function renderizar() {
    // 1. Obtener parámetros del panel
    const params = {
        tx: parseFloat(document.getElementById('tx').value),
        ty: parseFloat(document.getElementById('ty').value),
        tz: parseFloat(document.getElementById('tz').value),
        sx: parseFloat(document.getElementById('sx').value),
        sy: parseFloat(document.getElementById('sy').value),
        sz: parseFloat(document.getElementById('sz').value),
        rx: parseFloat(document.getElementById('rx').value),
        ry: parseFloat(document.getElementById('ry').value),
        rz: parseFloat(document.getElementById('rz').value),
        shxy: parseFloat(document.getElementById('shxy').value),
        shxz: parseFloat(document.getElementById('shxz').value)
    };

    // 2. Actualizar indicadores numéricos
    document.getElementById('valTx').innerText = params.tx;
    document.getElementById('valTy').innerText = params.ty;
    document.getElementById('valTz').innerText = params.tz;
    document.getElementById('valSx').innerText = params.sx.toFixed(1);
    document.getElementById('valSy').innerText = params.sy.toFixed(1);
    document.getElementById('valSz').innerText = params.sz.toFixed(1);
    document.getElementById('valRx').innerText = params.rx + '°';
    document.getElementById('valRy').innerText = params.ry.toFixed(1) + '°';
    document.getElementById('valRz').innerText = params.rz + '°';
    document.getElementById('valShXY').innerText = params.shxy.toFixed(1);
    document.getElementById('valShXZ').innerText = params.shxz.toFixed(1);

    // 3. Limpiar lienzo
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 4. Dibujar ejes cartesianos de guía
    ctx.strokeStyle = PALETA.ejes;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CENTRO_X, 0); ctx.lineTo(CENTRO_X, canvas.height);
    ctx.moveTo(0, CENTRO_Y); ctx.lineTo(canvas.width, CENTRO_Y);
    ctx.stroke();

    // 5. Obtener la primitiva activa y aplicar transformaciones 3D
    const modelo = PRIMITIVAS[primitivaActual];
    let verticesTransformados = modelo.vertices.map(v => transformarVertice3D(v, params));

    // 6. Proyectar a coordenadas 2D
    let vertices2D = verticesTransformados.map(proyectar3Da2D);

    // 7. Renderizar aristas (violeta) con grosor = 2 * escala promedio
    const escalaPromedio = (params.sx + params.sy + params.sz) / 3;
    const grosor = 2 * escalaPromedio;
    document.getElementById('valGrosor').innerText = grosor.toFixed(1);

    ctx.strokeStyle = PALETA.violeta;
    ctx.lineWidth = grosor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let arista of modelo.aristas) {
        let p1 = vertices2D[arista[0]];
        let p2 = vertices2D[arista[1]];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    // 8. Renderizar vértices (puntos amarillos)
    ctx.fillStyle = PALETA.amarillo;
    for (let p of vertices2D) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==============================================================================
// 6. SELECTOR DE PRIMITIVA
// ==============================================================================
function actualizarInfoPrimitiva() {
    const m = PRIMITIVAS[primitivaActual];
    document.getElementById('infoPrimitiva').innerText =
        m.vertices.length + ' vértices · ' + m.aristas.length + ' aristas';
}

document.getElementById('primitiva').addEventListener('change', (e) => {
    primitivaActual = e.target.value;
    actualizarInfoPrimitiva();
    renderizar();
});

// ==============================================================================
// 7. RETO: AUTO-ROTACIÓN EN EJE Y (YAW) CON requestAnimationFrame
// ==============================================================================
const INCREMENTO_YAW = 1.2; // Grados por frame
let autoRotando = false;
let idAnimacion = null;

function animarAutoRotacion() {
    if (!autoRotando) return;

    const sliderRy = document.getElementById('ry');
    let yaw = parseFloat(sliderRy.value) + INCREMENTO_YAW;

    // Mantener el ángulo dentro del rango del deslizador [-180, 180]
    if (yaw > 180) yaw -= 360;

    sliderRy.value = yaw.toFixed(1);
    renderizar();

    idAnimacion = requestAnimationFrame(animarAutoRotacion);
}

document.getElementById('btnAuto').addEventListener('click', (e) => {
    autoRotando = !autoRotando;

    if (autoRotando) {
        e.target.innerText = '⏸ Detener auto-rotación';
        e.target.classList.add('activo');
        idAnimacion = requestAnimationFrame(animarAutoRotacion);
    } else {
        e.target.innerText = '▶ Iniciar auto-rotación';
        e.target.classList.remove('activo');
        cancelAnimationFrame(idAnimacion);
    }
});

// ==============================================================================
// 8. EVENTOS E INICIALIZACIÓN
// ==============================================================================
// Escuchar cambios en los deslizadores para refrescar en tiempo real
document.querySelectorAll('input[type=range]').forEach(input => {
    input.addEventListener('input', renderizar);
});

// Ejecución inicial
actualizarInfoPrimitiva();
renderizar();
