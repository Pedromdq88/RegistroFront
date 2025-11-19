// Manejo del envío del formulario: recoge valores actuales de los switches y demás inputs
document.addEventListener('DOMContentLoaded', function () {
	// Si hay varios formularios, tomamos todos y los escuchamos
	const forms = document.querySelectorAll('form');
	forms.forEach(form => {
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			const data = {};
			// Recoger todos los controles dentro del form
			const elements = form.querySelectorAll('input, select, textarea');
			elements.forEach(el => {
				if (!el.name) return; // ignorar inputs sin name
				if (el.type === 'radio') {
					// solo tomar el valor del radio seleccionado
					if (el.checked) data[el.name] = el.value;
				} else if (el.type === 'checkbox') {
					data[el.name] = el.checked;
				} else {
					data[el.name] = el.value;
				}
			});

			// (dynamic select logic moved outside submit handler)

			// Aquí puedes cambiar el comportamiento: enviar con fetch, mostrar en pantalla, etc.
			console.log('Formulario recogido:', data);
			alert('Valores del formulario:\n' + JSON.stringify(data, null, 2));

			// Si prefieres enviar los datos al servidor descomenta el bloque siguiente y ajusta la URL
			/*
			fetch('/ruta-de-envio', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			}).then(res => {
				// manejar respuesta
			});
			*/
		});
	});

	// --- Lógica dinámica para selects de materias (área -> materia -> año)
	const areaSelect = document.getElementById('areaSelect');
	const materiaSelect = document.getElementById('materiaSelect');
	const anioSelect = document.getElementById('anioSelect');

	const materiasByArea = {
		'01': [
			{ value: 'algebra', text: 'Álgebra' },
			{ value: 'analisis_matematico', text: 'Análisis Matemático' },
			{ value: 'aritmetica', text: 'Aritmética' },
			{ value: 'geometria', text: 'Geometría' },
			{ value: 'trigonometria', text: 'Trigonometría' }
		],
		'02': [
			{ value: 'lengua', text: 'Lengua' },
			{ value: 'literatura', text: 'Literatura' },
			{ value: 'lengua_y_literatura', text: 'Lengua y Literatura' }
		],
		'03': [
			{ value: 'historia', text: 'Historia' },
			{ value: 'geografia', text: 'Geografía' },
			{ value: 'formacion_etica', text: 'Formación Ética y Ciudadana' }
		],
		'04': [
			{ value: 'fisica', text: 'Física' },
			{ value: 'quimica', text: 'Química' },
			{ value: 'fisicoquimica', text: 'Fisicoquímica' },
			{ value: 'quimica_organica', text: 'Química Orgánica' },
			{ value: 'biologia', text: 'Biología' },
			{ value: 'salud_adolescencia', text: 'Salud y Adolescencia' }
		],
		'05': [
			{ value: 'plastica', text: 'Plástica' },
			{ value: 'musica', text: 'Música' },
			{ value: 'teatro', text: 'Teatro' }
		],
		'06': [
			{ value: 'ingles', text: 'Inglés' },
			{ value: 'frances', text: 'Francés' }
		]
	};

	function clearSelect(s) {
		while (s.options.length > 0) s.remove(0);
	}

	function populateMateria(area) {
		clearSelect(materiaSelect);
		const defaultOpt = document.createElement('option');
		defaultOpt.value = '';
		defaultOpt.textContent = '-- Seleccione materia --';
		materiaSelect.appendChild(defaultOpt);

		const list = materiasByArea[area] || [];
		list.forEach(m => {
			const opt = document.createElement('option');
			opt.value = m.value;
			opt.textContent = m.text;
			materiaSelect.appendChild(opt);
		});
	}

	if (areaSelect) {
		areaSelect.addEventListener('change', function () {
			const val = this.value;
			if (!val) {
				materiaSelect.disabled = true;
				anioSelect.disabled = true;
				clearSelect(materiaSelect);
				const placeholder = document.createElement('option');
				placeholder.value = '';
				placeholder.textContent = '-- Seleccione materia --';
				materiaSelect.appendChild(placeholder);
				return;
			}
			populateMateria(val);
			materiaSelect.disabled = false;
			anioSelect.disabled = true;
			anioSelect.value = '';
		});
	}

	if (materiaSelect) {
		materiaSelect.addEventListener('change', function () {
			if (!this.value) {
				anioSelect.disabled = true;
				anioSelect.value = '';
			} else {
				anioSelect.disabled = false;
			}
		});
	}

	// Contadores +/- para totalMaterias y materiasRendir
	const totalMinus = document.getElementById('totalMinus');
	const totalPlus = document.getElementById('totalPlus');
	const totalDisplay = document.getElementById('totalDisplay');
	const totalHidden = document.getElementById('totalMaterias');

	const rendirMinus = document.getElementById('rendirMinus');
	const rendirPlus = document.getElementById('rendirPlus');
	const rendirDisplay = document.getElementById('rendirDisplay');
	const rendirHidden = document.getElementById('materiasRendir');
	// elementos relacionados con la lista de materias y el botón de agregar.
	// Se declaran aquí antes de las funciones que pueden invocarlas (evita TDZ)
	const addSubjectBtn = document.getElementById('addSubjectBtn');
	const subjectList = document.getElementById('subjectList');
	const subjectStatus = document.getElementById('subjectStatus');

	const MAX_TOTAL = 10;
	const MAX_RENDIR = 4;

	let totalCount = 0;
	let rendirCount = 0;

	function updateTotalDisplay() {
		if (totalCount < 0) totalCount = 0;
		if (totalCount > MAX_TOTAL) totalCount = MAX_TOTAL;
		totalDisplay.textContent = totalCount;
		totalHidden.value = totalCount;
		// adjust rendir if exceeds total
		if (rendirCount > totalCount) {
			rendirCount = Math.min(totalCount, MAX_RENDIR);
			updateRendirDisplay();
		}
		// enable/disable buttons
		if (totalPlus) totalPlus.disabled = totalCount >= MAX_TOTAL;
		if (totalMinus) totalMinus.disabled = totalCount <= 0;
		// ensure rendir buttons reflect the new total (enable if possible)
		updateRendirDisplay();
		// update subject add button/state when total changes
		if (typeof updateSubjectState === 'function') updateSubjectState();
	}
	function updateRendirDisplay() {
		if (rendirCount < 0) rendirCount = 0;
		if (rendirCount > MAX_RENDIR) rendirCount = MAX_RENDIR;
		// cannot render more than totalCount
		if (rendirCount > totalCount) rendirCount = totalCount;
		rendirDisplay.textContent = rendirCount;
		rendirHidden.value = rendirCount;
		// enable/disable buttons
		if (rendirPlus) rendirPlus.disabled = rendirCount >= Math.min(MAX_RENDIR, totalCount);
		if (rendirMinus) rendirMinus.disabled = rendirCount <= 0;
	}

	if (totalMinus && totalPlus) {
		totalMinus.addEventListener('click', function () {
			if (totalCount > 0) totalCount--;
			updateTotalDisplay();
		});
		totalPlus.addEventListener('click', function () {
			if (totalCount < MAX_TOTAL) totalCount++;
			updateTotalDisplay();
		});
	}
	if (rendirMinus && rendirPlus) {
		rendirMinus.addEventListener('click', function () {
			if (rendirCount > 0) rendirCount--;
			updateRendirDisplay();
		});
		rendirPlus.addEventListener('click', function () {
			// only increment if below both MAX_RENDIR and totalCount
			if (rendirCount < MAX_RENDIR && rendirCount < totalCount) rendirCount++;
			updateRendirDisplay();
		});
	}

	updateTotalDisplay();
	updateRendirDisplay();

	// Add/remove subject entries

	function createHidden(name, value) {
		const h = document.createElement('input');
		h.type = 'hidden';
		h.name = name;
		h.value = value;
		return h;
	}

	if (addSubjectBtn) {
		addSubjectBtn.addEventListener('click', function () {
			console.log('addSubjectBtn clicked', { totalCount, areaSelect: !!areaSelect, materiaSelect: !!materiaSelect, anioSelect: !!anioSelect });
			try {
			const area = areaSelect.value;
			const materia = materiaSelect.value;
			const anio = anioSelect.value;
			if (!area || !materia || !anio) {
				alert('Por favor seleccione área, materia y año antes de agregar.');
				return;
			}

			// do not allow adding more than totalCount
			const addedCount = subjectList ? subjectList.querySelectorAll('.subject-item').length : 0;
			if (totalCount <= 0) {
				alert('Defina primero la cantidad total de materias (mayor que 0) antes de agregar.');
				return;
			}
			if (addedCount >= totalCount) {
				alert('No puede anotar más materias de las que debe en TOTAL.');
				return;
			}

			// prevent duplicates (same area+materia+anio)
			const key = area + '|' + materia + '|' + anio;
			const existing = Array.from(subjectList.querySelectorAll('.subject-item')).some(it => {
				const ha = it.querySelector('input[name="materias_area[]"]');
				const hm = it.querySelector('input[name="materias_materia[]"]');
				const han = it.querySelector('input[name="materias_anio[]"]');
				if (!ha || !hm || !han) return false;
				return (ha.value + '|' + hm.value + '|' + han.value) === key;
			});
			if (existing) {
				alert('Esa materia ya fue anotada.');
				return;
			}

			// display labels
			const areaText = areaSelect.options[areaSelect.selectedIndex].text;
			const materiaText = materiaSelect.options[materiaSelect.selectedIndex].text;

			const item = document.createElement('div');
			item.className = 'subject-item';

			const info = document.createElement('div');
			info.className = 'info';
			info.textContent = areaText + ' — ' + materiaText + ' — ' + anio + '°';

			const removeBtn = document.createElement('button');
			removeBtn.type = 'button';
			removeBtn.className = 'remove';
			removeBtn.textContent = 'Eliminar';

			item.appendChild(info);
			item.appendChild(removeBtn);

			// hidden inputs so form submit captures the data
			const hArea = createHidden('materias_area[]', area);
			const hMateria = createHidden('materias_materia[]', materia);
			const hAnio = createHidden('materias_anio[]', anio);
			item.appendChild(hArea);
			item.appendChild(hMateria);
			item.appendChild(hAnio);

			subjectList.appendChild(item);

			// update status/button state
			updateSubjectState();

			// reset selects for next entry
			areaSelect.value = '';
			clearSelect(materiaSelect);
			const placeholder = document.createElement('option');
			placeholder.value = '';
			placeholder.textContent = '-- Seleccione materia --';
			materiaSelect.appendChild(placeholder);
			materiaSelect.disabled = true;
			anioSelect.value = '';
			anioSelect.disabled = true;

			removeBtn.addEventListener('click', function () {
				subjectList.removeChild(item);
				updateSubjectState();
			});
			} catch (err) {
				console.error('Error in addSubjectBtn handler', err);
				alert('Ocurrió un error al intentar agregar la materia. Revisa la consola para más detalles.');
			}
		});
	}

	// subject status: ensure added subjects do not exceed total and update add button

	function updateSubjectState() {
		const addedCount = subjectList ? subjectList.querySelectorAll('.subject-item').length : 0;
		if (!addSubjectBtn) return;
		if (totalCount <= 0) {
			addSubjectBtn.disabled = true;
			subjectStatus.textContent = 'Defina la cantidad total de materias para poder anotar.';
			return;
		}
		if (addedCount >= totalCount) {
			addSubjectBtn.disabled = true;
			subjectStatus.textContent = `Ya anotaste ${addedCount} materias — no puede superar el total (${totalCount}).`;
		} else {
			addSubjectBtn.disabled = false;
			subjectStatus.textContent = '';
		}
	}

	// call once to set initial state
	updateSubjectState();
});