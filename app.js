const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
let currentDate = new Date();
let selectedMonth = currentDate.getMonth();
let selectedYear = currentDate.getFullYear();
let editMode = false; // Modo edición añadido

// Función para generar un color único basado en el nombre del alumno
/*function generateColorForStudent(name) {
    // Convertimos el nombre en un valor único numérico
    let uniqueValue = 0;
    for (let i = 0; i < name.length; i++) {
        uniqueValue += name.charCodeAt(i);
    }

    // Generamos tres componentes de color (rojo, verde, azul) en base al valor único
    const red = (uniqueValue * 123) % 256; // Múltiplo para dispersar el valor
    const green = (uniqueValue * 234) % 256; // Otro múltiplo para dispersar
    const blue = (uniqueValue * 345) % 256; // Otro múltiplo para obtener un valor único de color

    // Generamos un color RGB
    return `rgb(${red}, ${green}, ${blue})`;

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Asegura un rango amplio de tonos (de 0 a 360 grados en el círculo cromático)
    const hue = Math.abs(hash % 360);
    const saturation = 70 + (hash % 30); // Entre 70% y 100% para colores vibrantes
    const lightness = 50 + (hash % 20);  // Entre 50% y 70% para evitar colores muy claros/oscuros

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}*/

// Función para cargar el calendario
function loadCalendar() {
    console.log("Cargando calendario...");

    cleanOldClasses();

    const classes = JSON.parse(localStorage.getItem('classes')) || [];
    console.log("Clases guardadas:", classes);

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = ''; // Limpia el contenido anterior

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const offset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); // Ajustar para que lunes sea el primer día

    // Crear array de 42 días (6 filas x 7 columnas)
    const days = Array.from({ length: 42 }, (_, i) => {
        const dayNumber = i >= offset && i < offset + daysInMonth ? i - offset + 1 : null;
        return { date: dayNumber };
    });

    console.log("Días en el mes:", daysInMonth);
    console.log("Calendario generado:", calendar);

    console.log("Días generados:", days);

    days.forEach(({ date }) => {
        // Crear un contenedor para el día
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');

        if (date) {
            dayCell.innerHTML = `<strong>${date}</strong>`; // Día del mes
            const dayClasses = classes.filter(cls => {
                const clsDate = new Date(cls.date);
                return clsDate.getFullYear() === selectedYear &&
                       clsDate.getMonth() === selectedMonth &&
                       clsDate.getDate() === date;
            });

            // ORDENAR LAS CLASES POR HORA DE INICIO
            dayClasses.sort((a, b) => a.start.localeCompare(b.start));

            console.log(`Día ${date} ordenado:`, dayClasses); // Verificar clases por día ordenados

            const classList = document.createElement('div');

            dayClasses.forEach(cls => {
                const classItem = document.createElement('p');
                classItem.classList.add('class-card'); // Añadir clase para los estilos
                const classType = cls.type === 'O' ? '🟢 O' : '🔵 P';
                classItem.textContent = `${cls.name} (${cls.start} - ${cls.end}) [${classType}]`;
                classItem.style.backgroundColor = cls.color || '#ccc'; // Usa el color guardado o un gris por defecto
                classList.appendChild(classItem);
            });

            dayCell.appendChild(classList);

        }

        calendar.appendChild(dayCell);
    });

     // 👉 Actualizar el mes y el año en el encabezado
     const monthName = monthNames[selectedMonth];
     document.getElementById('month-name').textContent = `${monthName} ${selectedYear}`;
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

// Agregar clase y gestionar recurrencia
function addRecurringClasses(studentName, startTime, endTime, classDate, classType, color) {
    let classes = JSON.parse(localStorage.getItem('classes')) || [];
    let currentDate = new Date(classDate);
    const endDate = new Date('2025-07-01');

    while (currentDate <= endDate) {
        classes.push({
            date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,
            name: studentName,
            start: startTime,
            end: endTime,
            type: classType,
            color: color
        });
        currentDate.setDate(currentDate.getDate() + 7); // Avanzar una semana
    }
    
    localStorage.setItem('classes', JSON.stringify(classes));
}

// Alternar el modo edición
document.querySelector('#toggle-edit').addEventListener('click', () => {
    editMode = !editMode;
    document.querySelector('#toggle-edit').textContent = editMode ? 'Salir del modo edición' : 'Modo edición';
    document.querySelector('#toggle-edit').classList.toggle('active', editMode);
});

// Eliminar clase al hacer clic (solo si el modo edición está activo)
document.querySelector('#calendar').addEventListener('click', (e) => {
    
    if (editMode && e.target.classList.contains('class-card')) {
        const confirmation = confirm('¿Estás seguro de que deseas eliminar esta clase?');
        if (confirmation) {
            const clase = e.target;
            const dayCell = clase.closest('.calendar-day');
            const dayNumber = dayCell.querySelector('strong').textContent;
            const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;

            let classes = JSON.parse(localStorage.getItem('classes')) || [];
            const nuevasClases = classes.filter(c => !(c.date === date && c.name === clase.textContent.split(' ')[0]));
            localStorage.setItem('classes', JSON.stringify(nuevasClases));

            clase.remove();
        }
        
    }
});

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
    const isRecurring = document.getElementById('is-recurring').checked; // es recurrente la clase
    const color = document.getElementById('class-color').value; // se obtiene el color

    if (!studentName || !startTime || !endTime || !classDate) return;

    let classes = JSON.parse(localStorage.getItem('classes')) || [];

    if (isRecurring) {
        addRecurringClasses(studentName, startTime, endTime, classDate, classType, color);
    } else {
        classes.push({
            date: classDate,
            name: studentName,
            start: startTime,
            end: endTime,
            type: classType,
            color: color
        });
        localStorage.setItem('classes', JSON.stringify(classes));
    }

    alert('Clase agregada');
    document.getElementById('add-class-form').reset();
    loadCalendar(); // Recargar el calendario para mostrar la nueva clase
});

document.addEventListener('DOMContentLoaded', () => {
    loadCalendar(); // Cargar las clases al abrir la página
});