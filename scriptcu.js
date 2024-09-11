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

    // Calcular volumen del contenedor y del producto
    const containerVolume = containerHeight * containerWidth * containerDepth;
    const productVolume = productHeight * productWidth * productDepth;

    // Verificar si el producto cabe en el volumen del contenedor
    if (productVolume > containerVolume) {
        resultDiv.innerHTML = "<div id='error'>El producto no cabe en el contenedor por volumen.</div>";
        return;
    }

    // Verificar si las dimensiones individuales son válidas
    if (productHeight > containerHeight || productWidth > containerWidth || productDepth > containerDepth) {
        resultDiv.innerHTML = "<div id='error'>El producto no cabe en el contenedor por dimensiones.</div>";
        return;
    }

    // Verificar si el peso es válido
    if (productWeight > containerMaxWeight) {
        resultDiv.innerHTML = "<div id='error'>El producto excede el peso máximo permitido.</div>";
        return;
    }

    resultDiv.innerHTML = "<div id='success'>El producto cabe en el contenedor.</div>";
}

