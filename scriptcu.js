// Presets de contenedores
const containerPresets = {
    "20ft": { height: 239, width: 235, depth: 590, maxWeight: 28000, safeHeight: 239 },
    "40ft": { height: 239, width: 235, depth: 1200, maxWeight: 30480, safeHeight: 239 },
    "euroPallet": { height: 144, width: 80, depth: 120, maxWeight: 1500, safeHeight: 200 }
};

function applyPreset() {
    const preset = document.getElementById("containerPreset").value;
    if (preset !== "custom") {
        const { height, width, depth, maxWeight, safeHeight } = containerPresets[preset];
        document.getElementById("containerHeight").value = height;
        document.getElementById("containerWidth").value = width;
        document.getElementById("containerDepth").value = depth;
        document.getElementById("containerMaxWeight").value = maxWeight;
        document.getElementById("safeHeight").value = safeHeight;
    }
    if (window.scene) initThreeJS(); // Reconstruir escena si cambia preset
}

let scene, camera, renderer, products = [];
let cameraDistance = 3; // Distancia inicial de la cámara
let chart; // Variable para el gráfico de Chart.js

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
    const containerWidth = parseFloat(document.getElementById("containerWidth").value) / 100 || 1;
    const containerHeight = parseFloat(document.getElementById("containerHeight").value) / 100 || 1;
    const containerDepth = parseFloat(document.getElementById("containerDepth").value) / 100 || 1;
    const containerGeometry = new THREE.BoxGeometry(containerWidth, containerHeight, containerDepth);
    const containerEdges = new THREE.EdgesGeometry(containerGeometry);
    const containerMaterial = new THREE.LineBasicMaterial({ color: 0x808080 });
    const containerWireframe = new THREE.LineSegments(containerEdges, containerMaterial);
    containerWireframe.position.set(containerWidth / 2, containerHeight / 2, containerDepth / 2);
    scene.add(containerWireframe);

    // Ajustar cámara
    const maxDim = Math.max(containerWidth, containerHeight, containerDepth);
    cameraDistance = maxDim * 3; // Distancia inicial
    updateCameraPosition(maxDim, containerWidth, containerHeight, containerDepth);

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
        containerWidth / 2 + cameraDistance,
        containerHeight / 2 + cameraDistance,
        containerDepth / 2 + cameraDistance
    );
    camera.lookAt(containerWidth / 2, containerHeight / 2, containerDepth / 2);
}

// Funciones para los botones de zoom
function zoomIn() {
    const maxDim = Math.max(
        parseFloat(document.getElementById("containerWidth").value) / 100 || 1,
        parseFloat(document.getElementById("containerHeight").value) / 100 || 1,
        parseFloat(document.getElementById("containerDepth").value) / 100 || 1
    );
    cameraDistance -= maxDim * 0.2;
    cameraDistance = Math.max(0.5, Math.min(cameraDistance, maxDim * 10));
    updateCameraPosition(maxDim,
        parseFloat(document.getElementById("containerWidth").value) / 100 || 1,
        parseFloat(document.getElementById("containerHeight").value) / 100 || 1,
        parseFloat(document.getElementById("containerDepth").value) / 100 || 1
    );
}

function zoomOut() {
    const maxDim = Math.max(
        parseFloat(document.getElementById("containerWidth").value) / 100 || 1,
        parseFloat(document.getElementById("containerHeight").value) / 100 || 1,
        parseFloat(document.getElementById("containerDepth").value) / 100 || 1
    );
    cameraDistance += maxDim * 0.2;
    cameraDistance = Math.max(0.5, Math.min(cameraDistance, maxDim * 10));
    updateCameraPosition(maxDim,
        parseFloat(document.getElementById("containerWidth").value) / 100 || 1,
        parseFloat(document.getElementById("containerHeight").value) / 100 || 1,
        parseFloat(document.getElementById("containerDepth").value) / 100 || 1
    );
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function addProducts(result) {
    console.log("Añadiendo productos:", result);
    const [pWidth, pDepth, pHeight] = result.orientation.split('x').map(parseFloat);
    const productWidth = pWidth / 100;
    const productHeight = pHeight / 100;
    const productDepth = pDepth / 100;
    const gap = 0.01;

    const margin = parseFloat(document.getElementById("margin").value) / 100 || 0.05;
    const containerWidth = (parseFloat(document.getElementById("containerWidth").value) * (1 - margin)) / 100 || 1;
    const containerHeight = (parseFloat(document.getElementById("containerHeight").value) * (1 - margin)) / 100 || 1;
    const containerDepth = (parseFloat(document.getElementById("containerDepth").value) * (1 - margin)) / 100 || 1;

    const geometry = new THREE.BoxGeometry(productWidth, productHeight, productDepth);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });

    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

    const totalWidth = result.productsPerWidth * productWidth + (result.productsPerWidth - 1) * gap;
    const totalDepth = result.productsPerDepth * productDepth + (result.productsPerDepth - 1) * gap;
    const totalHeight = result.productsPerHeight * productHeight + (result.productsPerHeight - 1) * gap;

    const offsetX = (containerWidth - totalWidth) / 2;
    const offsetZ = (containerDepth - totalDepth) / 2;

    for (let y = 0; y < result.productsPerHeight; y++) {
        for (let x = 0; x < result.productsPerWidth; x++) {
            for (let z = 0; z < result.productsPerDepth; z++) {
                const product = new THREE.Mesh(geometry, material);
                product.position.set(
                    offsetX + x * (productWidth + gap) + productWidth / 2,
                    y * (productHeight + gap) + productHeight / 2,
                    offsetZ + z * (productDepth + gap) + productDepth / 2
                );

                const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
                edges.position.copy(product.position);

                products.push(product);
                scene.add(product);
                scene.add(edges);
            }
        }
    }
}

function createChart(volumeUsage, weightUsage) {
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

function calculateCubicaje() {
    const containerHeight = parseFloat(document.getElementById("containerHeight").value);
    const containerWidth = parseFloat(document.getElementById("containerWidth").value);
    const containerDepth = parseFloat(document.getElementById("containerDepth").value);
    const containerMaxWeight = parseFloat(document.getElementById("containerMaxWeight").value);
    const safeHeight = parseFloat(document.getElementById("safeHeight").value) || containerHeight;
    const margin = parseFloat(document.getElementById("margin").value) / 100 || 0.05;

    const productHeight = parseFloat(document.getElementById("productHeight").value);
    const productWidth = parseFloat(document.getElementById("productWidth").value);
    const productDepth = parseFloat(document.getElementById("productDepth").value);
    const productWeight = parseFloat(document.getElementById("productWeight").value);

    const orientation = document.querySelector('input[name="orientation"]:checked').value;
    const isFragile = document.getElementById("fragile").checked;
    const maxStack = isFragile ? parseInt(document.getElementById("maxStack").value) || Infinity : Infinity;
    const isNonStackable = document.getElementById("nonStackable").checked;
    const shape = document.getElementById("shape").value;

    const resultDiv = document.getElementById("result");

    if (isNaN(containerHeight) || isNaN(containerWidth) || isNaN(containerDepth) || isNaN(containerMaxWeight) ||
        isNaN(productHeight) || isNaN(productWidth) || isNaN(productDepth) || isNaN(productWeight) ||
        containerHeight <= 0 || containerWidth <= 0 || containerDepth <= 0 || containerMaxWeight <= 0 ||
        productHeight <= 0 || productWidth <= 0 || productDepth <= 0 || productWeight <= 0 ||
        (isFragile && (isNaN(maxStack) || maxStack <= 0))) {
        resultDiv.innerHTML = "<div id='error'>Por favor, ingrese todas las medidas correctamente (valores positivos).</div>";
        document.getElementById("exportPdf").style.display = "none";
        return;
    }

    const adjustedContainerHeight = containerHeight * (1 - margin);
    const adjustedContainerWidth = containerWidth * (1 - margin);
    const adjustedContainerDepth = containerDepth * (1 - margin);

    let volumeFactor = 1.0;
    switch (shape) {
        case "cylinder": volumeFactor = 0.785; break;
        case "sphere": volumeFactor = 0.524; break;
    }
    const productVolume = productHeight * productWidth * productDepth * volumeFactor;
    const containerVolume = adjustedContainerHeight * adjustedContainerWidth * adjustedContainerDepth;

    if (productVolume > containerVolume) {
        resultDiv.innerHTML = "<div id='error'>El producto no cabe en el contenedor por volumen (con margen).</div>";
        document.getElementById("exportPdf").style.display = "none";
        return;
    }

    let orientations = [];
    switch (orientation) {
        case "none":
            orientations = [
                [productWidth, productDepth, productHeight],
                [productWidth, productHeight, productDepth],
                [productDepth, productWidth, productHeight],
                [productDepth, productHeight, productWidth],
                [productHeight, productWidth, productDepth],
                [productHeight, productDepth, productWidth]
            ];
            break;
        case "horizontal":
            orientations = [
                [productWidth, productDepth, productHeight],
                [productDepth, productWidth, productHeight]
            ];
            break;
        case "vertical":
            orientations = [
                [productWidth, productDepth, productHeight],
                [productDepth, productWidth, productHeight]
            ].filter(([w, d, h]) => h === productHeight);
            break;
        case "fixed":
            orientations = [[productWidth, productDepth, productHeight]];
            break;
    }

    let bestResult = null;
    let bestBaseArea = 0;

    for (const [pWidth, pDepth, pHeight] of orientations) {
        if (pWidth > adjustedContainerWidth || pDepth > adjustedContainerDepth || pHeight > adjustedContainerHeight) {
            continue;
        }

        const productsPerWidth = Math.floor(adjustedContainerWidth / pWidth);
        const productsPerDepth = Math.floor(adjustedContainerDepth / pDepth);
        let productsPerHeight = Math.floor(adjustedContainerHeight / pHeight);

        if (isNonStackable) productsPerHeight = 1;
        if (isFragile && productsPerHeight > maxStack) productsPerHeight = maxStack;

        let totalProducts = productsPerWidth * productsPerDepth * productsPerHeight;
        let totalWeight = totalProducts * productWeight;

        while (totalWeight > containerMaxWeight && productsPerHeight > 0) {
            productsPerHeight--;
            totalProducts = productsPerWidth * productsPerDepth * productsPerHeight;
            totalWeight = totalProducts * productWeight;
        }

        const totalHeight = productsPerHeight * pHeight;
        if (totalHeight > safeHeight) {
            productsPerHeight = Math.floor(safeHeight / pHeight);
            totalProducts = productsPerWidth * productsPerDepth * productsPerHeight;
            totalWeight = totalProducts * productWeight;
        }

        if (totalProducts <= 0) continue;

        const usedVolume = totalProducts * productVolume;
        const volumeUsage = (usedVolume / containerVolume) * 100;
        const weightUsage = (totalWeight / containerMaxWeight) * 100;
        const loadDensity = totalWeight / (usedVolume / 1000000);
        const centerOfGravity = (productsPerHeight * pHeight) / 2;

        const baseArea = pWidth * pDepth;

        const result = {
            totalProducts,
            productsPerWidth,
            productsPerDepth,
            productsPerHeight,
            volumeUsage,
            weightUsage,
            loadDensity,
            centerOfGravity,
            orientation: `${pWidth}x${pDepth}x${pHeight}`,
            baseArea
        };

        if (!bestResult || totalProducts > bestResult.totalProducts || 
            (totalProducts === bestResult.totalProducts && baseArea > bestBaseArea)) {
            bestResult = result;
            bestBaseArea = baseArea;
        }
    }

    if (!bestResult) {
        resultDiv.innerHTML = "<div id='error'>No se encontró una orientación válida para el producto en el contenedor.</div>";
        document.getElementById("exportPdf").style.display = "none";
    } else {
        const shapeText = shape === "prism" ? "Prisma" : shape === "cylinder" ? "Cilindro (78.5%)" : "Esfera (52.4%)";
        resultDiv.innerHTML = `
            <div id='success'>
                <p><strong>Orientación óptima (Ancho x Largo x Alto):</strong> ${bestResult.orientation} cm</p>
                <p><strong>Total productos:</strong> ${bestResult.totalProducts}</p>
                <p><strong>Productos por ancho:</strong> ${bestResult.productsPerWidth}</p>
                <p><strong>Productos por largo:</strong> ${bestResult.productsPerDepth}</p>
                <p><strong>Productos en altura:</strong> ${bestResult.productsPerHeight}</p>
                <p><strong>Porcentaje de espacio utilizado:</strong> ${bestResult.volumeUsage.toFixed(2)}%</p>
                <p><strong>Porcentaje de peso utilizado:</strong> ${bestResult.weightUsage.toFixed(2)}%</p>
                <p><strong>Densidad de carga:</strong> ${bestResult.loadDensity.toFixed(2)} kg/m³</p>
                <p><strong>Centro de gravedad:</strong> ${bestResult.centerOfGravity.toFixed(2)} cm (Altura segura: ${safeHeight} cm)</p>
                <p><strong>Forma ajustada:</strong> ${shapeText}</p>
            </div>
        `;
        document.getElementById("exportPdf").style.display = "block";
        window.bestResult = bestResult;
        window.shapeText = shapeText;
        window.inputData = {
            containerHeight,
            containerWidth,
            containerDepth,
            containerMaxWeight,
            safeHeight,
            margin: margin * 100,
            productHeight,
            productWidth,
            productDepth,
            productWeight
        };
        initThreeJS();
        addProducts(bestResult);
        createChart(bestResult.volumeUsage, bestResult.weightUsage);
    }
}

function exportToPdf() {
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
        `Alto: ${inputData.containerHeight} cm`,
        `Ancho: ${inputData.containerWidth} cm`,
        `Largo: ${inputData.containerDepth} cm`,
        `Capacidad Máxima: ${inputData.containerMaxWeight} kg`,
        `Altura Segura: ${inputData.safeHeight} cm`,
        `Margen de Maniobra: ${inputData.margin}%`,
        "",
        "Medidas del Producto:",
        `Alto: ${inputData.productHeight} cm`,
        `Ancho: ${inputData.productWidth} cm`,
        `Largo: ${inputData.productDepth} cm`,
        `Peso: ${inputData.productWeight} kg`
    ];
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
        `Orientación óptima (Ancho x Largo x Alto): ${result.orientation} cm`,
        `Total productos: ${result.totalProducts}`,
        `Productos por ancho: ${result.productsPerWidth}`,
        `Productos por largo: ${result.productsPerDepth}`,
        `Productos en altura: ${result.productsPerHeight}`,
        `Porcentaje de espacio utilizado: ${result.volumeUsage.toFixed(2)}%`,
        `Porcentaje de peso utilizado: ${result.weightUsage.toFixed(2)}%`,
        `Densidad de carga: ${result.loadDensity.toFixed(2)} kg/m³`,
        `Centro de gravedad: ${result.centerOfGravity.toFixed(2)} cm (Altura segura: ${safeHeight} cm)`,
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
        doc.addImage(imgData, 'PNG', 10, yPosition, 50, 50);
        yPosition += 60;
    }

    // Añadir el diagrama de barras
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

// Función para el botón de atrás
function goBack() {
    // Por ahora, recarga la página como placeholder. Puedes cambiarlo a window.location.href = 'URL_DE_PAGINA_ANTERIOR';
    window.location.href(https://log-upec.github.io/Tes_Vin/inicio.html);
}

// Habilitar/deshabilitar input de máximo de filas según "Frágil"
document.getElementById("fragile").addEventListener("change", function() {
    document.getElementById("maxStack").disabled = !this.checked;
});

initThreeJS(); // Inicializar escena al cargar
