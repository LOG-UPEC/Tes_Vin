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
    if (window.scene) initThreeJS();
}

let scene, camera, renderer, products = [];
let cameraDistance = 3;
let chart;
let controls;

function initThreeJS() {
    console.log("Inicializando Three.js...");
    if (!window.THREE) {
        console.error("Three.js no está definido.");
        return;
    }

    if (scene) {
        while (scene.children.length > 0) scene.remove(scene.children[0]);
        products = [];
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    camera = new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    document.getElementById('threejs-container').innerHTML = '';
    const canvas = document.getElementById('threejs-container').appendChild(renderer.domElement);

    const containerWidth = (parseFloat(document.getElementById("anchoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1;
    const containerHeight = (parseFloat(document.getElementById("altoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1;
    const containerDepth = (parseFloat(document.getElementById("largoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1;
    const containerGeometry = new THREE.BoxGeometry(containerDepth, containerHeight, containerWidth);
    const containerEdges = new THREE.EdgesGeometry(containerGeometry);
    const containerMaterial = new THREE.LineBasicMaterial({ color: 0x808080 });
    const containerWireframe = new THREE.LineSegments(containerEdges, containerMaterial);
    containerWireframe.position.set(containerDepth / 2, containerHeight / 2, containerWidth / 2);
    scene.add(containerWireframe);

    const maxDim = Math.max(containerWidth, containerHeight, containerDepth);
    cameraDistance = maxDim * 3;
    updateCameraPosition(maxDim, containerWidth, containerHeight, containerDepth);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = maxDim * 0.5;
    controls.maxDistance = maxDim * 10;

    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        cameraDistance += event.deltaY * 0.005;
        cameraDistance = Math.max(0.5, Math.min(cameraDistance, maxDim * 10));
        updateCameraPosition(maxDim, containerWidth, containerHeight, containerDepth);
    });

    animate();
}

function updateCameraPosition(maxDim, containerWidth, containerHeight, containerDepth) {
    camera.position.set(containerDepth / 2 + cameraDistance, containerHeight / 2 + cameraDistance, containerWidth / 2 + cameraDistance);
    camera.lookAt(containerDepth / 2, containerHeight / 2, containerWidth / 2);
}

function zoomIn() {
    const maxDim = Math.max((parseFloat(document.getElementById("anchoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("altoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("largoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1);
    cameraDistance -= maxDim * 0.2;
    cameraDistance = Math.max(0.5, Math.min(cameraDistance, maxDim * 10));
    updateCameraPosition(maxDim,
        (parseFloat(document.getElementById("anchoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("altoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("largoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1);
}

function zoomOut() {
    const maxDim = Math.max((parseFloat(document.getElementById("anchoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("altoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("largoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1);
    cameraDistance += maxDim * 0.2;
    cameraDistance = Math.max(0.5, Math.min(cameraDistance, maxDim * 10));
    updateCameraPosition(maxDim,
        (parseFloat(document.getElementById("anchoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("altoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("largoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1);
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
}

function addProducts(result) {
    console.log("Añadiendo productos con Skyline:", result);
    const gap = 0.01;

    const margin = parseFloat(document.getElementById("margen").value) / 100 || 0.05;
    const containerWidth = (parseFloat(document.getElementById("anchoContenedor").value) * (1 - margin)) / 100 || 1;
    const containerHeight = (parseFloat(document.getElementById("altoContenedor").value) * (1 - margin)) / 100 || 1;
    const containerDepth = (parseFloat(document.getElementById("largoContenedor").value) * (1 - margin)) / 100 || 1;

    const geometry = new THREE.BoxGeometry(result.placedProducts[0].largo / 100, result.placedProducts[0].alto / 100, result.placedProducts[0].ancho / 100);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

    result.placedProducts.forEach(product => {
        const placedProduct = new THREE.Mesh(geometry, material);
        placedProduct.position.set(
            (product.x + product.largo / 2) / 100,
            (product.y + product.alto / 2) / 100,
            (product.z + product.ancho / 2) / 100
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
    if (chart) chart.destroy();

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
                    title: { display: true, text: 'Porcentaje (%)' }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function addProductRow() {
    const tbody = document.getElementById('productsTable').getElementsByTagName('tbody')[0];
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="number" class="product-alto" value="110"></td>
        <td><input type="number" class="product-ancho" value="63"></td>
        <td><input type="number" class="product-largo" value="110"></td>
        <td><input type="number" class="product-peso" value="456"></td>
        <td><button onclick="removeProduct(this)">Eliminar</button></td>
    `;
    tbody.appendChild(row);
}

function removeProduct(button) {
    button.parentElement.parentElement.remove();
}

function calcularCubicaje() {
    console.log("Ejecutando calcularCubicaje() con Skyline FFD...");

    const contenedor = {
        alto: parseFloat(document.getElementById("altoContenedor").value) || 0,
        ancho: parseFloat(document.getElementById("anchoContenedor").value) || 0,
        largo: parseFloat(document.getElementById("largoContenedor").value) || 0,
        pesoMax: parseFloat(document.getElementById("pesoMaxContenedor").value) || 0,
        alturaSegura: parseFloat(document.getElementById("alturaSegura").value) || 0,
        margen: parseFloat(document.getElementById("margen").value) / 100 || 0.05
    };
    const orientacion = document.querySelector('input[name="orientacion"]:checked').value;
    const shape = document.getElementById("shape").value;
    const fragil = document.getElementById("fragil").checked;
    const noApilable = document.getElementById("noApilable").checked;
    const maxStack = fragil ? parseFloat(document.getElementById("maxStack").value) || 3 : Infinity;

    const resultDiv = document.getElementById("result");

    // Validaciones
    if (isNaN(contenedor.alto) || isNaN(contenedor.ancho) || isNaN(contenedor.largo) || isNaN(contenedor.pesoMax) ||
        contenedor.alto <= 0 || contenedor.ancho <= 0 || contenedor.largo <= 0 || contenedor.pesoMax <= 0) {
        resultDiv.innerHTML = "<div id='error'>Por favor, ingrese las medidas del contenedor correctamente.</div>";
        document.getElementById("exportPdf").style.display = "none";
        return;
    }

    // Ajuste por margen
    const contenedorAjustado = {
        altoAjustado: contenedor.alto * (1 - contenedor.margen),
        anchoAjustado: contenedor.ancho * (1 - contenedor.margen),
        largoAjustado: contenedor.largo * (1 - contenedor.margen),
        pesoMax: contenedor.pesoMax,
        alturaSegura: Math.min(contenedor.alturaSegura, contenedor.alto * (1 - contenedor.margen))
    };

    // Factor de volumen según forma
    let volumeFactor = 1.0;
    switch (shape) {
        case "cylinder": volumeFactor = 0.785; break;
        case "sphere": volumeFactor = 0.524; break;
    }

    // Obtener productos de la tabla
    const productRows = document.getElementById('productsTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    let productos = [];
    for (let row of productRows) {
        const inputs = row.getElementsByTagName('input');
        const alto = parseFloat(inputs[0].value) || 0;
        const ancho = parseFloat(inputs[1].value) || 0;
        const largo = parseFloat(inputs[2].value) || 0;
        const peso = parseFloat(inputs[3].value) || 0;
        if (alto > 0 && ancho > 0 && largo > 0 && peso > 0) {
            productos.push({ alto, ancho, largo, peso });
        }
    }
    if (productos.length === 0) {
        resultDiv.innerHTML = "<div id='error'>Por favor, ingrese al menos un producto válido.</div>";
        document.getElementById("exportPdf").style.display = "none";
        return;
    }

    // Generar orientaciones para cada producto
    let allOrientations = [];
    productos.forEach((prod, index) => {
        const orients = [];
        switch (orientacion) {
            case "none":
                orients.push({ ancho: prod.ancho, largo: prod.largo, alto: prod.alto, peso: prod.peso, index });
                orients.push({ ancho: prod.ancho, largo: prod.alto, alto: prod.largo, peso: prod.peso, index });
                orients.push({ ancho: prod.largo, largo: prod.ancho, alto: prod.alto, peso: prod.peso, index });
                orients.push({ ancho: prod.largo, largo: prod.alto, alto: prod.ancho, peso: prod.peso, index });
                orients.push({ ancho: prod.alto, largo: prod.ancho, alto: prod.largo, peso: prod.peso, index });
                orients.push({ ancho: prod.alto, largo: prod.largo, alto: prod.ancho, peso: prod.peso, index });
                break;
            case "horizontal":
                orients.push({ ancho: prod.ancho, largo: prod.largo, alto: prod.alto, peso: prod.peso, index });
                orients.push({ ancho: prod.largo, largo: prod.ancho, alto: prod.alto, peso: prod.peso, index });
                break;
            case "vertical":
                orients.push({ ancho: prod.ancho, largo: prod.largo, alto: prod.alto, peso: prod.peso, index });
                break;
            case "fixed":
                orients.push({ ancho: prod.ancho, largo: prod.largo, alto: prod.alto, peso: prod.peso, index });
                break;
        }
        allOrientations = allOrientations.concat(orients);
    });

    // Ordenar por volumen decreciente (FFD)
    allOrientations.sort((a, b) => (b.ancho * b.largo * b.alto) - (a.ancho * a.largo * a.alto));

    // Skyline inicial
    let skyline = [{ x: 0, z: 0, height: 0, width: contenedorAjustado.anchoAjustado }];
    let placedProducts = [];
    let totalWeight = 0;
    let maxIterations = 1000;

    for (let orient of allOrientations) {
        if (totalWeight >= contenedor.pesoMax || maxIterations-- <= 0) break;

        let placed = false;
        for (let i = 0; i < skyline.length && !placed; i++) {
            const segment = skyline[i];
            if (orient.ancho <= contenedorAjustado.anchoAjustado - segment.x && 
                orient.largo <= contenedorAjustado.largoAjustado - segment.z && 
                orient.alto <= Math.min(contenedorAjustado.alturaSegura - segment.height, maxStack * orient.alto)) {

                // Encontrar la mejor posición en el segmento
                const x = segment.x;
                const z = segment.z;
                const y = segment.height;

                // Colocar producto
                placedProducts.push({
                    ancho: orient.ancho,
                    largo: orient.largo,
                    alto: orient.alto,
                    peso: orient.peso,
                    x: x,
                    y: y,
                    z: z,
                    productIndex: orient.index
                });
                totalWeight += orient.peso;

                // Actualizar skyline
                const newHeight = y + orient.alto;
                skyline[i].height = newHeight;

                // Dividir o ajustar segmentos si es necesario
                if (orient.ancho < contenedorAjustado.anchoAjustado - segment.x) {
                    skyline.splice(i + 1, 0, { x: x + orient.ancho, z: z, height: y, width: contenedorAjustado.anchoAjustado - (x + orient.ancho) });
                }
                if (orient.largo < contenedorAjustado.largoAjustado - segment.z) {
                    skyline.splice(i + 1, 0, { x: x, z: z + orient.largo, height: y, width: contenedorAjustado.anchoAjustado - x });
                }

                // Limpiar segmentos inválidos o fusionar si es posible
                skyline = skyline.filter(s => s.width > 1 && s.height <= contenedorAjustado.alturaSegura);
                skyline.sort((a, b) => a.z - b.z || a.x - b.x);
                placed = true;
            }
        }
    }

    // Calcular estadísticas
    const totalProductos = placedProducts.length;
    const usedVolume = placedProducts.reduce((sum, p) => sum + (p.ancho * p.largo * p.alto), 0) * volumeFactor;
    const contenedorVolumen = contenedorAjustado.altoAjustado * contenedorAjustado.anchoAjustado * contenedorAjustado.largoAjustado;
    const volumeUsage = Math.min(100, (usedVolume / contenedorVolumen) * 100);
    const weightUsage = (totalWeight / contenedor.pesoMax) * 100;
    const loadDensity = totalProductos > 0 ? (totalWeight) / (usedVolume / 1000000) : 0;
    const centerOfGravity = totalProductos > 0 ? placedProducts.reduce((sum, p) => sum + (p.y + p.alto / 2), 0) / totalProductos : 0;

    // Desglose aproximado
    const mejorDesglose = {
        productosAncho: Math.max(...placedProducts.map(p => p.ancho)) || 0,
        productosLargo: Math.max(...placedProducts.map(p => p.largo)) || 0,
        capasCompletas: totalProductos > 0 ? Math.floor(totalProductos / (Math.max(...placedProducts.map(p => p.ancho)) * Math.max(...placedProducts.map(p => p.largo)) / (productos[0].ancho * productos[0].largo))) : 0,
        sobrantes: totalProductos % (Math.max(...placedProducts.map(p => p.ancho)) * Math.max(...placedProducts.map(p => p.largo)) / (productos[0].ancho * productos[0].largo)) || 0
    };

    const shapeText = shape === "prism" ? "Prisma" : shape === "cylinder" ? "Cilindro (78.5%)" : "Esfera (52.4%)";
    resultDiv.innerHTML = `
        <div id='success'>
            <p><strong>Orientación óptima (Ancho x Largo x Alto):</strong> Varias (Skyline FFD)</p>
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
    document.getElementById("exportPdf").style.display = "block";
    window.bestResult = {
        orientacionOptima: "Varias (Skyline FFD)",
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
        productos: productos
    };
    initThreeJS();
    addProducts({
        placedProducts: placedProducts,
        desglose: mejorDesglose,
        contenedor: contenedorAjustado
    });
    createChart(volumeUsage, weightUsage);
}

function exportToPdf() {
    console.log("Exportando a PDF...");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let yPosition = 10;

    doc.setFontSize(16);
    doc.text("Resultado de Cubicaje - OPTITRANS", 10, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, yPosition);
    yPosition += 10;

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
    inputData.productos.forEach((prod, i) => {
        inputText.push(`Producto ${i + 1}: Alto ${prod.alto} cm, Ancho ${prod.ancho} cm, Largo ${prod.largo} cm, Peso ${prod.peso} kg`);
    });
    doc.text(inputText, 10, yPosition, { maxWidth: 180 });
    yPosition += inputText.length * 5 + 10;

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

    const canvas = document.querySelector('#threejs-container canvas');
    if (canvas) {
        const imgData = canvas.toDataURL('image/png');
        doc.setFontSize(14);
        doc.text("Visualización 3D", 10, yPosition);
        yPosition += 8;
        doc.addImage(imgData, 'PNG', 10, yPosition, 50, 50);
        yPosition += 60;
    }

    const chartCanvas = document.getElementById('resultsChart');
    if (chartCanvas) {
        const chartImgData = chartCanvas.toDataURL('image/png');
        doc.setFontSize(14);
        doc.text("Gráfico de Porcentajes", 10, yPosition);
        yPosition += 8;
        doc.addImage(chartImgData, 'PNG', 10, yPosition, 80, 40);
    }

    doc.save("cubicaje_optitrans.pdf");
}

document.getElementById("fragil").addEventListener("change", function() {
    document.getElementById("maxStack").disabled = !this.checked;
});

initThreeJS();
