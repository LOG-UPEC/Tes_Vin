function calculateCubicaje() {
    // Obtener valores de los inputs
    const containerHeight = parseFloat(document.getElementById("containerHeight").value);
    const containerWidth = parseFloat(document.getElementById("containerWidth").value);
    const containerDepth = parseFloat(document.getElementById("containerDepth").value);
    const containerMaxWeight = parseFloat(document.getElementById("containerMaxWeight").value);
    
    const productHeight = parseFloat(document.getElementById("productHeight").value);
    const productWidth = parseFloat(document.getElementById("productWidth").value);
    const productDepth = parseFloat(document.getElementById("productDepth").value);
    const productWeight = parseFloat(document.getElementById("productWeight").value);

    const resultDiv = document.getElementById("result");

    // Validar que todos los campos estén completos y sean válidos
    if (isNaN(containerHeight) || isNaN(containerWidth) || isNaN(containerDepth) || isNaN(containerMaxWeight) ||
        isNaN(productHeight) || isNaN(productWidth) || isNaN(productDepth) || isNaN(productWeight)) {
        resultDiv.innerHTML = "<div id='error'>Por favor, ingrese todas las medidas correctamente.</div>";
        return;
    }

    // Definir margen de maniobra (5%)
    const margin = 0.05; // 5% de margen

    // Aplicar margen a las dimensiones del contenedor
    const adjustedContainerHeight = containerHeight * (1 - margin);
    const adjustedContainerWidth = containerWidth * (1 - margin);
    const adjustedContainerDepth = containerDepth * (1 - margin);

    // Calcular volumen del contenedor y del producto
    const containerVolume = adjustedContainerHeight * adjustedContainerWidth * adjustedContainerDepth;
    const productVolume = productHeight * productWidth * productDepth;

    // Verificar si el producto cabe en el volumen del contenedor
    if (productVolume > containerVolume) {
        resultDiv.innerHTML = "<div id='error'>El producto no cabe en el contenedor por volumen (considerando un margen de maniobra).</div>";
        return;
    }

    // Verificar si las dimensiones individuales son válidas considerando el margen
    if (productHeight > adjustedContainerHeight || productWidth > adjustedContainerWidth || productDepth > adjustedContainerDepth) {
        resultDiv.innerHTML = "<div id='error'>El producto no cabe en el contenedor por dimensiones (considerando un margen de maniobra).</div>";
        return;
    }

    // Cálculos para productos por fila
    const productsPerRowWidth = Math.floor(adjustedContainerWidth / productWidth);
    const productsPerRowDepth = Math.floor(adjustedContainerDepth / productDepth);
    const productsPerHeight = Math.floor(adjustedContainerHeight / productHeight);
    
    // Calcular el total máximo de productos que caben según el volumen y dimensiones
    let totalProducts = productsPerRowWidth * productsPerRowDepth * productsPerHeight;

    // Ajustar el número de productos para no exceder la capacidad de peso del contenedor
    while (totalProducts * productWeight > containerMaxWeight) {
        totalProducts--;
    }
    
    // Calcular el peso y volumen utilizados
    const usedWeight = totalProducts * productWeight;
    const usedVolume = totalProducts * productVolume;
    const volumeUsage = (usedVolume / containerVolume) * 100;
    const volumeUnused = 100 - volumeUsage;
    const weightUsage = (usedWeight / containerMaxWeight) * 100;
    const loadDensity = usedWeight / usedVolume;

    // Mostrar resultados
    resultDiv.innerHTML = `
        <div id='success'>
            <p>El producto cabe en el contenedor (considerando el margen de maniobra).</p>
            <p><strong>Total productos por fila (ancho):</strong> ${productsPerRowWidth}</p>
            <p><strong>Total productos por fila (largo):</strong> ${productsPerRowDepth}</p>
            <p><strong>Total productos en altura:</strong> ${productsPerHeight}</p>
            <p><strong>Total productos permitidos:</strong> ${totalProducts}</p>
            <p><strong>Porcentaje de espacio utilizado:</strong> ${volumeUsage.toFixed(2)}%</p>
            <p><strong>Porcentaje de espacio sin uso:</strong> ${volumeUnused.toFixed(2)}%</p>
            <p><strong>Porcentaje de peso utilizado:</strong> ${weightUsage.toFixed(2)}%</p>
            <p><strong>Densidad de carga:</strong> ${loadDensity.toFixed(2)} kg/m³</p>
        </div>
    `;
}
