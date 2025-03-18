// Presets de contenedores
const containerPresets = {
    "20ft": { height: 239, width: 235, depth: 590, maxWeight: 28000, safeHeight: 239 },
    "40ft": { height: 239, width: 235, depth: 1200, maxWeight: 30480, safeHeight: 239 },
    "euroPallet": { height: 144, width: 80, depth: 120, maxWeight: 1500, safeHeight: 200 }
};

function applyPreset() {
    console.log("Aplicando preset...");
    const preset = document.getElementById("containerPreset").value;
    if (preset !== "custom") {
        const { height, width, depth, maxWeight, safeHeight } = containerPresets[preset];
        document.getElementById("altoContenedor").value = height;
        document.getElementById("anchoContenedor").value = width;
        document.getElementById("largoContenedor").value = depth;
        document.getElementById("pesoMaxContenedor").value = maxWeight;
        document.getElementById("alturaSegura").value = safeHeight;
    }
    if (window.scene) initThreeJS(); // Reconstruir escena si cambia preset
}

let scene, camera, renderer, products = [];
let cameraDistance = 3; // Distancia inicial de la cámara
let chart; // Variable para el gráfico de Chart.js
let controls; // Para OrbitControls

function initThreeJS() {
    console.log("Inicializando Three.js...");
    if (!window.THREE) {
        console.error("Three.js no está definido. Verifica que la librería se cargó.");
        return;
    }

    // Limpiar escena anterior
    if (scene) {
        while (scene.children.length > 0) scene.remove(scene.children[0]);
        products = [];
    }

    // Configurar escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc); // Fondo gris claro
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Añadir luz
    scene.add(ambientLight);
    camera = new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    document.getElementById('threejs-container').innerHTML = '';
    const canvas = document.getElementById('threejs-container').appendChild(renderer.domElement);

    // Contenedor
    const containerWidth = (parseFloat(document.getElementById("anchoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1;
    const containerHeight = (parseFloat(document.getElementById("altoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1;
    const containerDepth = (parseFloat(document.getElementById("largoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1;
    const containerGeometry = new THREE.BoxGeometry(containerDepth, containerHeight, containerWidth); // X = largo, Y = alto, Z = ancho
    const containerEdges = new THREE.EdgesGeometry(containerGeometry);
    const containerMaterial = new THREE.LineBasicMaterial({ color: 0x808080 });
    const containerWireframe = new THREE.LineSegments(containerEdges, containerMaterial);
    containerWireframe.position.set(containerDepth / 2, containerHeight / 2, containerWidth / 2);
    scene.add(containerWireframe);

    // Ajustar cámara
    const maxDim = Math.max(containerWidth, containerHeight, containerDepth);
    cameraDistance = maxDim * 3; // Distancia inicial
    updateCameraPosition(maxDim, containerWidth, containerHeight, containerDepth);

    // Añadir OrbitControls para rotación
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = maxDim * 0.5;
    controls.maxDistance = maxDim * 10;

    // Añadir listener para zoom con la rueda del mouse
    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        cameraDistance += event.deltaY * 0.005;
        cameraDistance = Math.max(0.5, Math.min(cameraDistance, maxDim * 10));
        updateCameraPosition(maxDim, containerWidth, containerHeight, containerDepth);
    });

    animate();
}

function updateCameraPosition(maxDim, containerWidth, containerHeight, containerDepth) {
    camera.position.set(
        containerDepth / 2 + cameraDistance, // X = largo
        containerHeight / 2 + cameraDistance, // Y = alto
        containerWidth / 2 + cameraDistance // Z = ancho
    );
    camera.lookAt(containerDepth / 2, containerHeight / 2, containerWidth / 2);
}

function zoomIn() {
    const maxDim = Math.max(
        (parseFloat(document.getElementById("anchoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("altoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("largoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1
    );
    cameraDistance -= maxDim * 0.2; // Acercar
    cameraDistance = Math.max(0.5, Math.min(cameraDistance, maxDim * 10));
    updateCameraPosition(maxDim,
        (parseFloat(document.getElementById("anchoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("altoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("largoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1
    );
}

function zoomOut() {
    const maxDim = Math.max(
        (parseFloat(document.getElementById("anchoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("altoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("largoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1
    );
    cameraDistance += maxDim * 0.2; // Alejar
    cameraDistance = Math.max(0.5, Math.min(cameraDistance, maxDim * 10));
    updateCameraPosition(maxDim,
        (parseFloat(document.getElementById("anchoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("altoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("largoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1
    );
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update(); // Actualizar controles
    renderer.render(scene, camera);
}

function addProducts(result) {
    console.log("Añadiendo productos con FFD + Bottom-Left:", result);
    const gap = 0.01;

    const margin = parseFloat(document.getElementById("margen").value) / 100 || 0.05;
    const containerWidth = (parseFloat(document.getElementById("anchoContenedor").value) * (1 - margin)) / 100 || 1;
    const containerHeight = (parseFloat(document.getElementById("altoContenedor").value) * (1 - margin)) / 100 || 1;
    const containerDepth = (parseFloat(document.getElementById("largoContenedor").value) * (1 - margin)) / 100 || 1;

    // Usar la primera orientación como referencia para la geometría (puede variar por producto)
    const geometry = new THREE.BoxGeometry(result.placedProducts[0].largo / 100, result.placedProducts[0].alto / 100, result.placedProducts[0].ancho / 100); // X = largo, Y = alto, Z = ancho
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

    // Dibujar productos en las posiciones calculadas
    result.placedProducts.forEach(product => {
        const placedProduct = new THREE.Mesh(geometry, material);
        placedProduct.position.set(
            (product.x + product.largo / 2) / 100, // X = largo
            (product.y + product.alto / 2) / 100, // Y = alto
            (product.z + product.ancho / 2) / 100 // Z = ancho
        );

        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        edges.position.copy(placedProduct.position);

        products.push(placedProduct);
        scene.add(placedProduct);
        scene.add(edges);
    });
}

function createChart(volumeUsage, weightUsage) {
    console.log("Creando gráfico con volumeUsage:", volumeUsage, "weightUsage:", weightUsage);
    const ctx = document.getElementById('resultsChart').getContext('2d');
    if (chart) chart.destroy(); // Destruir gráfico anterior si existe

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Espacio Utilizado (%)', 'Peso Utilizado (%)'],
            datasets: [{
                label: 'Porcentajes',
                data: [volumeUsage, weightUsage],
                backgroundColor: ['#4CAF50', '#2196F3'],
                borderColor: ['#388E3C', '#1976D2'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Porcentaje (%)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function findBottomLeftPosition(space, product) {
    return { x: space.x, y: space.y, z: space.z }; // Simplificado: posición inferior izquierda
}

function canPlaceProduct(space, product) {
    return product.ancho <= space.width && product.largo <= space.depth && product.alto <= space.height;
}

function updateFreeSpaces(freeSpaces, placedProduct, space) {
    const newSpaces = [];
    const remainingWidth = space.width - placedProduct.ancho;
    const remainingDepth = space.depth - placedProduct.largo;
    const remainingHeight = space.height - placedProduct.alto;

    // Generar subespacios solo si hay espacio significativo
    if (remainingWidth > 1) {
        newSpaces.push({
            x: space.x + placedProduct.ancho,
            y: space.y,
            z: space.z,
            width: remainingWidth,
            height: space.height,
            depth: space.depth
        });
    }
    if (remainingDepth > 1) {
        newSpaces.push({
            x: space.x,
            y: space.y,
            z: space.z + placedProduct.largo,
            width: space.width,
            height: space.height,
            depth: remainingDepth
        });
    }
    if (remainingHeight > 1) {
        newSpaces.push({
            x: space.x,
            y: space.y + placedProduct.alto,
            z: space.z,
            width: space.width,
            height: remainingHeight,
            depth: space.depth
        });
    }

    // Reemplazar el espacio actual con los nuevos subespacios válidos
    const index = freeSpaces.indexOf(space);
    if (index !== -1) {
        freeSpaces.splice(index, 1);
        freeSpaces.push(...newSpaces.filter(s => 
            s.width > 1 && s.height > 1 && s.depth > 1 && 
            s.width <= space.width && s.height <= space.height && s.depth <= space.depth
        ));
    }
}

function calcularCubicaje() {
    console.log("Ejecutando calcularCubicaje() con FFD + Bottom-Left Fill...");

    const contenedor = {
        alto: parseFloat(document.getElementById("altoContenedor").value) || 0,
        ancho: parseFloat(document.getElementById("anchoContenedor").value) || 0,
        largo: parseFloat(document.getElementById("largoContenedor").value) || 0,
        pesoMax: parseFloat(document.getElementById("pesoMaxContenedor").value) || 0,
        alturaSegura: parseFloat(document.getElementById("alturaSegura").value) || 0,
        margen: parseFloat(document.getElementById("margen").value) / 100 || 0.05
    };

    // Obtener productos desde el formulario
    const productsInput = [];
    const productCount = parseInt(document.getElementById("productCount").value) || 1;
    for (let i = 1; i <= productCount; i++) {
        const alto = parseFloat(document.getElementById(`altoProducto${i}`).value) || 0;
        const ancho = parseFloat(document.getElementById(`anchoProducto${i}`).value) || 0;
        const largo = parseFloat(document.getElementById(`largoProducto${i}`).value) || 0;
        const peso = parseFloat(document.getElementById(`pesoProducto${i}`).value) || 0;
        productsInput.push({ alto, ancho, largo, peso, fragil: document.getElementById(`fragil${i}`).checked, noApilable: document.getElementById(`noApilable${i}`).checked });
    }

    const orientacion = document.querySelector('input[name="orientacion"]:checked').value;
    const shape = document.getElementById("shape").value;

    const resultDiv = document.getElementById("result");

    // Validaciones
    console.log("Validando datos:", contenedor, productsInput);
    if (isNaN(contenedor.alto) || isNaN(contenedor.ancho) || isNaN(contenedor.largo) || isNaN(contenedor.pesoMax) ||
        contenedor.alto <= 0 || contenedor.ancho <= 0 || contenedor.largo <= 0 || contenedor.pesoMax <= 0 ||
        productsInput.some(p => isNaN(p.alto) || isNaN(p.ancho) || isNaN(p.largo) || isNaN(p.peso) ||
            p.alto <= 0 || p.ancho <= 0 || p.largo <= 0 || p.peso <= 0)) {
        console.log("Error: Datos inválidos.");
        resultDiv.innerHTML = "<div id='error'>Por favor, ingrese todas las medidas correctamente (valores positivos).</div>";
        document.getElementById("exportPdf").style.display = "none";
        return;
    }

    // Ajuste por margen
    const contenedorAjustado = {
        altoAjustado: contenedor.alto * (1 - contenedor.margen),
        anchoAjustado: contenedor.ancho * (1 - contenedor.margen),
        largoAjustado: contenedor.largo * (1 - contenedor.margen),
        pesoMax: contenedor.pesoMax,
        alturaSegura: contenedor.alturaSegura || contenedor.alto
    };

    // Factor de volumen según forma
    let volumeFactor = 1.0;
    switch (shape) {
        case "cylinder": volumeFactor = 0.785; break;
        case "sphere": volumeFactor = 0.524; break;
    }

    // Generar todas las orientaciones para cada producto
    let allOrientations = [];
    productsInput.forEach((product, index) => {
        const orientations = [];
        switch (orientacion) {
            case "none":
                orientations.push({ ancho: product.ancho, largo: product.largo, alto: product.alto, volumen: product.ancho * product.largo * product.alto, peso: product.peso, index });
                orientations.push({ ancho: product.ancho, largo: product.alto, alto: product.largo, volumen: product.ancho * product.alto * product.largo, peso: product.peso, index });
                orientations.push({ ancho: product.largo, largo: product.ancho, alto: product.alto, volumen: product.largo * product.ancho * product.alto, peso: product.peso, index });
                orientations.push({ ancho: product.largo, largo: product.alto, alto: product.ancho, volumen: product.largo * product.alto * product.ancho, peso: product.peso, index });
                orientations.push({ ancho: product.alto, largo: product.ancho, alto: product.largo, volumen: product.alto * product.ancho * product.largo, peso: product.peso, index });
                orientations.push({ ancho: product.alto, largo: product.largo, alto: product.ancho, volumen: product.alto * product.largo * product.ancho, peso: product.peso, index });
                break;
            case "horizontal":
                orientations.push({ ancho: product.ancho, largo: product.largo, alto: product.alto, volumen: product.ancho * product.largo * product.alto, peso: product.peso, index });
                orientations.push({ ancho: product.largo, largo: product.ancho, alto: product.alto, volumen: product.largo * product.ancho * product.alto, peso: product.peso, index });
                break;
            case "vertical":
                orientations.push({ ancho: product.ancho, largo: product.largo, alto: product.alto, volumen: product.ancho * product.largo * product.alto, peso: product.peso, index });
                break;
            case "fixed":
                orientations.push({ ancho: product.ancho, largo: product.largo, alto: product.alto, volumen: product.ancho * product.largo * product.alto, peso: product.peso, index });
                break;
        }
        allOrientations = allOrientations.concat(orientations);
    });

    // Ordenar por volumen decreciente (First-Fit Decreasing)
    allOrientations.sort((a, b) => b.volumen - a.volumen);

    // Espacio libre inicial: todo el contenedor
    let freeSpaces = [{
        x: 0, y: 0, z: 0,
        width: contenedorAjustado.anchoAjustado,
        height: contenedorAjustado.alturaSegura,
        depth: contenedorAjustado.largoAjustado
    }];
    let placedProducts = [];
    let totalWeight = 0;
    let maxIterations = 1000; // Límite para evitar bucles infinitos

    for (let orient of allOrientations) {
        if (totalWeight >= contenedor.pesoMax || maxIterations-- <= 0) break;

        let placed = false;
        let bestSpace = null;
        let bestPosition = null;

        for (let space of freeSpaces) {
            if (canPlaceProduct(space, orient)) {
                const position = findBottomLeftPosition(space, orient);
                if (!bestSpace || position.y < bestPosition.y || (position.y === bestPosition.y && position.z < bestPosition.z)) {
                    bestSpace = space;
                    bestPosition = position;
                }
            }
        }

        if (bestSpace) {
            placedProducts.push({
                ancho: orient.ancho,
                largo: orient.largo,
                alto: orient.alto,
                x: bestPosition.x,
                y: bestPosition.y,
                z: bestPosition.z,
                peso: orient.peso,
                productIndex: orient.index
            });
            totalWeight += orient.peso;
            updateFreeSpaces(freeSpaces, placedProducts[placedProducts.length - 1], bestSpace);
            placed = true;
        }
    }

    // Calcular estadísticas
    const totalProductos = placedProducts.length;
    const usedVolume = placedProducts.reduce((sum, p) => sum + (p.ancho * p.largo * p.alto), 0) * volumeFactor;
    const contenedorVolumen = contenedorAjustado.altoAjustado * contenedorAjustado.anchoAjustado * contenedorAjustado.largoAjustado;
    const volumeUsage = Math.min(100, (usedVolume / contenedorVolumen) * 100); // Limitar a 100%
    const weightUsage = (totalWeight / contenedor.pesoMax) * 100;
    const loadDensity = totalProductos > 0 ? (totalWeight) / (usedVolume / 1000000) : 0;
    const centerOfGravity = totalProductos > 0 ? placedProducts.reduce((sum, p) => sum + (p.y + p.alto / 2), 0) / totalProductos : 0;

    // Desglose aproximado para compatibilidad
    const mejorDesglose = {
        productosAncho: Math.max(...placedProducts.map(p => p.ancho)) || 0,
        productosLargo: Math.max(...placedProducts.map(p => p.largo)) || 0,
        capasCompletas: totalProductos > 0 ? Math.floor(totalProductos / (Math.max(...placedProducts.map(p => p.ancho)) * Math.max(...placedProducts.map(p => p.largo)) / (productsInput[0].ancho * productsInput[0].largo))) : 0,
        sobrantes: totalProductos % (Math.max(...placedProducts.map(p => p.ancho)) * Math.max(...placedProducts.map(p => p.largo)) / (productsInput[0].ancho * productsInput[0].largo)) || 0
    };

    const shapeText = shape === "prism" ? "Prisma" : shape === "cylinder" ? "Cilindro (78.5%)" : "Esfera (52.4%)";
    resultDiv.innerHTML = `
        <div id='success'>
            <p><strong>Orientación óptima (Ancho x Largo x Alto):</strong> Varias (FFD + Bottom-Left)</p>
            <p><strong>Total productos:</strong> ${totalProductos}</p>
            <p><strong>Productos por ancho:</strong> ${mejorDesglose.productosAncho.toFixed(2)}</p>
            <p><strong>Productos por largo:</strong> ${mejorDesglose.productosLargo.toFixed(2)}</p>
            <p><strong>Capas completas:</strong> ${mejorDesglose.capasCompletas}</p>
            <p><strong>Sobrantes:</strong> ${mejorDesglose.sobrantes}</p>
            <p><strong>Porcentaje de espacio utilizado:</strong> ${volumeUsage.toFixed(2)}%</p>
            <p><strong>Porcentaje de peso utilizado:</strong> ${weightUsage.toFixed(2)}%</p>
            <p><strong>Densidad de carga:</strong> ${loadDensity.toFixed(2)} kg/m³</p>
            <p><strong>Centro de gravedad:</strong> ${centerOfGravity.toFixed(2)} cm (Altura segura: ${contenedor.alturaSegura} cm)</p>
            <p><strong>Forma ajustada:</strong> ${shapeText}</p>
        </div>
    `;
    console.log("Mostrando botón exportPdf...");
    document.getElementById("exportPdf").style.display = "block";
    window.bestResult = {
        orientacionOptima: "Varias (FFD + Bottom-Left)",
        totalProductos: totalProductos,
        desglose: mejorDesglose,
        volumeUsage: volumeUsage,
        weightUsage: weightUsage,
        loadDensity: loadDensity,
        centerOfGravity: centerOfGravity,
        placedProducts: placedProducts
    };
    window.shapeText = shapeText;
    window.inputData = {
        altoContenedor: contenedor.alto,
        anchoContenedor: contenedor.ancho,
        largoContenedor: contenedor.largo,
        pesoMaxContenedor: contenedor.pesoMax,
        alturaSegura: contenedor.alturaSegura,
        margen: contenedor.margen * 100,
        products: productsInput
    };
    initThreeJS();
    addProducts({
        orientacionOptima: [productsInput[0].ancho, productsInput[0].largo, productsInput[0].alto],
        desglose: mejorDesglose,
        contenedor: contenedorAjustado,
        placedProducts: placedProducts
    });
    createChart(volumeUsage, weightUsage);
}

function exportToPdf() {
    console.log("Exportando a PDF...");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPosition = 10;

    // Título
    doc.setFontSize(16);
    doc.text("Resultado de Cubicaje - OPTITRANS", 10, yPosition);
    yPosition += 10;

    // Fecha
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, yPosition);
    yPosition += 10;

    // Información ingresada por el usuario
    doc.setFontSize(14);
    doc.text("Datos Ingresados", 10, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    const inputData = window.inputData;
    const inputText = [
        "Medidas del Contenedor:",
        `Alto: ${inputData.altoContenedor} cm`,
        `Ancho: ${inputData.anchoContenedor} cm`,
        `Largo: ${inputData.largoContenedor} cm`,
        `Capacidad Máxima: ${inputData.pesoMaxContenedor} kg`,
        `Altura Segura: ${inputData.alturaSegura} cm`,
        `Margen de Maniobra: ${inputData.margen}%`,
        "",
        "Medidas de los Productos:"
    ];
    inputData.products.forEach((p, i) => {
        inputText.push(`Producto ${i + 1}:`,
            `Alto: ${p.alto} cm`,
            `Ancho: ${p.ancho} cm`,
            `Largo: ${p.largo} cm`,
            `Peso: ${p.peso} kg`);
    });
    doc.text(inputText, 10, yPosition, { maxWidth: 180 });
    yPosition += inputText.length * 5 + 10;

    // Resultados
    doc.setFontSize(14);
    doc.text("Resultados", 10, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    const result = window.bestResult;
    const shapeText = window.shapeText;
    const resultText = [
        `Orientación óptima (Ancho x Largo x Alto): ${result.orientacionOptima}`,
        `Total productos: ${result.totalProductos}`,
        `Productos por ancho: ${result.desglose.productosAncho.toFixed(2)}`,
        `Productos por largo: ${result.desglose.productosLargo.toFixed(2)}`,
        `Capas completas: ${result.desglose.capasCompletas}`,
        `Sobrantes: ${result.desglose.sobrantes}`,
        `Porcentaje de espacio utilizado: ${result.volumeUsage.toFixed(2)}%`,
        `Porcentaje de peso utilizado: ${result.weightUsage.toFixed(2)}%`,
        `Densidad de carga: ${result.loadDensity.toFixed(2)} kg/m³`,
        `Centro de gravedad: ${result.centerOfGravity.toFixed(2)} cm (Altura segura: ${inputData.alturaSegura} cm)`,
        `Forma ajustada: ${shapeText}`
    ];
    doc.text(resultText, 10, yPosition, { maxWidth: 180 });
    yPosition += resultText.length * 5 + 10;

    // Añadir el gráfico 3D
    const canvas = document.querySelector('#threejs-container canvas');
    if (canvas) {
        const imgData = canvas.toDataURL('image/png');
        doc.setFontSize(14);
        doc.text("Visualización 3D", 10, yPosition);
        yPosition += 8;
        doc.addImage(imgData, 'PNG', 10, yPosition, 50, 50); // Escala de 400x400 a 50x50 mm
        yPosition += 60;
    }

    // Añadir el diagrama de barras
    const chartCanvas = document.getElementById('resultsChart');
    if (chartCanvas) {
        const chartImgData = chartCanvas.toDataURL('image/png');
        doc.setFontSize(14);
        doc.text("Gráfico de Porcentajes", 10, yPosition);
        yPosition += 8;
        doc.addImage(chartImgData, 'PNG', 10, yPosition, 80, 40); // Escala de 400x200 a 80x40 mm
    }

    doc.save("cubicaje_optitrans.pdf");
}

// Habilitar/deshabilitar input de máximo de filas según "Frágil"
document.querySelectorAll('[id^="fragil"]').forEach(checkbox => {
    checkbox.addEventListener("change", function() {
        document.getElementById(`maxStack${this.id.replace("fragil", "")}`).disabled = !this.checked;
    });
});

initThreeJS(); // Inicializar escena al cargar
