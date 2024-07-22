document.addEventListener('DOMContentLoaded', () => {
    const icons = document.querySelectorAll('.info-icon, .info-iconp');
    const popup = document.getElementById('info-popup');
    const infoText = document.getElementById('info-text');
    const closePopup = document.getElementById('close-popup');

    const infoMessages = {
        n: "CASILLA N°. Esta casilla se reserva para el número de Registro dado al MCI por la Aduana de partida.",
        1: "CASILLA 1. Se individualizará al transportista que emite, suscribe y presenta el MCI a la Aduana de partida, indicando la denominación o razón social de la empresa, la dirección de su oficina matriz con indicación de la ciudad y país respectivos. A esta información deberá agregarse el logotipo y/o nombre comercial de la empresa y la misma puede ser impresa junto con el formato.",
        2: "CASILLA 2. Se indicará el número del Permiso Originario. Esta información puede ser impresa junto con el formato.",
        3: "CASILLA 3. Se indicará(n) el(los) número(s) de (los) Permiso(s) de Prestación de Servicios del transportista autorizado correspondiente a los países por los cuales efectuará la operación de transporte internacional de mercancías por carretera. Puede imprimirse junto con el formato los números de todos los Permisos de Prestación de Servicios que posea el transportista autorizado.",
        4: "CASILLA 4. Se indicará la marca del vehículo habilitado.",
        5: "CASILLA 5. Se indicará el año de fabricación del vehículo habilitado.",
        6: "CASILLA 6. Se indicarán los datos de la placa del vehículo habilitado, así como el país de su matrícula o registro.",
        7: "CASILLA 7. Se indicará el número o la serie del chasis del vehículo habilitado.",
        8: "CASILLA 8. Se indicará el(los) número(s) del (los) correspondiente(s) Certificado(s) de Habilitación del vehículo habilitado.",
        9: "CASILLA 9. Se indicará el nombre del fabricante de la unidad de carga.",
        10: "CASILLA 10. Se indicará el año de fabricación de la unidad de carga.",
        11: "CASILLA 11. Se indicarán los datos de la placa de la unidad de carga, así como la indicación del país de su matrícula o registro.",
        12: "CASILLA 12. Si el remolque o semirremolque trae acoplado un remolque adicional, se individualizará dicha unidad en esta Casilla indicando su marca, año de fabricación, placa y país.",
        13: "CASILLA 13. Se indicarán los nombres y apellidos completos del conductor principal.",
        14: "CASILLA 14. Se indicará el número del documento de identidad personal del conductor principal, otorgado por el país de su nacionalidad o residencia.",
        15: "CASILLA 15. Se indicará la nacionalidad y residencia del conductor principal.",
        16: "CASILLA 16. Se indicará el número y clase de la licencia de conducir del conductor principal.",
        17: "CASILLA 17. Se indicará el número de la Libreta de Tripulante Terrestre del conductor principal.",
        18: "CASILLA 18. Se indicarán los nombres y apellidos completos del conductor auxiliar o ayudante.",
        19: "CASILLA 19. Se indicará el número del documento de identidad personal del conductor auxiliar o ayudante, otorgado por el país de su nacionalidad o residencia.",
        20: "CASILLA 20. Se indicará la nacionalidad y residencia del conductor auxiliar o ayudante.",
        21: "CASILLA 21. Se indicará el número y clase de la licencia de conducir del conductor auxiliar.",
        22: "CASILLA 22. Se indicará el número de la Libreta de Tripulante Terrestre del conductor auxiliar o ayudante.",
        23: "CASILLA 23. Se indicará la ciudad y país donde se cargan las mercancías a bordo del vehículo habilitado.",
        24: "CASILLA 24. Se indicarán la ciudad y país donde se descargarán las mercancías.",
        25: "CASILLA 25. Marcar con x el recuadro que corresponda. Si es el caso se describirá la naturaleza de la carga, a continuación de la expresión (D. Otra (especificar)).",
        26: "CASILLA 26. Se indicarán las siglas y/o números de identificación de los contenedores, especificando su capacidad (20, 40 pies u otra).",
        27: "CASILLA 27. Se indicarán las siglas y/o números de identificación de los precintos aduaneros de los contenedores y unidades de carga, así como de las mercancías susceptibles de ser precintadas.",
        28: "CASILLA 28. Se indicarán los números de cada una de las Cartas de Porte Internacional por Carretera (CPIC) correspondiente a cada envío de mercancías cargadas en los vehículos amparados por la DTAI.",
        29: "CASILLA 29. Se indicará la descripción de las mercancías por producto. Se deberá efectuar en términos suficientemente claros, de manera tal que permita la adecuada identificación de las mismas.",
        30: "CASILLA 30. Se indicará el número o cantidad total de bultos que componen el envío. Si se trata de mercancías sin envasar, se expresará el número de éstas, o la expresión (a granel), según el caso.",
        31: "CASILLA 31. Refiriéndose a las señaladas exteriormente en los bultos: Se indicará sus clases, marcas y los números de identificación que figuren en ellos.",
        32: "CASILLA 32. En las columnas correspondientes se indicarán el peso neto de las mercancías, así como su peso bruto. En ambos casos se expresará en kilogramos y al final se colocará independientemente el total de cada uno de ellos.",
        33: "CASILLA 33. Se indicará el volumen total en metros cúbicos de los bultos y/o la unidad de carga; o de ser el caso la otra unidad de medida utilizada. Al final se colocará el total de las mismas.",
        34: "CASILLA 34. Se indicará el precio que tienen las mercancías al tiempo y lugar en que el transportista auto-rizado las recibió, o se hizo cargo de ellas, según el artículo 92 de la Decisión 399, conforme a los términos de compra-venta internacionales de los INCOTERMS 1990, acordados entre las partes. Asimismo, se indicará el tipo de moneda en que se exprese su precio (Ver Apéndice VII de esta Resolución que aprueba la CPIC, la misma que contiene una referencia a INCOTERMS 1990, utilizados para el transporte terrestre internacional por carretera).",
        35: "CASILLA 35. Reservada para la Aduana de Partida. Se anotará cualquier observación sobre la Operación de Tránsito Aduanero Inter-nacional u otra que estime conveniente.",
        36: "CASILLA 36. Se consignará la firma y el sello del funcionario responsable de la Aduana que autoriza el inicio de la Operación de Tránsito Aduanero Internacional. En la parte inferior se anotará el día, mes y año de su intervención.",
        37: "CASILLA 37. Se precisará(n) la(s) Aduana(s) ubicada(s) en los cruces de frontera habilitados por los Países Miembros, a través de los cuales se efectuará la Operación de Tránsito Aduanero Internacional.",
        38: "CASILLA 38. Se precisará la Aduana de Destino.",
        39: "CASILLA 39. Se consignará la denominación, firma y sello del transportista autorizado o de la persona que actúa en representación del mismo.",
        40: "CASILLA 40. Corresponde al día en que se emite el Manifiesto de Carga Internacional.",  
      
        // Añadir más mensajes según sea necesario
    };

    icons.forEach(icon => {
        icon.addEventListener('click', event => {
            const info = event.target.dataset.info;
            if (info && infoMessages[info]) {
                infoText.textContent = infoMessages[info];
                popup.classList.remove('hidden');
                popup.style.display = 'block';  // Mostrar el cuadro de información
            }
        });
    });

    closePopup.addEventListener('click', () => {
        popup.classList.add('hidden');
        popup.style.display = 'none';  // Ocultar el cuadro de información
    });
    document.addEventListener('click', event => {
        if (!popup.contains(event.target) && !event.target.matches('.info-icon, .info-iconp')) {
            popup.classList.add('hidden');
            popup.style.display = 'none';  // Ocultar el cuadro de información
        }
    });
});
