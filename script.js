// Datos iniciales
const tasksData = [
    { id: 1, name: 'Java', time: '7:30 - 9:30', icon: '💻', priority: true, minutes: 120 },
    { id: 2, name: 'Python', time: '10:00 - 11:30', icon: '🐍', priority: true, minutes: 90 },
    { id: 3, name: 'Lectura', time: '13:00 - 14:00', icon: '📚', priority: false, minutes: 45 },
    { id: 4, name: 'Ejercicio', time: '17:00 - 18:00', icon: '💪', priority: false, minutes: 60 }
];

const quotes = [
    "No esperes motivación. SOLO EMPIEZA.",
    "7 meses atrás duele menos que 8 meses atrás.",
    "La disciplina es hacer lo que odias como si lo amaras.",
    "Hoy es el día que no desperdiciarás.",
    "No hay excusas. Solo resultados o justificaciones.",
    "El futuro tú te lo agradecerá. MUÉVETE.",
    "Haz hoy lo que otros no quieren, tendrás mañana lo que otros no tienen.",
    "La diferencia entre quien eres y quien quieres ser es lo que HACES.",
    "No se trata de tener tiempo. Se trata de HACER tiempo.",
    "Cada día sin avanzar es un día que nunca recuperarás.",
    "El dolor de la disciplina pesa gramos. El dolor del arrepentimiento pesa toneladas.",
    "El mejor momento para empezar fue hace 7 meses. El segundo mejor momento es AHORA.",
    "Deja de contar los días perdidos y empieza a hacer que los días cuenten.",
    "No mires atrás con culpa. Mira adelante con determinación.",
    "No necesitas ser increíble para empezar, pero necesitas empezar para ser increíble.",
    "La constancia vence lo que la dicha no alcanza.",
    "Un 1% mejor cada día = 37 veces mejor en un año.",
    "Cada línea de código te acerca a ser senior.",
    "Los mejores programadores no nacieron sabiendo. Simplemente no se rindieron.",
    "Java no se aprende viendo tutoriales. Se aprende ESCRIBIENDO código.",
    "Tu único competidor es quien fuiste ayer.",
    "No busques ser perfecto. Busca ser MEJOR que ayer.",
    "Deja de pensar. Empieza a hacer.",
    "La acción cura el miedo. La inacción lo alimenta.",
    "5 minutos de acción valen más que 5 horas de planeación.",
    "Nadie viene a salvarte. Tú eres tu propio héroe.",
    "O encuentras una forma o encuentras una excusa. No ambas.",
    "Las vacaciones son para EVOLUCIONAR, no para vegetar.",
    "Mientras otros pierden tiempo, tú estás ganando futuro.",
    "El tiempo libre es tu oportunidad de adelantarte 10 pasos.",
    "Ese curso de Java lleva 7 meses esperando. Hoy es su día.",
    "Hazlo. Ahora.",
    "Sin excusas.",
    "El código no se escribe solo.",
    "Tú vs Tú. Gana.",
    "No mañana. HOY."
];

// Variables globales
let tasks = [];
let streak = 0;
let lastDate = '';
let timers = {};
let timeRemaining = {};
let currentTaskNote = null;
let pomodoroEnabled = false;
let pomodoroPhase = 'work'; // 'work' o 'break'
let workMinutes = 25;
let breakMinutes = 5;
let notificationsEnabled = false;
let stats = {
    totalCompleted: 0,
    totalTime: 0,
    bestStreak: 0,
    weeklyData: {},
    activityData: {}
};

// Inicializar
function init() {
    loadData();
    loadSettings();
    displayQuote();
    displayTasks();
    updateStreak();
    updateStats();
    displayDate();
    requestNotificationPermission();
    
    document.getElementById('reset-btn').addEventListener('click', resetDay);
    document.getElementById('add-task-btn').addEventListener('click', showAddTaskForm);
    
    // Check inactividad cada 30 min
    setInterval(checkInactivity, 1800000);
}

// Cargar datos
function loadData() {
    const today = new Date().toDateString();
    const savedTasks = localStorage.getItem('tasks');
    const savedStreak = localStorage.getItem('streak');
    const savedDate = localStorage.getItem('lastDate');
    const savedCustomTasks = localStorage.getItem('customTasks');
    const savedStats = localStorage.getItem('stats');
    
    if (savedCustomTasks) {
        tasks = JSON.parse(savedCustomTasks);
    } else if (savedTasks && savedDate === today) {
        tasks = JSON.parse(savedTasks);
    } else {
        tasks = tasksData.map(t => ({ ...t, done: false, running: false, notes: '' }));
    }
    
    tasks.forEach(task => {
        if (!task.notes) task.notes = '';
        timeRemaining[task.id] = task.minutes * 60;
    });
    
    streak = savedStreak ? parseInt(savedStreak) : 0;
    lastDate = savedDate || '';
    
    if (savedStats) {
        stats = JSON.parse(savedStats);
    }
}

// Guardar datos
function saveData() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('customTasks', JSON.stringify(tasks));
    localStorage.setItem('streak', streak.toString());
    localStorage.setItem('lastDate', lastDate);
    localStorage.setItem('stats', JSON.stringify(stats));
}

// Cargar configuración
function loadSettings() {
    const theme = localStorage.getItem('theme') || 'purple';
    const pomodoro = localStorage.getItem('pomodoroEnabled') === 'true';
    const notifications = localStorage.getItem('notificationsEnabled') === 'true';
    const work = localStorage.getItem('workTime');
    const breakTime = localStorage.getItem('breakTime');
    
    document.body.className = `theme-${theme}`;
    document.getElementById('theme-selector').value = theme;
    
    pomodoroEnabled = pomodoro;
    document.getElementById('pomodoro-toggle').checked = pomodoro;
    document.getElementById('pomodoro-settings').style.display = pomodoro ? 'block' : 'none';
    
    notificationsEnabled = notifications;
    document.getElementById('notifications-toggle').checked = notifications;
    
    if (work) workMinutes = parseInt(work);
    if (breakTime) breakMinutes = parseInt(breakTime);
    document.getElementById('work-time').value = workMinutes;
    document.getElementById('break-time').value = breakMinutes;
}

// Cambiar tema
function changeTheme() {
    const theme = document.getElementById('theme-selector').value;
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
}

// Toggle Pomodoro
function togglePomodoro() {
    pomodoroEnabled = document.getElementById('pomodoro-toggle').checked;
    document.getElementById('pomodoro-settings').style.display = pomodoroEnabled ? 'block' : 'none';
    localStorage.setItem('pomodoroEnabled', pomodoroEnabled);
    
    workMinutes = parseInt(document.getElementById('work-time').value);
    breakMinutes = parseInt(document.getElementById('break-time').value);
    localStorage.setItem('workTime', workMinutes);
    localStorage.setItem('breakTime', breakMinutes);
}

// Toggle notificaciones
function toggleNotifications() {
    notificationsEnabled = document.getElementById('notifications-toggle').checked;
    localStorage.setItem('notificationsEnabled', notificationsEnabled);
    
    if (notificationsEnabled) {
        requestNotificationPermission();
    }
}

// Pedir permiso de notificaciones
function requestNotificationPermission() {
    if ('Notification' in window && notificationsEnabled) {
        Notification.requestPermission();
    }
}

// Mostrar notificación
function showNotification(title, body) {
    if (notificationsEnabled && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '🔔' });
    }
}

// Toggle settings panel
function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    panel.classList.toggle('active');
}

// Mostrar frase
function displayQuote() {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('quote').textContent = `"${randomQuote}"`;
}

// Cambiar tab
function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    if (tabName === 'stats') {
        updateStats();
    }
}

// Mostrar tareas
function displayTasks() {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task ${task.priority ? 'priority' : 'normal'} ${task.done ? 'done' : ''} ${task.running ? 'pomodoro-active' : ''}`;
        
        const seconds = timeRemaining[task.id] || (task.minutes * 60);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const timeDisplay = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        let pomodoroInfo = '';
        if (pomodoroEnabled && task.running) {
            pomodoroInfo = `<div class="pomodoro-mode">🍅 Modo: ${pomodoroPhase === 'work' ? 'Trabajo' : 'Descanso'}</div>`;
        }
        
        taskDiv.innerHTML = `
            <div class="task-checkbox" onclick="toggleTask(${task.id})"></div>
            <div class="task-icon">${task.icon}</div>
            <div class="task-info">
                <div class="task-name">
                    ${task.name}
                    ${task.priority && !task.done ? '<span class="priority-badge">PRIORITARIO</span>' : ''}
                </div>
                <div class="task-time">${task.time}</div>
                <div class="timer-display" id="timer-${task.id}">${timeDisplay}</div>
                ${pomodoroInfo}
            </div>
            <div class="timer-controls">
                <button class="timer-btn start" onclick="toggleTimer(${task.id})">
                    ${task.running ? '⏸️' : '▶️'}
                </button>
                <button class="timer-btn reset-small" onclick="resetTimer(${task.id})">🔄</button>
                <button class="timer-btn edit-small" onclick="editTask(${task.id})">✏️</button>
                <button class="timer-btn notes-small" onclick="openNotesModal(${task.id})">📝</button>
                <button class="timer-btn delete-small" onclick="deleteTask(${task.id})">🗑️</button>
            </div>
        `;
        
        tasksList.appendChild(taskDiv);
    });
}

// Toggle tarea
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.done = !task.done;
        
        if (task.done) {
            updateActivityStats(task);
        }
        
        displayTasks();
        updateStreak();
        saveData();
    }
}

// Toggle timer
function toggleTimer(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    if (task.running) {
        clearInterval(timers[id]);
        task.running = false;
    } else {
        // Parar otros timers si hay
        tasks.forEach(t => {
            if (t.running && t.id !== id) {
                clearInterval(timers[t.id]);
                t.running = false;
            }
        });
        
        task.running = true;
        pomodoroPhase = 'work';
        
        if (pomodoroEnabled) {
            timeRemaining[id] = workMinutes * 60;
        }
        
        timers[id] = setInterval(() => {
            if (timeRemaining[id] > 0) {
                timeRemaining[id]--;
                updateTimerDisplay(id);
            } else {
                if (pomodoroEnabled) {
                    handlePomodoroComplete(id);
                } else {
                    completeTimer(id);
                }
            }
        }, 1000);
        
        showNotification(`⏱️ Timer iniciado`, `${task.name} - ${pomodoroEnabled ? workMinutes : task.minutes} minutos`);
    }
    
    displayTasks();
    saveData();
}

// Pomodoro completado
function handlePomodoroComplete(id) {
    const task = tasks.find(t => t.id === id);
    
    if (pomodoroPhase === 'work') {
        playAlarm();
        showNotification('🍅 Trabajo completado!', 'Toma un descanso');
        
        if (confirm(`🍅 Trabajo completado! ¿Tomar descanso de ${breakMinutes} min?`)) {
            pomodoroPhase = 'break';
            timeRemaining[id] = breakMinutes * 60;
        } else {
            completeTimer(id);
        }
    } else {
        playAlarm();
        showNotification('✅ Descanso terminado!', '¿Otra sesión?');
        
        if (confirm('✅ Descanso terminado! ¿Otra sesión de trabajo?')) {
            pomodoroPhase = 'work';
            timeRemaining[id] = workMinutes * 60;
        } else {
            completeTimer(id);
        }
    }
    
    displayTasks();
}

// Actualizar display
function updateTimerDisplay(id) {
    const timerEl = document.getElementById(`timer-${id}`);
    if (timerEl) {
        const seconds = timeRemaining[id];
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Completar timer
function completeTimer(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    clearInterval(timers[id]);
    task.running = false;
    task.done = true;
    
    playAlarm();
    showNotification(`✅ ¡Completado!`, task.name);
    alert(`✅ ¡Terminaste: ${task.name}!`);
    
    updateActivityStats(task);
    displayTasks();
    updateStreak();
    saveData();
}

// Reset timer
function resetTimer(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    clearInterval(timers[id]);
    task.running = false;
    timeRemaining[id] = task.minutes * 60;
    pomodoroPhase = 'work';
    
    displayTasks();
    saveData();
}

// Editar tarea
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newMinutes = prompt(`¿Cuántos minutos para "${task.name}"?`, task.minutes);
    
    if (newMinutes !== null && !isNaN(newMinutes) && newMinutes > 0) {
        task.minutes = parseInt(newMinutes);
        timeRemaining[id] = task.minutes * 60;
        displayTasks();
        saveData();
    }
}

// Eliminar tarea
function deleteTask(id) {
    if (confirm('¿Eliminar esta tarea?')) {
        clearInterval(timers[id]);
        tasks = tasks.filter(t => t.id !== id);
        delete timeRemaining[id];
        delete timers[id];
        displayTasks();
        updateStreak();
        saveData();
    }
}

// Agregar tarea
function showAddTaskForm() {
    const name = prompt('Nombre de la tarea:');
    if (!name) return;
    
    const time = prompt('Horario (ej: 14:00 - 15:30):', '14:00 - 15:30');
    if (!time) return;
    
    const minutes = prompt('Duración en minutos:', '60');
    if (!minutes || isNaN(minutes)) return;
    
    const icon = prompt('Emoji/icono:', '📝');
    const priority = confirm('¿Es prioritaria?');
    
    const newTask = {
        id: Date.now(),
        name,
        time,
        icon: icon || '📝',
        priority,
        minutes: parseInt(minutes),
        done: false,
        running: false,
        notes: ''
    };
    
    tasks.push(newTask);
    timeRemaining[newTask.id] = newTask.minutes * 60;
    
    displayTasks();
    saveData();
}

// Modal de notas
function openNotesModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    currentTaskNote = id;
    document.getElementById('notes-task-name').textContent = `${task.icon} ${task.name}`;
    document.getElementById('notes-textarea').value = task.notes || '';
    document.getElementById('notes-modal').classList.add('active');
}

function closeNotesModal() {
    document.getElementById('notes-modal').classList.remove('active');
    currentTaskNote = null;
}

function saveNotes() {
    if (currentTaskNote) {
        const task = tasks.find(t => t.id === currentTaskNote);
        if (task) {
            task.notes = document.getElementById('notes-textarea').value;
            saveData();
        }
    }
    closeNotesModal();
}

// Sonido de alarma
function playAlarm() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }, i * 600);
    }
}

// Actualizar racha
function updateStreak() {
    const today = new Date().toDateString();
    const priorityTasks = tasks.filter(t => t.priority);
    const donePriority = priorityTasks.filter(t => t.done).length;
    const totalPriority = priorityTasks.length;
    
    document.getElementById('progress').textContent = 
        `${donePriority}/${totalPriority} tareas prioritarias completadas hoy`;
    
    if (donePriority === totalPriority && lastDate !== today && totalPriority > 0) {
        streak++;
        lastDate = today;
        
        if (streak > stats.bestStreak) {
            stats.bestStreak = streak;
        }
        
        saveData();
    }
    
    document.getElementById('streak').textContent = streak;
}

// Actualizar estadísticas de actividad
function updateActivityStats(task) {
    stats.totalCompleted++;
    stats.totalTime += task.minutes;
    
    const today = new Date().toDateString();
    if (!stats.weeklyData[today]) {
        stats.weeklyData[today] = 0;
    }
    stats.weeklyData[today]++;
    
    if (!stats.activityData[task.name]) {
        stats.activityData[task.name] = { count: 0, time: 0, icon: task.icon };
    }
    stats.activityData[task.name].count++;
    stats.activityData[task.name].time += task.minutes;
    
    saveData();
}

// Mostrar estadísticas
function updateStats() {
    document.getElementById('stat-streak').textContent = `${streak} días`;
    document.getElementById('stat-best-streak').textContent = `${stats.bestStreak} días`;
    document.getElementById('stat-completed').textContent = `${stats.totalCompleted} tareas`;
    
    const hours = Math.floor(stats.totalTime / 60);
    const mins = stats.totalTime % 60;
    document.getElementById('stat-time').textContent = `${hours}h ${mins}m`;
    
    // Gráfica semanal
    const weeklyChart = document.getElementById('weekly-chart');
    weeklyChart.innerHTML = '';
    
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(date);
    }
    
    const maxTasks = Math.max(...last7Days.map(d => stats.weeklyData[d.toDateString()] || 0), 1);
    
    last7Days.forEach(date => {
        const dateStr = date.toDateString();
        const count = stats.weeklyData[dateStr] || 0;
        const height = (count / maxTasks) * 100;
        
        const dayBar = document.createElement('div');
        dayBar.className = 'day-bar';
        dayBar.innerHTML = `
            <div class="bar" style="height: ${Math.max(height, 10)}px">${count}</div>
            <div class="bar-label">${date.toLocaleDateString('es-ES', { weekday: 'short' })}</div>
        `;
        weeklyChart.appendChild(dayBar);
    });
    
    // Desglose por actividad
    const activityBreakdown = document.getElementById('activity-breakdown');
    activityBreakdown.innerHTML = '';
    
    Object.entries(stats.activityData).forEach(([name, data]) => {
        const hours = Math.floor(data.time / 60);
        const mins = data.time % 60;
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-name">
                <span>${data.icon}</span>
                <span>${name}</span>
            </div>
            <div class="activity-stats">
                <div class="activity-count">${data.count} veces</div>
                <div class="activity-time">${hours}h ${mins}m</div>
            </div>
        `;
        activityBreakdown.appendChild(activityItem);
    });
}

// Check inactividad
function checkInactivity() {
    const hasRunningTask = tasks.some(t => t.running);
    if (!hasRunningTask && notificationsEnabled) {
        showNotification('⏰ Recordatorio', '¿Ya empezaste tus tareas de hoy?');
    }
}

// Resetear día
function resetDay() {
    if (confirm('¿Seguro que quieres resetear el día?')) {
        Object.keys(timers).forEach(id => clearInterval(timers[id]));
        
        tasks = tasks.map(t => ({ ...t, done: false, running: false }));
        
        tasks.forEach(task => {
            timeRemaining[task.id] = task.minutes * 60;
        });
        
        displayTasks();
        updateStreak();
        saveData();
    }
}

// Mostrar fecha
function displayDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('es-ES', options);
    document.getElementById('date').textContent = `Fecha: ${dateStr}`;
}

// Iniciar
window.addEventListener('DOMContentLoaded', init);