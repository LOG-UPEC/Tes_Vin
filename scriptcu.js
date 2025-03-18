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

let productCount = 1;

function addProduct() {
    productCount++;
    const productsContainer = document.getElementById("productsContainer");
    const newProductDiv = document.createElement("div");
    newProductDiv.className = "product";
    newProductDiv.innerHTML = `
        <h3>Producto ${productCount}</h3>
        <label>Alto (cm): <input type="number" class="altoProducto" value="110"></label>
        <label>Ancho (cm): <input type="number" class="anchoProducto" value="63"></label>
        <label>Largo (cm): <input type="number" class="largoProducto" value="110"></label>
        <label>Peso (kg): <input type="number" class="pesoProducto" value="456"></label>
        <label>Forma:
            <select class="shape">
                <option value="prism">Prisma</option>
                <option value="cylinder">Cilindro</option>
                <option value="sphere">Esfera</option>
            </select>
        </label>
        <label><input type="checkbox" class="fragil"> Frágil</label>
        <label><input type="checkbox" class="noApilable"> No Apilable</label>
        <label>Máximo de Filas Apiladas (si es frágil): <input type="number" class="maxStack" value="3" disabled></label>
        <button onclick="this.parentElement.remove()">Eliminar Producto</button>
    `;
    productsContainer.appendChild(newProductDiv);
    updateFragilListeners();
}

function updateFragilListeners() {
    document.querySelectorAll(".fragil").forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            const maxStackInput = this.parentElement.parentElement.querySelector(".maxStack");
            maxStackInput.disabled = !this.checked;
        });
    });
}

let scene, camera, renderer, products = [];
let cameraDistance = 3;
let chart;
let controls;

function initThreeJS() {
    console.log("Inicializando Three.js...");
    if (typeof THREE === 'undefined') {
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
    camera.position.set(
        containerDepth / 2 + cameraDistance,
        containerHeight / 2 + cameraDistance,
        containerWidth / 2 + cameraDistance
    );
    camera.lookAt(containerDepth / 2, containerHeight / 2, containerWidth / 2);
}

function zoomIn() {
    const maxDim = Math.max(
        (parseFloat(document.getElementById("anchoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("altoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("largoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1
    );
    cameraDistance -= maxDim * 0.2;
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
    cameraDistance += maxDim * 0.2;
    cameraDistance = Math.max(0.5, Math.min(cameraDistance, maxDim * 10));
    updateCameraPosition(maxDim,
        (parseFloat(document.getElementById("anchoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("altoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1,
        (parseFloat(document.getElementById("largoContenedor").value) * (1 - (parseFloat(document.getElementById("margen").value) / 100 || 0.05))) / 100 || 1
    );
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
}

function addProducts(result) {
    console.log("Añadiendo productos:", result);
    const gap = 0.01;

    // Validar que result.placedProducts sea un array
    if (!Array.isArray(result.placedProducts)) {
        console.error("placedProducts no es un array:", result.placedProducts);
        return;
    }

    // Si no hay productos colocados, salir
    if (result.placedProducts.length === 0) {
        console.warn("No hay productos para mostrar en el gráfico 3D.");
        return;
    }

    result.placedProducts.forEach(product => {
        const geometry = new THREE.BoxGeometry(product.largo / 100, product.alto / 100, product.ancho / 100);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

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

function calcularCubicaje() {
    console.log("Ejecutando calcularCubicaje() con algoritmo Corner Points...");

    // Obtener datos del contenedor
    const contenedor = {
        alto: parseFloat(document.getElementById("altoContenedor").value) || 0,
        ancho: parseFloat(document.getElementById("anchoContenedor").value) || 0,
        largo: parseFloat(document.getElementById("largoContenedor").value) || 0,
        pesoMax: parseFloat(document.getElementById("pesoMaxContenedor").value) || 0,
        alturaSegura: parseFloat(document.getElementById("alturaSegura").value) || 0,
        margen: parseFloat(document.getElementById("margen").value) / 100 || 0.05
    };

    // Obtener datos de los productos
    const products = [];
    const productElements = document.querySelectorAll(".product");
    productElements.forEach((element, index) => {
        const producto = {
            alto: parseFloat(element.querySelector(".altoProducto").value) || 0,
            ancho: parseFloat(element.querySelector(".anchoProducto").value) || 0,
            largo: parseFloat(element.querySelector(".largoProducto").value) || 0,
            peso: parseFloat(element.querySelector(".pesoProducto").value) || 0,
            shape: element.querySelector(".shape").value,
            fragil: element.querySelector(".fragil").checked,
            noApilable: element.querySelector(".noApilable").checked,
            maxStack: parseInt(element.querySelector(".maxStack").value) || 3
        };
        products.push(producto);
    });

    const orientacion = document.querySelector('input[name="orientacion"]:checked').value;
    const resultDiv = document.getElementById("result");

    // Validaciones
    if (isNaN(contenedor.alto) || isNaN(contenedor.ancho) || isNaN(contenedor.largo) || isNaN(contenedor.pesoMax) ||
        contenedor.alto <= 0 || contenedor.ancho <= 0 || contenedor.largo <= 0 || contenedor.pesoMax <= 0) {
        resultDiv.innerHTML = "<div id='error'>Por favor, ingrese todas las medidas del contenedor correctamente (valores positivos).</div>";
        document.getElementById("exportPdf").style.display = "none";
        return;
    }

    for (let producto of products) {
        if (isNaN(producto.alto) || isNaN(producto.ancho) || isNaN(producto.largo) || isNaN(producto.peso) ||
            producto.alto <= 0 || producto.ancho <= 0 || producto.largo <= 0 || producto.peso <= 0) {
            resultDiv.innerHTML = "<div id='error'>Por favor, ingrese todas las medidas de los productos correctamente (valores positivos).</div>";
            document.getElementById("exportPdf").style.display = "none";
            return;
        }
    }

    // Ajuste por margen
    const contenedorAjustado = {
        altoAjustado: contenedor.alto * (1 - contenedor.margen),
        anchoAjustado: contenedor.ancho * (1 - contenedor.margen),
        largoAjustado: contenedor.largo * (1 - contenedor.margen),
        pesoMax: contenedor.pesoMax,
        alturaSegura: contenedor.alturaSegura || contenedor.alto
    };

    // Generar orientaciones para cada producto
    const allItems = [];
    products.forEach((producto, index) => {
        let orientaciones = [];
        switch (orientacion) {
            case "none":
                orientaciones = [
                    { ancho: producto.ancho, largo: producto.largo, alto: producto.alto, volumen: producto.ancho * producto.largo * producto.alto },
                    { ancho: producto.ancho, largo: producto.alto, alto: producto.largo, volumen: producto.ancho * producto.alto * producto.largo },
                    { ancho: producto.largo, largo: producto.ancho, alto: producto.alto, volumen: producto.largo * producto.ancho * producto.alto },
                    { ancho: producto.largo, largo: producto.alto, alto: producto.ancho, volumen: producto.largo * producto.alto * producto.ancho },
                    { ancho: producto.alto, largo: producto.ancho, alto: producto.largo, volumen: producto.alto * producto.ancho * producto.largo },
                    { ancho: producto.alto, largo: producto.largo, alto: producto.ancho, volumen: producto.alto * producto.largo * producto.ancho }
                ];
                break;
            case "horizontal":
                orientaciones = [
                    { ancho: producto.ancho, largo: producto.largo, alto: producto.alto, volumen: producto.ancho * producto.largo * producto.alto },
                    { ancho: producto.largo, largo: producto.ancho, alto: producto.alto, volumen: producto.largo * producto.ancho * producto.alto }
                ];
                break;
            case "vertical":
                orientaciones = [{ ancho: producto.ancho, largo: producto.largo, alto: producto.alto, volumen: producto.ancho * producto.largo * producto.alto }];
                break;
        }

        // Generar items basados en el peso máximo permitido
        const maxItemsByWeight = Math.floor(contenedor.pesoMax / producto.peso);
        orientaciones.forEach(orient => {
            for (let i = 0; i < maxItemsByWeight; i++) {
                allItems.push({
                    ...orient,
                    peso: producto.peso,
                    shape: producto.shape,
                    fragil: producto.fragil,
                    noApilable: producto.noApilable,
                    maxStack: producto.maxStack,
                    productIndex: index
                });
            }
        });
    });

    // Ordenar por volumen decreciente
    allItems.sort((a, b) => b.volumen - a.volumen);

    // Algoritmo Corner Points
    let cornerPoints = [{ x: 0, y: 0, z: 0 }];
    let placedProducts = [];
    let totalWeight = 0;
    let occupiedSpaces = [];

    for (let item of allItems) {
        if (totalWeight + item.peso > contenedor.pesoMax) continue;

        let placed = false;
        let bestPoint = null;
        let bestScore = Infinity;

        // Asegurarse de que cornerPoints sea un array
        if (!Array.isArray(cornerPoints)) {
            console.error("cornerPoints no es un array:", cornerPoints);
            cornerPoints = [];
        }

        // Evaluar cada punto de esquina
        for (let point of cornerPoints) {
            const { x, y, z } = point;
            const endX = x + item.largo;
            const endY = y + item.alto;
            const endZ = z + item.ancho;

            // Verificar límites del contenedor y altura segura
            if (endX > contenedorAjustado.largoAjustado || endY > contenedorAjustado.alturaSegura || endZ > contenedorAjustado.anchoAjustado) {
                continue;
            }

            // Verificar restricciones de apilamiento
            if (item.noApilable && y > 0) continue;
            if (item.fragil && y > 0) {
                const itemsBelow = placedProducts.filter(p =>
                    p.x < endX && p.x + p.largo > x &&
                    p.z < endZ && p.z + p.ancho > z &&
                    p.y + p.alto === y
                ).length;
                if (itemsBelow >= item.maxStack) continue;
            }

            // Verificar colisiones
            let collides = false;
            for (let placed of occupiedSpaces) {
                if (!(endX <= placed.x || x >= placed.x + placed.largo ||
                      endY <= placed.y || y >= placed.y + placed.alto ||
                      endZ <= placed.z || z >= placed.z + placed.ancho)) {
                    collides = true;
                    break;
                }
            }
            if (collides) continue;

            // Calcular un "score" para priorizar puntos (menor Y, luego menor X, luego menor Z)
            const score = y * 1000000 + x * 1000 + z;
            if (score < bestScore) {
                bestScore = score;
                bestPoint = point;
            }
        }

        if (bestPoint) {
            const { x, y, z } = bestPoint;
            placedProducts.push({
                x, y, z,
                largo: item.largo,
                alto: item.alto,
                ancho: item.ancho,
                peso: item.peso,
                shape: item.shape,
                productIndex: item.productIndex
            });
            occupiedSpaces.push({ x, y, z, largo: item.largo, alto: item.alto, ancho: item.ancho });
            totalWeight += item.peso;

            // Añadir nuevos puntos de esquina
            cornerPoints = cornerPoints.filter(p => p !== bestPoint);
            cornerPoints.push({ x: x + item.largo, y, z });
            cornerPoints.push({ x, y: y + item.alto, z });
            cornerPoints.push({ x, y, z: z + item.ancho });

            // Filtrar puntos de esquina redundantes o fuera de límites
            cornerPoints = cornerPoints.filter(p =>
                p.x <= contenedorAjustado.largoAjustado &&
                p.y <= contenedorAjustado.alturaSegura &&
                p.z <= contenedorAjustado.anchoAjustado
            );

            // Eliminar puntos que están dentro de espacios ocupados
            cornerPoints = cornerPoints.filter(point => {
                for (let space of occupiedSpaces) {
                    if (point.x >= space.x && point.x <= space.x + space.largo &&
                        point.y >= space.y && point.y <= space.y + space.alto &&
                        point.z >= space.z && point.z <= space.z + space.ancho) {
                        return false;
                    }
                }
                return true;
            });

            placed = true;
        }

        if (!placed) continue;
    }

    // Calcular estadísticas
    const totalProductos = placedProducts.length;
    let usedVolume = 0;
    placedProducts.forEach(product => {
        let volumeFactor = 1.0;
        switch (product.shape) {
            case "cylinder": volumeFactor = 0.785; break;
            case "sphere": volumeFactor = 0.524; break;
        }
        usedVolume += (product.ancho * product.largo * product.alto) * volumeFactor;
    });
    const contenedorVolumen = contenedorAjustado.altoAjustado * contenedorAjustado.anchoAjustado * contenedorAjustado.largoAjustado;
    const volumeUsage = Math.min(100, (usedVolume / contenedorVolumen) * 100);
    const weightUsage = (totalWeight / contenedor.pesoMax) * 100;
    const loadDensity = totalProductos > 0 ? (totalWeight) / (usedVolume / 1000000) : 0;
    const centerOfGravity = totalProductos > 0 ? placedProducts.reduce((sum, p) => sum + (p.y + p.alto / 2), 0) / totalProductos : 0;

    // Desglose por producto
    const productCounts = {};
    placedProducts.forEach(p => {
        productCounts[p.productIndex] = (productCounts[p.productIndex] || 0) + 1;
    });

    let resultHTML = `
        <div id='success'>
            <p><strong>Total productos:</strong> ${totalProductos}</p>
    `;
    Object.keys(productCounts).forEach(index => {
        resultHTML += `<p><strong>Producto ${parseInt(index) + 1}:</strong> ${productCounts[index]} unidades</p>`;
    });
    resultHTML += `
            <p><strong>Porcentaje de espacio utilizado:</strong> ${volumeUsage.toFixed(2)}%</p>
            <p><strong>Porcentaje de peso utilizado:</strong> ${weightUsage.toFixed(2)}%</p>
            <p><strong>Densidad de carga:</strong> ${loadDensity.toFixed(2)} kg/m³</p>
            <p><strong>Centro de gravedad:</strong> ${centerOfGravity.toFixed(2)} cm (Altura segura: ${contenedor.alturaSegura} cm)</p>
        </div>
    `;
    resultDiv.innerHTML = resultHTML;

    document.getElementById("exportPdf").style.display = "block";
    window.bestResult = {
        totalProductos: totalProductos,
        productCounts: productCounts,
        volumeUsage: volumeUsage,
        weightUsage: weightUsage,
        loadDensity: loadDensity,
        centerOfGravity: centerOfGravity,
        placedProducts: placedProducts
    };
    window.inputData = {
        altoContenedor: contenedor.alto,
        anchoContenedor: contenedor.ancho,
        largoContenedor: contenedor.largo,
        pesoMaxContenedor: contenedor.pesoMax,
        alturaSegura: contenedor.alturaSegura,
        margen: contenedor.margen * 100,
        products: products
    };
    initThreeJS();
    addProducts({ placedProducts: placedProducts });
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
    let inputText = [
        "Medidas del Contenedor:",
        `Alto: ${inputData.altoContenedor} cm`,
        `Ancho: ${inputData.anchoContenedor} cm`,
        `Largo: ${inputData.largoContenedor} cm`,
        `Capacidad Máxima: ${inputData.pesoMaxContenedor} kg`,
        `Altura Segura: ${inputData.alturaSegura} cm`,
        `Margen de Maniobra: ${inputData.margen}%`,
        ""
    ];
    inputData.products.forEach((product, index) => {
        inputText.push(`Producto ${index + 1}:`);
        inputText.push(`Alto: ${product.alto} cm`);
        inputText.push(`Ancho: ${product.ancho} cm`);
        inputText.push(`Largo: ${product.largo} cm`);
        inputText.push(`Peso: ${product.peso} kg`);
        inputText.push(`Forma: ${product.shape === "prism" ? "Prisma" : product.shape === "cylinder" ? "Cilindro (78.5%)" : "Esfera (52.4%)"}`);
        inputText.push("");
    });
    doc.text(inputText, 10, yPosition, { maxWidth: 180 });
    yPosition += inputText.length * 5 + 10;

    // Resultados
    doc.setFontSize(14);
    doc.text("Resultados", 10, yPosition);
    yPosition += 8;
    doc.setFontSize(12);
    const result = window.bestResult;
    let resultText = [
        `Total productos: ${result.totalProductos}`
    ];
    Object.keys(result.productCounts).forEach(index => {
        resultText.push(`Producto ${parseInt(index) + 1}: ${result.productCounts[index]} unidades`);
    });
    resultText.push(`Porcentaje de espacio utilizado: ${result.volumeUsage.toFixed(2)}%`);
    resultText.push(`Porcentaje de peso utilizado: ${result.weightUsage.toFixed(2)}%`);
    resultText.push(`Densidad de carga: ${result.loadDensity.toFixed(2)} kg/m³`);
    resultText.push(`Centro de gravedad: ${result.centerOfGravity.toFixed(2)} cm (Altura segura: ${inputData.alturaSegura} cm)`);
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

updateFragilListeners();
initThreeJS();
