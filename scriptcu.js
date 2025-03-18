// Presets de contenedores (sin cambios)
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

    // Contenedor (ajustamos el orden: ancho, alto, largo)
    const margin = parseFloat(document.getElementById("margen").value) / 100 || 0.05;
    const containerWidth = (parseFloat(document.getElementById("anchoContenedor").value) * (1 - margin)) / 100 || 1; // Z = ancho
    const containerHeight = (parseFloat(document.getElementById("altoContenedor").value) * (1 - margin)) / 100 || 1; // Y = alto
    const containerDepth = (parseFloat(document.getElementById("largoContenedor").value) * (1 - margin)) / 100 || 1; // X = largo
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
    camera.lookAt(containerDepth / 2, containerHeight / 2, containerWidth / 2); // Mirar al centro del contenedor
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
    console.log("Añadiendo productos:", result);
    const [pWidth, pDepth, pHeight] = result.orientacionOptima.map(x => x / 100); // ancho, largo, alto en metros
    const productWidth = pWidth; // Z = ancho
    const productHeight = pHeight; // Y = alto
    const productDepth = pDepth; // X = largo
    const gap = 0; // Sin espacio entre productos

    const margin = parseFloat(document.getElementById("margen").value) / 100 || 0.05;
    const containerWidth = (parseFloat(document.getElementById("anchoContenedor").value) * (1 - margin)) / 100 || 1; // Z = ancho
    const containerHeight = (parseFloat(document.getElementById("altoContenedor").value) * (1 - margin)) / 100 || 1; // Y = alto
    const containerDepth = (parseFloat(document.getElementById("largoContenedor").value) * (1 - margin)) / 100 || 1; // X = largo

    const geometry = new THREE.BoxGeometry(productDepth, productHeight, productWidth); // X = largo, Y = alto, Z = ancho
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });

    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

    const totalWidth = result.desglose.productosAncho * productDepth;
    const totalDepth = result.desglose.productosLargo * productWidth;
    const totalHeight = result.desglose.capasCompletas * productHeight;

    const offsetX = (containerDepth - totalWidth) / 2;
    const offsetZ = (containerWidth - totalDepth) / 2;

    // Dibujar capas completas
    for (let y = 0; y < result.desglose.capasCompletas; y++) {
        for (let x = 0; x < result.desglose.productosAncho; x++) {
            for (let z = 0; z < result.desglose.productosLargo; z++) {
                const product = new THREE.Mesh(geometry, material);
                product.position.set(
                    offsetX + x * productDepth + productDepth / 2, // X = largo
                    y * productHeight + productHeight / 2, // Y = alto
                    offsetZ + z * productWidth + productWidth / 2 // Z = ancho
                );

                const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
                edges.position.copy(product.position);

                products.push(product);
                scene.add(product);
                scene.add(edges);
            }
        }
    }

    // Dibujar sobrantes como productos individuales
    if (result.desglose.sobrantes > 0) {
        const capaSobrante = result.desglose.capasCompletas;
        let sobrantesRestantes = result.desglose.sobrantes;
        let x = 0, z = 0;

        while (sobrantesRestantes > 0 && x < result.desglose.productosAncho && z < result.desglose.productosLargo) {
            const product = new THREE.Mesh(geometry, material);
            product.position.set(
                offsetX + x * productDepth + productDepth / 2, // X = largo
                capaSobrante * productHeight + productHeight / 2, // Y = alto
                offsetZ + z * productWidth + productWidth / 2 // Z = ancho
            );

            const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
            edges.position.copy(product.position);

            products.push(product);
            scene.add(product);
            scene.add(edges);

            sobrantesRestantes--;
            z++;
            if (z >= result.desglose.productosLargo) {
                z = 0;
                x++;
            }
        }
    }
}

// Resto del código (calcularCubicaje, createChart, exportToPdf, etc.) permanece igual
// Solo incluimos las partes modificadas para brevity

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

function calcularCubicaje() {
    console.log("Ejecutando calcularCubicaje()...");

    const contenedor = {
        alto: parseFloat(document.getElementById("altoContenedor").value) || 0,
        ancho: parseFloat(document.getElementById("anchoContenedor").value) || 0,
        largo: parseFloat(document.getElementById("largoContenedor").value) || 0,
        pesoMax: parseFloat(document.getElementById("pesoMaxContenedor").value) || 0,
        alturaSegura: parseFloat(document.getElementById("alturaSegura").value) || 0,
        margen: parseFloat(document.getElementById("margen").value) / 100 || 0.05
    };
    const producto = {
        alto: parseFloat(document.getElementById("altoProducto").value) || 0,
        ancho: parseFloat(document.getElementById("anchoProducto").value) || 0,
        largo: parseFloat(document.getElementById("largoProducto").value) || 0,
        peso: parseFloat(document.getElementById("pesoProducto").value) || 0,
        fragil: document.getElementById("fragil").checked,
        noApilable: document.getElementById("noApilable").checked
    };
    const orientacion = document.querySelector('input[name="orientacion"]:checked').value;
    const shape = document.getElementById("shape").value;

    const resultDiv = document.getElementById("result");

    // Validaciones (sin cambios)
    if (isNaN(contenedor.alto) || isNaN(contenedor.ancho) || isNaN(contenedor.largo) || isNaN(contenedor.pesoMax) ||
        isNaN(producto.alto) || isNaN(producto.ancho) || isNaN(producto.largo) || isNaN(producto.peso) ||
        contenedor.alto <= 0 || contenedor.ancho <= 0 || contenedor.largo <= 0 || contenedor.pesoMax <= 0 ||
        producto.alto <= 0 || producto.ancho <= 0 || producto.largo <= 0 || producto.peso <= 0) {
        console.log("Error: Datos inválidos.");
        resultDiv.innerHTML = "<div id='error'>Por favor, ingrese todas las medidas correctamente (valores positivos).</div>";
        document.getElementById("exportPdf").style.display = "none";
        return;
    }

    // Ajuste por margen (sin cambios)
    const contenedorAjustado = {
        altoAjustado: contenedor.alto * (1 - contenedor.margen),
        anchoAjustado: contenedor.ancho * (1 - contenedor.margen),
        largoAjustado: contenedor.largo * (1 - contenedor.margen),
        pesoMax: contenedor.pesoMax,
        alturaSegura: contenedor.alturaSegura || contenedor.alto
    };

    // Factor de volumen según forma (sin cambios)
    let volumeFactor = 1.0;
    switch (shape) {
        case "cylinder": volumeFactor = 0.785; break;
        case "sphere": volumeFactor = 0.524; break;
    }
    const productoVolumen = producto.alto * producto.ancho * producto.largo * volumeFactor;
    const contenedorVolumen = contenedorAjustado.altoAjustado * contenedorAjustado.anchoAjustado * contenedorAjustado.largoAjustado;

    if (productoVolumen > contenedorVolumen) {
        console.log("Error: Producto no cabe en el contenedor.");
        resultDiv.innerHTML = "<div id='error'>El producto no cabe en el contenedor por volumen (con margen).</div>";
        document.getElementById("exportPdf").style.display = "none";
        return;
    }

    // Generar orientaciones (sin cambios)
    let orientaciones = [];
    switch (orientacion) {
        case "none":
            orientaciones = [
                [producto.ancho, producto.largo, producto.alto],
                [producto.ancho, producto.alto, producto.largo],
                [producto.largo, producto.ancho, producto.alto],
                [producto.largo, producto.alto, producto.ancho],
                [producto.alto, producto.ancho, producto.largo],
                [producto.alto, producto.largo, producto.ancho]
            ];
            break;
        case "horizontal":
            orientaciones = [
                [producto.ancho, producto.largo, producto.alto],
                [producto.largo, producto.ancho, producto.alto]
            ];
            break;
        case "vertical":
            orientaciones = [[producto.ancho, producto.largo, producto.alto]];
            break;
        case "fixed":
            orientaciones = [[producto.ancho, producto.largo, producto.alto]];
            break;
    }

    // Cálculo óptimo (sin cambios en esta parte)
    let maxProductos = 0, mejorOrientacion = [], mejorDesglose = {};
    orientaciones.forEach(orient => {
        const [anchoP, largoP, altoP] = orient;
        if (anchoP > contenedorAjustado.anchoAjustado || largoP > contenedorAjustado.largoAjustado || altoP > contenedorAjustado.alturaSegura) {
            console.log(`Orientación ${orient} descartada: excede dimensiones.`);
            return;
        }

        const productosAncho = Math.floor(contenedorAjustado.anchoAjustado / anchoP);
        const productosLargo = Math.floor(contenedorAjustado.largoAjustado / largoP);
        let productosAlto = Math.floor(contenedorAjustado.alturaSegura / altoP);

        if (producto.noApilable) productosAlto = 1;
        if (producto.fragil) productosAlto = Math.min(productosAlto, 3);

        const productosPorCapa = productosAncho * productosLargo;
        let totalProductos = productosPorCapa * productosAlto;

        // Ajustar totalProductos para no exceder el peso máximo
        const maxProductosPorPeso = Math.floor(contenedor.pesoMax / producto.peso);
        totalProductos = Math.min(maxProductosPorPeso, totalProductos);

        // Calcular capas completas y sobrantes
        let capasCompletas = Math.floor(totalProductos / productosPorCapa);
        let sobrantes = totalProductos % productosPorCapa;

        // Ajustar capas completas para no exceder la altura segura
        const alturaTotal = capasCompletas * altoP;
        if (alturaTotal > contenedorAjustado.alturaSegura) {
            capasCompletas = Math.floor(contenedorAjustado.alturaSegura / altoP);
            totalProductos = capasCompletas * productosPorCapa;
            sobrantes = Math.min(maxProductosPorPeso - totalProductos, productosPorCapa);
            totalProductos += sobrantes;
        }

        // Intentar añadir productos individuales en la siguiente capa si hay espacio
        let productosRestantes = maxProductosPorPeso - totalProductos;
        if (productosRestantes > 0) {
            const alturaConSobrantes = (capasCompletas + 1) * altoP;
            if (alturaConSobrantes <= contenedorAjustado.alturaSegura) {
                const productosAdicionales = Math.min(productosRestantes, productosPorCapa);
                totalProductos += productosAdicionales;
                sobrantes = productosAdicionales;
                if (sobrantes === productosPorCapa) {
                    capasCompletas++;
                    sobrantes = 0;
                }
            }
        }

        console.log(`Orientación ${orient}: ${totalProductos} productos, peso total: ${totalProductos * producto.peso}`);

        if (totalProductos > maxProductos) {
            maxProductos = totalProductos;
            mejorOrientacion = orient;
            mejorDesglose = {
                productosAncho,
                productosLargo,
                capasCompletas,
                sobrantes
            };
        }
    });

    console.log("Mejor desglose:", mejorDesglose);

    if (!mejorOrientacion.length) {
        console.log("Error: No se encontró orientación válida.");
        resultDiv.innerHTML = "<div id='error'>No se encontró una orientación válida para el producto en el contenedor.</div>";
        document.getElementById("exportPdf").style.display = "none";
    } else {
        const usedVolume = maxProductos * (mejorOrientacion[0] * mejorOrientacion[1] * mejorOrientacion[2] * volumeFactor);
        const volumeUsage = Math.min(100, (usedVolume / contenedorVolumen) * 100);
        const weightUsage = (maxProductos * producto.peso / contenedor.pesoMax) * 100;
        const loadDensity = (maxProductos * producto.peso) / (usedVolume / 1000000);
        const centerOfGravity = (mejorDesglose.capasCompletas * mejorOrientacion[2] + (mejorDesglose.sobrantes > 0 ? mejorOrientacion[2] : 0)) / 2;

        const shapeText = shape === "prism" ? "Prisma" : shape === "cylinder" ? "Cilindro (78.5%)" : "Esfera (52.4%)";
        resultDiv.innerHTML = `
            <div id='success'>
                <p><strong>Orientación óptima (Ancho x Largo x Alto):</strong> ${mejorOrientacion.join('x')} cm</p>
                <p><strong>Total productos:</strong> ${maxProductos}</p>
                <p><strong>Productos por ancho:</strong> ${mejorDesglose.productosAncho}</p>
                <p><strong>Productos por largo:</strong> ${mejorDesglose.productosLargo}</p>
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
            orientacionOptima: mejorOrientacion.join('x'),
            totalProductos: maxProductos,
            desglose: mejorDesglose,
            volumeUsage: volumeUsage,
            weightUsage: weightUsage,
            loadDensity: loadDensity,
            centerOfGravity: centerOfGravity
        };
        window.shapeText = shapeText;
        window.inputData = {
            altoContenedor: contenedor.alto,
            anchoContenedor: contenedor.ancho,
            largoContenedor: contenedor.largo,
            pesoMaxContenedor: contenedor.pesoMax,
            alturaSegura: contenedor.alturaSegura,
            margen: contenedor.margen * 100,
            altoProducto: producto.alto,
            anchoProducto: producto.ancho,
            largoProducto: producto.largo,
            pesoProducto: producto.peso
        };
        initThreeJS();
        addProducts({
            orientacionOptima: mejorOrientacion,
            desglose: mejorDesglose,
            contenedor: contenedorAjustado
        });
        createChart(volumeUsage, weightUsage);
    }
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
        "Medidas del Producto:",
        `Alto: ${inputData.altoProducto} cm`,
        `Ancho: ${inputData.anchoProducto} cm`,
        `Largo: ${inputData.largoProducto} cm`,
        `Peso: ${inputData.pesoProducto} kg`
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
        `Orientación óptima (Ancho x Largo x Alto): ${result.orientacionOptima} cm`,
        `Total productos: ${result.totalProductos}`,
        `Productos por ancho: ${result.desglose.productosAncho}`,
        `Productos por largo: ${result.desglose.productosLargo}`,
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
document.getElementById("fragil").addEventListener("change", function() {
    document.getElementById("maxStack").disabled = !this.checked;
});

initThreeJS(); // Inicializar escena al cargar
