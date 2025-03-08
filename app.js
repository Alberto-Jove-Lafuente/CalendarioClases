const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
let currentDate = new Date();
let selectedMonth = currentDate.getMonth();
let selectedYear = currentDate.getFullYear();

// Función para generar un color único basado en el nombre del alumno
function generateColorForStudent(name) {
    const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360; // Limitamos el valor de hue a 360 para obtener un color válido
    return `hsl(${hue}, 70%, 60%)`; // Usamos HSL para generar colores más agradables
}

// Función para cargar el calendario
function loadCalendar() {
    console.log("Cargando calendario...");

    const classes = JSON.parse(localStorage.getItem('classes')) || [];
    console.log("Clases guardadas:", classes); // Verifica en la consola

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        let dayClasses = getClassesForDay(day);
        let classList = document.createElement('div');

        dayClasses.forEach(cls => {
            const classItem = document.createElement('p');
            const classType = cls.type === 'O' ? '🟢 O' : '🔵 P';
            classItem.textContent = `${cls.name} (${cls.start} - ${cls.end}) [${classType}]`;
            classItem.style.backgroundColor = generateColorForStudent(cls.name);
            classList.appendChild(classItem);
        });

        const dayCell = document.getElementById(`day-${day}`);
        if (dayCell) {
            dayCell.appendChild(classList);
        }
    }
}


/*function loadCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const monthName = document.getElementById('month-name');
    monthName.textContent = `${monthNames[selectedMonth]} ${selectedYear}`;

    // Primer día del mes
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    // Crear celdas vacías hasta el primer día del mes
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        calendar.appendChild(emptyCell);
    }

    // Crear celdas para cada día del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.textContent = day;
        dayCell.classList.add('day-cell');
        
        // Mostrar las clases debajo de cada día
        const dayClasses = getClassesForDay(day);
        const classList = document.createElement('div');
        classList.classList.add('day-class-list');
        
        dayClasses.forEach(cls => {
            const classItem = document.createElement('p');
            const classType = cls.type === 'O' ? '🟢 O' : '🔵 P'; // Iconos opcionales para mayor claridad
            classItem.textContent = `${cls.name} (${cls.start} - ${cls.end}) [${classType}]`;
            classItem.style.backgroundColor = generateColorForStudent(cls.name);
        
            classList.appendChild(classItem);
        });

        dayCell.appendChild(classList);
        calendar.appendChild(dayCell);
    }
}*/

// Función para obtener las clases de un día específico
function getClassesForDay(day) {
    const classes = JSON.parse(localStorage.getItem('classes')) || [];
    return classes.filter(cls => cls.date === `${selectedYear}-${selectedMonth + 1}-${day}`);
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