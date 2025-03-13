function calculateCubicaje() {
    // Obtener valores de los inputs
    const containerHeight = parseFloat(document.getElementById("containerHeight").value);
    const containerWidth = parseFloat(document.getElementById("containerWidth").value);
    const containerDepth = parseFloat(document.getElementById("containerDepth").value);
    const containerMaxWeight = parseFloat(document.getElementById("containerMaxWeight").value);
    const safeHeight = parseFloat(document.getElementById("safeHeight").value) || containerHeight; // Por defecto, altura total
    const margin = parseFloat(document.getElementById("margin").value) / 100 || 0.05; // Por defecto, 5%

    const productHeight = parseFloat(document.getElementById("productHeight").value);
    const productWidth = parseFloat(document.getElementById("productWidth").value);
    const productDepth = parseFloat(document.getElementById("productDepth").value);
    const productWeight = parseFloat(document.getElementById("productWeight").value);

    const resultDiv = document.getElementById("result");

    // Validar entradas
    if (isNaN(containerHeight) || isNaN(containerWidth) || isNaN(containerDepth) || isNaN(containerMaxWeight) ||
        isNaN(productHeight) || isNaN(productWidth) || isNaN(productDepth) || isNaN(productWeight) ||
        containerHeight <= 0 || containerWidth <= 0 || containerDepth <= 0 || containerMaxWeight <= 0 ||
        productHeight <= 0 || productWidth <= 0 || productDepth <= 0 || productWeight <= 0) {
        resultDiv.innerHTML = "<div id='error'>Por favor, ingrese todas las medidas correctamente (valores positivos).</div>";
        return;
    }

    // Ajustar dimensiones del contenedor con margen
    const adjustedContainerHeight = containerHeight * (1 - margin);
    const adjustedContainerWidth = containerWidth * (1 - margin);
    const adjustedContainerDepth = containerDepth * (1 - margin);

    // Volumen del contenedor (en cm³)
    const containerVolume = adjustedContainerHeight * adjustedContainerWidth * adjustedContainerDepth;
    const productVolume = productHeight * productWidth * productDepth;

    // Verificar si el producto cabe en el volumen total
    if (productVolume > containerVolume) {
        resultDiv.innerHTML = "<div id='error'>El producto no cabe en el contenedor por volumen (con margen).</div>";
        return;
    }

    // Definir posibles giros del producto (6 combinaciones básicas)
    const orientations = [
        [productWidth, productDepth, productHeight],  // Normal
        [productWidth, productHeight, productDepth],  // Giro en Y
        [productDepth, productWidth, productHeight],  // Giro en X
        [productDepth, productHeight, productWidth],  // Giro en X e Y
        [productHeight, productWidth, productDepth],  // Giro en Z
        [productHeight, productDepth, productWidth]   // Giro en Z e Y
    ];

    let bestResult = null;

    // Probar cada orientación
    for (const [pWidth, pDepth, pHeight] of orientations) {
        // Verificar si cabe en las dimensiones ajustadas
        if (pWidth > adjustedContainerWidth || pDepth > adjustedContainerDepth || pHeight > adjustedContainerHeight) {
            continue; // Esta orientación no cabe
        }

        // Calcular productos por dimensión
        const productsPerWidth = Math.floor(adjustedContainerWidth / pWidth);
        const productsPerDepth = Math.floor(adjustedContainerDepth / pDepth);
        let productsPerHeight = Math.floor(adjustedContainerHeight / pHeight);

        // Total inicial
        let totalProducts = productsPerWidth * productsPerDepth * productsPerHeight;
        let totalWeight = totalProducts * productWeight;

        // Ajustar por peso máximo
        while (totalWeight > containerMaxWeight && productsPerHeight > 0) {
            productsPerHeight--;
            totalProducts = productsPerWidth * productsPerDepth * productsPerHeight;
            totalWeight = totalProducts * productWeight;
        }

        // Ajustar por altura segura
        const totalHeight = productsPerHeight * pHeight;
        if (totalHeight > safeHeight) {
            productsPerHeight = Math.floor(safeHeight / pHeight);
            totalProducts = productsPerWidth * productsPerDepth * productsPerHeight;
            totalWeight = totalProducts * productWeight;
        }

        if (totalProducts <= 0) continue;

        // Calcular métricas
        const usedVolume = totalProducts * productVolume;
        const volumeUsage = (usedVolume / containerVolume) * 100;
        const weightUsage = (totalWeight / containerMaxWeight) * 100;
        const loadDensity = totalWeight / (usedVolume / 1000000); // kg/m³ (cm³ a m³)
        const centerOfGravity = (productsPerHeight * pHeight) / 2; // Altura media en cm

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

        // Seleccionar la mejor orientación (máximo productos)
        if (!bestResult || totalProducts > bestResult.totalProducts) {
            bestResult = result;
        }
    }

    // Mostrar resultados
    if (!bestResult) {
        resultDiv.innerHTML = "<div id='error'>No se encontró una orientación válida para el producto en el contenedor.</div>";
    } else {
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
            </div>
        `;
    }
}
