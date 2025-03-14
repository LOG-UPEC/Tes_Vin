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
    if (window.scene) initThreeJS();
}

let scene, camera, renderer, controls, products = [];

function initThreeJS() {
    console.log("Inicializando Three.js...");
    if (!THREE) {
        console.error("Three.js no está definido. Verifica que la librería se cargó.");
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
    document.getElementById('threejs-container').appendChild(renderer.domElement);

    // Configurar controles de órbita
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.5;
    controls.maxDistance = 10;

    const containerWidth = parseFloat(document.getElementById("containerWidth").value) / 100 || 1;
    const containerHeight = parseFloat(document.getElementById("containerHeight").value) / 100 || 1;
    const containerDepth = parseFloat(document.getElementById("containerDepth").value) / 100 || 1;
    const containerGeometry = new THREE.BoxGeometry(containerWidth, containerHeight, containerDepth);
    const containerEdges = new THREE.EdgesGeometry(containerGeometry);
    const containerMaterial = new THREE.LineBasicMaterial({ color: 0x808080 });
    const containerWireframe = new THREE.LineSegments(containerEdges, containerMaterial);
    containerWireframe.position.set(containerWidth / 2, containerHeight / 2, containerDepth / 2);
    scene.add(containerWireframe);

    const maxDim = Math.max(containerWidth, containerHeight, containerDepth);
    camera.position.set(maxDim * 3, maxDim * 3, maxDim * 3);
    camera.lookAt(containerWidth / 2, containerHeight / 2, containerDepth / 2);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
}

function addProducts(result) {
    console.log("Añadiendo productos:", result);
    const productWidth = parseFloat(document.getElementById("productWidth").value) / 100 || 0.1;
    const productHeight = parseFloat(document.getElementById("productHeight").value) / 100 || 0.1;
    const productDepth = parseFloat(document.getElementById("productDepth").value) / 100 || 0.1;

    const geometry = new THREE.BoxGeometry(productWidth, productHeight, productDepth);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });

    for (let x = 0; x < result.productsPerWidth; x++) {
        for (let z = 0; z < result.productsPerDepth; z++) {
            for (let y = 0; y < result.productsPerHeight; y++) {
                const product = new THREE.Mesh(geometry, material);
                product.position.set(
                    x * productWidth + productWidth / 2,
                    y * productHeight + productHeight / 2,
                    z * productDepth + productDepth / 2
                );

                const edges = new THREE.EdgesGeometry(geometry);
                const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
                const edgesLine = new THREE.LineSegments(edges, edgesMaterial);
                edgesLine.position.copy(product.position);
                scene.add(edgesLine);

                products.push(product);
                scene.add(product);
            }
        }
    }
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

        const result = {
            totalProducts,
            productsPerWidth,
            productsPerDepth,
            productsPerHeight,
            volumeUsage,
            weightUsage,
            loadDensity,
            centerOfGravity,
            orientation: `${pWidth}x${pDepth}x${pHeight}`
        };

        if (!bestResult || totalProducts > bestResult.totalProducts) {
            bestResult = result;
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
        initThreeJS();
        addProducts(bestResult);
    }
}

function exportToPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Resultado de Cubicaje - OPTITRANS", 10, 10);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 20);

    const result = window.bestResult;
    const shapeText = window.shapeText;
    const text = [
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

    doc.text(text, 10, 30, { maxWidth: 180 });
    doc.save("cubicaje_optitrans.pdf");
}

document.getElementById("fragile").addEventListener("change", function() {
    document.getElementById("maxStack").disabled = !this.checked;
});

// Esperar a que se cargue
window.addEventListener('load', function() {
    if (typeof THREE !== 'undefined') {
        initThreeJS();
    } else {
        console.error("Three.js no se cargó correctamente al iniciar.");
    }
});
