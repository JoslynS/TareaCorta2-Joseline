let alarmas = JSON.parse(localStorage.getItem('alarmas')) || [];
let alarmaActiva = false;
let ultimaAlarmaDisparada = null;

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const horaEl = document.getElementById('hora');
const fechaEl = document.getElementById('fecha');
const relojEl = document.getElementById('reloj');
const listaAlarmasEl = document.getElementById('listaAlarmas');
const sinAlarmasEl = document.getElementById('sinAlarmas');
const audioAlarma = document.getElementById('audioAlarma');
const btnDetener = document.getElementById('btnDetener');

function actualizarReloj() {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    horaEl.textContent = `${horas}:${minutos}:${segundos}`;

    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    fechaEl.textContent = ahora.toLocaleDateString('es-ES', opciones);

    verificarAlarmas(ahora);
}

function verificarAlarmas(ahora) {
    if (alarmaActiva) return;

    const diaActual = diasSemana[ahora.getDay()];
    const horaActual = String(ahora.getHours()).padStart(2, '0') + ':' +
                       String(ahora.getMinutes()).padStart(2, '0');

    const claveMinutoActual = `${diaActual}-${horaActual}`;

    if (ultimaAlarmaDisparada === claveMinutoActual) return;

    for (let i = 0; i < alarmas.length; i++) {
        const alarma = alarmas[i];
        if (alarma.dia === diaActual && alarma.hora === horaActual) {
            ultimaAlarmaDisparada = claveMinutoActual;
            dispararAlarma(i);
            break;
        }
    }
}

function dispararAlarma(index) {
    alarmaActiva = true;
    relojEl.classList.add('activo');
    btnDetener.classList.remove('oculto');

    audioAlarma.currentTime = 0;
    audioAlarma.play().catch(err => {
        console.warn('No se pudo reproducir el audio:', err);
    });

    renderizarAlarmas(index);
}

function detenerSonido() {
    alarmaActiva = false;
    relojEl.classList.remove('activo');
    btnDetener.classList.add('oculto');
    audioAlarma.pause();
    audioAlarma.currentTime = 0;
    renderizarAlarmas();
}

function agregarAlarma() {
    const dia = document.getElementById('diaAlarma').value;
    const hora = document.getElementById('horaAlarma').value;

    if (!hora) {
        alert('Por favor selecciona una hora para la alarma.');
        return;
    }

    const existe = alarmas.some(a => a.dia === dia && a.hora === hora);
    if (existe) {
        alert('Ya existe una alarma para ese día y hora.');
        return;
    }

    alarmas.push({ dia, hora });
    guardarAlarmas();
    renderizarAlarmas();
    document.getElementById('horaAlarma').value = '';
}

function eliminarAlarma(index) {
    if (!confirm('¿Estás seguro de eliminar esta alarma?')) return;
    alarmas.splice(index, 1);
    guardarAlarmas();
    renderizarAlarmas();
}

function editarAlarma(index) {
    const alarma = alarmas[index];

    const nuevoDia = prompt(
        'Nuevo día (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo):',
        alarma.dia
    );
    if (!nuevoDia) return;

    const nuevoHorario = prompt('Nueva hora:', alarma.hora);
    if (!nuevoHorario) return;

    if (!diasSemana.includes(nuevoDia)) {
        alert('Día inválido. Usa: ' + diasSemana.join(', '));
        return;
    }

    if (!/^\d{2}:\d{2}$/.test(nuevoHorario)) {
        alert('Hora inválida. Usa formato hh:mm');
        return;
    }

    alarmas[index] = { dia: nuevoDia, hora: nuevoHorario };
    guardarAlarmas();
    renderizarAlarmas();
}

function guardarAlarmas() {
    localStorage.setItem('alarmas', JSON.stringify(alarmas));
}

function renderizarAlarmas(indexActiva = -1) {
    listaAlarmasEl.innerHTML = '';

    if (alarmas.length === 0) {
        sinAlarmasEl.style.display = 'block';
        return;
    }
    sinAlarmasEl.style.display = 'none';

    alarmas.forEach((alarma, i) => {
        const li = document.createElement('li');
        li.className = 'alarma-item';
        if (i === indexActiva) li.classList.add('activa');

        li.innerHTML = `
            <div class="info-alarma">
                <span class="hora-alarma">${alarma.hora}</span>
                <span class="dia-alarma">${alarma.dia}</span>
            </div>
            <div class="acciones-alarma">
                <button class="btn-editar" onclick="editarAlarma(${i})">✏️</button>
                <button class="btn-eliminar" onclick="eliminarAlarma(${i})">🗑️</button>
            </div>
        `;
        listaAlarmasEl.appendChild(li);
    });
}

document.addEventListener('click', function desbloquear() {
    audioAlarma.volume = 0;
    audioAlarma.play().then(() => {
        audioAlarma.pause();
        audioAlarma.currentTime = 0;
        audioAlarma.volume = 1;
    }).catch(() => {});
    document.removeEventListener('click', desbloquear);
}, { once: true });

renderizarAlarmas();
setInterval(actualizarReloj, 1000);
actualizarReloj();