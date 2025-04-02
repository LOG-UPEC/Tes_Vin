document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const mainContent = document.getElementById('main-content');
    const productoSelect = document.getElementById('producto');
    const grupoSelect = document.getElementById('grupo');
    const searchInput = document.getElementById('search');
    const infoDiv = document.getElementById('info');
    const exportBtn = document.getElementById('export-pdf');

    let productosData = [];
    let cuidadosData = [];
    let etiquetadosData = [];
    let documentosGenerales = [];

    // Función para cargar un CSV
    const loadCSV = (url) => {
        return fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
                return response.text();
            })
            .then(data => Papa.parse(data, { header: true, skipEmptyLines: true }).data);
    };

    // Cargar todos los CSVs
    Promise.all([
        loadCSV('productos.csv'),
        loadCSV('cuidados.csv'),
        loadCSV('etiquetados.csv'),
        loadCSV('documentos_generales.csv')
    ])
    .then(([productos, cuidados, etiquetados, generales]) => {
        productosData = productos;
        cuidadosData = cuidados;
        etiquetadosData = etiquetados;
        documentosGenerales = generales;

        // Ocultar loading y mostrar contenido
        loading.style.display = 'none';
        mainContent.style.display = 'flex';

        // Obtener grupos únicos para el filtro
        const gruposUnicos = [...new Set(productosData.map(p => p.grupo))];
        gruposUnicos.forEach(grupo => {
            const option = document.createElement('option');
            option.value = grupo;
            option.text = grupo;
            grupoSelect.appendChild(option);
        });

        // Obtener productos únicos
        const productosUnicos = [...new Set(productosData.map(p => p.producto))];
        updateProductoSelect(productosUnicos);

        // Filtrar productos por búsqueda y grupo
        const filterProductos = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedGrupo = grupoSelect.value;

            const filteredProductos = productosUnicos.filter(producto => {
                const matchesSearch = producto.toLowerCase().includes(searchTerm);
                const matchesGrupo = !selectedGrupo || productosData.find(p => p.producto === producto).grupo === selectedGrupo;
                return matchesSearch && matchesGrupo;
            });

            updateProductoSelect(filteredProductos);
        };

        searchInput.addEventListener('input', filterProductos);
        grupoSelect.addEventListener('change', filterProductos);

        // Mostrar información del producto seleccionado
        productoSelect.addEventListener('change', () => {
            const selectedProducto = productoSelect.value;
            if (!selectedProducto) {
                infoDiv.innerHTML = '';
                return;
            }

            const productoInfo = productosData.filter(p => p.producto === selectedProducto);
            const cuidadoInfo = cuidadosData.find(c => c.producto === selectedProducto);
            const etiquetadoInfo = etiquetadosData.find(e => e.producto === selectedProducto);

            if (productoInfo.length > 0) {
                const { subpartida, grupo, subgrupo } = productoInfo[0];
                infoDiv.innerHTML = `
                    <h2>${selectedProducto}</h2>
                    <p><strong>Subpartida:</strong> ${subpartida}</p>
                    <p><strong>Grupo:</strong> ${grupo}</p>
                    <p><strong>Subgrupo:</strong> ${subgrupo}</p>
                    <h3>Documentación</h3>
                    <h4>Documentos Generales (Aplican a Todas las Mercancías)</h4>
                    <div class="general-docs"></div>
                    <h4>Documentos Específicos</h4>
                    <div class="specific-docs"></div>
                `;

                // Mostrar documentos generales
                const generalDocsDiv = infoDiv.querySelector('.general-docs');
                documentosGenerales.forEach(doc => {
                    const docDiv = document.createElement('div');
                    docDiv.innerHTML = `
                        <p><strong>Documento:</strong> ${doc.Documento}</p>
                        <p><strong>Descripción:</strong> ${doc.Descripción}</p>
                        <p><strong>Importancia:</strong> <span class="importance">${doc.Importancia}</span></p>
                    `;
                    generalDocsDiv.appendChild(docDiv);
                });

                // Mostrar documentos específicos
                const specificDocsDiv = infoDiv.querySelector('.specific-docs');
                if (productoInfo[0].documentación) { // Verificar si hay documentos específicos
                    productoInfo.forEach(info => {
                        const docDiv = document.createElement('div');
                        docDiv.innerHTML = `
                            <p><strong>Documento:</strong> ${info.documentación}</p>
                            <p><strong>Descripción:</strong> ${info.descripción_doc}</p>
                        `;
                        specificDocsDiv.appendChild(docDiv);
                    });
                } else {
                    specificDocsDiv.innerHTML = '<p>No hay documentos específicos para este producto.</p>';
                }

                // Mostrar información de cuidado
                const cuidadoDiv = document.createElement('div');
                cuidadoDiv.innerHTML = `
                    <h3>Cuidado</h3>
                    <p><strong>Tipo:</strong> ${cuidadoInfo.tipo_cuidado}</p>
                    <p>${cuidadoInfo.descr_cuidado}</p>
                    <p><strong>Fuente:</strong> ${cuidadoInfo.fuente_cuid}</p>
                `;
                infoDiv.appendChild(cuidadoDiv);

                // Mostrar información de etiquetado
                const etiquetadoDiv = document.createElement('div');
                etiquetadoDiv.innerHTML = `
                    <h3>Etiquetado</h3>
                    <p>${etiquetadoInfo.etiquetado}</p>
                    <p><strong>Fuente:</strong> ${etiquetadoInfo.fuente_etiq}</p>
                `;
                infoDiv.appendChild(etiquetadoDiv);
            }
        });

        // Exportar a PDF
        exportBtn.addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const content = infoDiv.innerText;
            doc.text(content, 10, 10);
            doc.save(`${productoSelect.value || 'producto'}_info.pdf`);
        });
    })
    .catch(err => {
        console.error(err);
        loading.style.display = 'none';
        error.style.display = 'block';
    });

    // Actualizar el select de productos
    function updateProductoSelect(productos) {
        productoSelect.innerHTML = '<option value="">Selecciona un producto</option>';
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto;
            option.text = producto;
            productoSelect.appendChild(option);
        });
    }
});
