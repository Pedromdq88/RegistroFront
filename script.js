document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    // ... (Referencias a contadores, iguales que antes) ...
    const totalMinus = document.getElementById('totalMinus');
    const totalPlus = document.getElementById('totalPlus');
    const totalDisplay = document.getElementById('totalDisplay');
    const totalHidden = document.getElementById('totalMaterias');
    const rendirMinus = document.getElementById('rendirMinus');
    const rendirPlus = document.getElementById('rendirPlus');
    const rendirDisplay = document.getElementById('rendirDisplay');
    const rendirHidden = document.getElementById('materiasRendir');
    
    let totalCount = 0;
    let rendirCount = 0;
    const MAX_TOTAL = 10;
    const MAX_RENDIR = 4;

    function updateTotalDisplay() {
        if (totalCount < 0) totalCount = 0;
        if (totalCount > MAX_TOTAL) totalCount = MAX_TOTAL;
        totalDisplay.textContent = totalCount;
        totalHidden.value = totalCount;
        if (rendirCount > totalCount) {
            rendirCount = Math.min(totalCount, MAX_RENDIR);
            updateRendirDisplay();
        }
    }
    function updateRendirDisplay() {
        if (rendirCount < 0) rendirCount = 0;
        if (rendirCount > MAX_RENDIR) rendirCount = MAX_RENDIR;
        if (rendirCount > totalCount) rendirCount = totalCount;
        rendirDisplay.textContent = rendirCount;
        rendirHidden.value = rendirCount;
    }

    if(totalMinus) totalMinus.addEventListener('click', () => { if (totalCount > 0) totalCount--; updateTotalDisplay(); });
    if(totalPlus) totalPlus.addEventListener('click', () => { if (totalCount < MAX_TOTAL) totalCount++; updateTotalDisplay(); });
    if(rendirMinus) rendirMinus.addEventListener('click', () => { if (rendirCount > 0) rendirCount--; updateRendirDisplay(); });
    if(rendirPlus) rendirPlus.addEventListener('click', () => { if (rendirCount < MAX_TOTAL) rendirCount++; updateRendirDisplay(); });

    // ... (Lógica de Materias, igual que antes) ...
    const areaSelect = document.getElementById('areaSelect');
    const materiaSelect = document.getElementById('materiaSelect');
    const anioSelect = document.getElementById('anioSelect');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const subjectList = document.getElementById('subjectList');

    const materiasByArea = {
        '01': [{val:'algebra', t:'Álgebra'}, {val:'aritmetica', t:'Aritmética'}],
        '02': [{val:'lengua', t:'Lengua'}, {val:'literatura', t:'Literatura'}],
        '03': [{val:'historia', t:'Historia'}, {val:'geografia', t:'Geografía'}],
        '04': [{val:'fisica', t:'Física'}, {val:'quimica', t:'Química'}],
        '05': [{val:'plastica', t:'Plástica'}, {val:'musica', t:'Música'}],
        '06': [{val:'ingles', t:'Inglés'}]
    };

    if (areaSelect) {
        areaSelect.addEventListener('change', function() {
            materiaSelect.innerHTML = '<option value="">-- Seleccione materia --</option>';
            materiaSelect.disabled = !this.value;
            anioSelect.disabled = true;
            if (this.value && materiasByArea[this.value]) {
                materiasByArea[this.value].forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m.val;
                    opt.textContent = m.t;
                    materiaSelect.appendChild(opt);
                });
            }
        });
    }
    if (materiaSelect) {
        materiaSelect.addEventListener('change', function() {
            anioSelect.disabled = !this.value;
        });
    }

    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', function() {
            if (!areaSelect.value || !materiaSelect.value || !anioSelect.value) {
                alert("Complete todos los campos de la materia para agregarla.");
                return;
            }
            const item = document.createElement('div');
            item.className = 'subject-item';
            item.innerHTML = `
                <span class="info">${areaSelect.value} - ${materiaSelect.value} - ${anioSelect.value}°</span>
                <button type="button" class="remove" onclick="this.parentElement.remove()">Eliminar</button>
                <input type="hidden" class="hArea" value="${areaSelect.value}">
                <input type="hidden" class="hMat" value="${materiaSelect.value}">
                <input type="hidden" class="hAnio" value="${anioSelect.value}">
            `;
            subjectList.appendChild(item);
        });
    }

    // --- ENVÍO CON VALIDACIÓN COMPLETA ---
    form.addEventListener('submit', function (e) {
        e.preventDefault(); 

        // 1. VALIDACIÓN VISUAL (Todos obligatorios menos Tel Alt)
        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const dni = document.getElementById('documento').value;
        const fechanac = document.getElementById('fechanac').value;
        const genero = document.getElementById('genero').value;
        const correo = document.getElementById('correo').value;
        const telefono = document.getElementById('telefono').value;
        // Tel. Alt es opcional, no lo validamos
        
        const escuela = document.getElementById('ultimaEducacion').value;
        const prov = document.getElementById('provinciaUltimaEducacion').value;
        const loc = document.getElementById('localidadUltimaEducacion').value;

        if (!nombre || !apellido || !dni || !fechanac || !genero || !correo || !telefono || !escuela || !prov || !loc) {
            alert("⚠️ Faltan datos obligatorios.\nPor favor complete todos los campos (el teléfono alternativo es el único opcional).");
            return; // STOP
        }

        // 2. RECOLECTAR MATERIAS
        const listaMaterias = []; 
        document.querySelectorAll('.subject-item').forEach(item => {
            listaMaterias.push({
                area: item.querySelector('.hArea').value,
                nombre: item.querySelector('.hMat').value,
                anio: parseInt(item.querySelector('.hAnio').value)
            });
        });

        // 3. ARMAR JSON
        const data = {
            nombre: nombre,
            apellido: apellido,
            documento: dni,
            fechanac: fechanac,
            genero: genero,
            correo: correo,
            telefono: telefono,
            telefonoAlt: document.getElementById('telefonoAlt').value,
            
            cursaste: document.querySelector('input[name="cursaste"]:checked')?.value || "no",
            turno: document.querySelector('input[name="turno"]:checked')?.value || "manana",
            cursando: document.querySelector('input[name="cursando"]:checked')?.value || "no",
            
            ultimaEducacion: escuela,
            provinciaUltimaEducacion: prov,
            localidadUltimaEducacion: loc,
            
            totalMaterias: totalCount,
            materiasRendir: rendirCount,
            
            listaMaterias: listaMaterias
        };

        console.log("Enviando JSON:", data);

        // 4. ENVIAR
        fetch('http://localhost:8080/api/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                alert("¡Registro Exitoso!");
                form.reset();
                subjectList.innerHTML = '';
            } else {
                return response.text().then(text => { throw new Error(text) });
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error del sistema: " + err.message);
        });
    });
});