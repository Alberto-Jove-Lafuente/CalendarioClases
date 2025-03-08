const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
let currentDate = new Date();
let selectedMonth = currentDate.getMonth();
let selectedYear = currentDate.getFullYear();

// Función para generar un color único basado en el nombre del alumno
function generateColorForStudent(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = Math.imul(31, hash) + name.charCodeAt(i); // Usamos imul para evitar desbordamientos
    }
    const hue = Math.abs(hash) % 360; // Limitamos el valor de hue a 360 para obtener un color válido
    return `hsl(${hue}, 70%, 60%)`; // Usamos HSL para generar colores más agradables
}

// Función para cargar el calendario
function loadCalendar() {
    console.log("Cargando calendario...");

    cleanOldClasses();

    const classes = JSON.parse(localStorage.getItem('classes')) || [];
    console.log("Clases guardadas:", classes);

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = ''; // Limpia el contenido anterior

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    console.log("Días en el mes:", daysInMonth);
    console.log("Calendario generado:", calendar);

    for (let day = 1; day <= daysInMonth; day++) {
        // Crear un contenedor para el día
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        dayCell.id = `day-${day}`;
        dayCell.innerHTML = `<strong>${day}</strong>`; // Mostrar el número del día

        let dayClasses = classes.filter(cls => {
            const clsDate = new Date(cls.date);
            return clsDate.getFullYear() === selectedYear &&
                   clsDate.getMonth() === selectedMonth &&
                   clsDate.getDate() === day;
        });

        // 🟢 ORDENAR LAS CLASES POR HORA DE INICIO
        dayClasses.sort((a, b) => a.start.localeCompare(b.start));

        console.log(`Día ${day} ordenado:`, dayClasses); // Verificar clases por día ordenados

        let classList = document.createElement('div');

        dayClasses.forEach(cls => {
            const classItem = document.createElement('p');
            const classType = cls.type === 'O' ? '🟢 O' : '🔵 P';
            classItem.textContent = `${cls.name} (${cls.start} - ${cls.end}) [${classType}]`;
            classItem.style.backgroundColor = generateColorForStudent(cls.name);
            classList.appendChild(classItem);
        });

        dayCell.appendChild(classList);
        calendar.appendChild(dayCell);
    }
}

// Función para obtener las clases de un día específico
function getClassesForDay(day) {
    const classes = JSON.parse(localStorage.getItem('classes')) || [];
    return classes.filter(cls => cls.date === `${selectedYear}-${selectedMonth + 1}-${day}`);
}

// Función para eliminar clases antiguas para evitar perdida de datos futuros
function cleanOldClasses() {
    let classes = JSON.parse(localStorage.getItem('classes')) || [];
    const today = new Date();

    // Filtrar solo las clases que son de hoy o futuras
    classes = classes.filter(cls => new Date(cls.date) >= today);

    localStorage.setItem('classes', JSON.stringify(classes));
}

// Manejo de cambio de mes
document.getElementById('prev-month').addEventListener('click', () => {
    selectedMonth--;
    if (selectedMonth < 0) {
        selectedMonth = 11;
        selectedYear--;
    }
    loadCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    selectedMonth++;
    if (selectedMonth > 11) {
        selectedMonth = 0;
        selectedYear++;
    }
    loadCalendar();
});

// Manejo del formulario para agregar clases
document.getElementById('add-class-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const studentName = document.getElementById('student-name').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const classDate = document.getElementById('class-date').value; // Obtener la fecha seleccionada
    const classType = document.getElementById('class-type').value; // Nuevo campo

    if (!studentName || !startTime || !endTime || !classDate) return;

    const classes = JSON.parse(localStorage.getItem('classes')) || [];
    const date = `${selectedYear}-${selectedMonth + 1}-${new Date().getDate()}`;
    classes.push({
        date: classDate,
        name: studentName,
        start: startTime,
        end: endTime,
        type: classType // Guardamos si es presencial u online
    });

    localStorage.setItem('classes', JSON.stringify(classes));
    alert('Clase agregada');
    document.getElementById('add-class-form').reset();
    loadCalendar(); // Recargar el calendario para mostrar la nueva clase
});

document.addEventListener('DOMContentLoaded', () => {
    loadCalendar(); // Cargar las clases al abrir la página
});