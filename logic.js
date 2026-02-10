let subjects = JSON.parse(localStorage.getItem('subjects')) || [];
        let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let settings = JSON.parse(localStorage.getItem('settings')) || { reminders: true, darkMode: true };

        let currentDay = 'Monday';

        function init() {
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    currentDay = days[today.getDay()];

    
    applySavedTheme(); 
    renderDashboard();
    renderSubjects();
    renderSchedules();
    renderTasks();
    renderAnalytics();
    checkDeadlines(); 
    
   
    selectDay(currentDay);
}

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                document.getElementById(btn.dataset.section).classList.add('active');
            });
        });

        function applySavedTheme() {
            const themeToggle = document.getElementById('themeToggle');
            if (settings.darkMode === false) {
                document.body.classList.add('light-theme');
                if(themeToggle) themeToggle.checked = false;
            } else {
                document.body.classList.remove('light-theme');
                if(themeToggle) themeToggle.checked = true;
            }
        }

        function toggleTheme() {
            const themeToggle = document.getElementById('themeToggle');
            settings.darkMode = themeToggle.checked;
            
            if (settings.darkMode) {
                document.body.classList.remove('light-theme');
            } else {
                document.body.classList.add('light-theme');
            }
            
            localStorage.setItem('settings', JSON.stringify(settings));
        }

        function renderDashboard() {
    document.getElementById('totalSubjects').textContent = subjects.length;
    document.getElementById('pendingTasks').textContent = tasks.filter(t => !t.completed).length;
    
    const todaySchedules = schedules.filter(s => s.day === currentDay);
    const totalHours = todaySchedules.reduce((sum, s) => {
        const start = new Date('2000-01-01 ' + s.startTime);
        const end = new Date('2000-01-01 ' + s.endTime);
        return sum + (end - start) / (1000 * 60 * 60);
    }, 0);
    document.getElementById('studyHours').textContent = totalHours.toFixed(1);
    
    const completionRate = tasks.length > 0 
        ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
        : 0;
    document.getElementById('completionRate').textContent = completionRate + '%';
    
    renderTodaySchedule();

    
    const deadlineContainer = document.getElementById('upcomingDeadlines');
    if (settings.reminders) {
        deadlineContainer.parentElement.style.display = 'block'; 
        renderUpcomingDeadlines();
    } else {
        deadlineContainer.parentElement.style.display = 'none';  
    }
}

        function renderTodaySchedule() {
            const container = document.getElementById('todaySchedule');
            const todaySchedules = schedules.filter(s => s.day === currentDay).sort((a, b) => 
                a.startTime.localeCompare(b.startTime)
            );
            
            if (todaySchedules.length === 0) {
                container.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-text">No schedule for today</div></div>';
                return;
            }
            
            container.innerHTML = todaySchedules.map(schedule => {
                const subject = subjects.find(s => s.id === schedule.subjectId);
                return `
                    <div class="schedule-item">
                        <div>
                            <div class="schedule-time">${schedule.startTime} - ${schedule.endTime}</div>
                            <div class="schedule-subject">${subject ? subject.name : 'Unknown'}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function checkDeadlines() {
            if (!settings.reminders) return;
            
            const now = new Date();
            const alertThreshold = 24 * 60 * 60 * 1000; 
            
            tasks.forEach(task => {
                if (task.completed) return;
                
                const deadline = new Date(task.deadline);
                const timeLeft = deadline - now;
                
                if (timeLeft > 0 && timeLeft <= alertThreshold) {
                    showNotification(`Reminder: "${task.title}" is due in less than 24 hours!`, 'warning');
                }
            });
        }

        function renderTaskAnalytics() {
            const container = document.getElementById('taskAnalyticsContent');
            const total = tasks.length;
            const completed = tasks.filter(t => t.completed).length;
            const pending = total - completed;
            const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

            container.innerHTML = `
                <div style="margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem; font-weight: 600;">
                        <span>Task Completion Status <br> <small style="color: var(--text-secondary); font-weight: 400;">Total Tasks: ${total}</small></span>
                        <span>${rate}% Complete</span>
                    </div>
                    <div class="progress-bar" style="height: 12px; background: rgba(0,0,0,0.1); border-radius: 20px; overflow: hidden;">
                        <div class="progress-fill" style="width: ${rate}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); transition: width 0.5s ease;"></div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div style="background: rgba(81, 207, 102, 0.1); padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid rgba(81, 207, 102, 0.2);">
                        <div style="font-size: 2.2rem; font-weight: 800; color: var(--success); font-family: 'Space Mono', monospace;">${completed}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Completed</div>
                    </div>
                    <div style="background: rgba(255, 230, 109, 0.1); padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid rgba(255, 230, 109, 0.2);">
                        <div style="font-size: 2.2rem; font-weight: 800; color: var(--warning); font-family: 'Space Mono', monospace;">${pending}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Pending</div>
                    </div>
                </div>
            `;
        }

        function renderUpcomingDeadlines() {
            const container = document.getElementById('upcomingDeadlines');
            const upcoming = tasks
                .filter(t => !t.completed && new Date(t.deadline) > new Date())
                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                .slice(0, 5);
            
            if (upcoming.length === 0) {
                container.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-text">No upcoming deadlines</div></div>';
                return;
            }
            
            container.innerHTML = upcoming.map(task => {
                const subject = subjects.find(s => s.id === task.subjectId);
                const deadline = new Date(task.deadline);
                return `
                    <div class="task-item">
                        <div class="task-info">
                            <h4>${task.title}</h4>
                            <div class="task-deadline">
                                ${subject ? subject.name : 'Unknown'} • Due: ${deadline.toLocaleDateString()} ${deadline.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                        <button class="btn btn-small btn-success" onclick="completeTask('${task.id}')">Complete</button>
                    </div>
                `;
            }).join('');
        }

        function openAddSubjectModal() {
            document.getElementById('addSubjectModal').classList.add('active');
            document.getElementById('addSubjectForm').reset();
        }

        function addSubject(e) {
            e.preventDefault();
            
            const subject = {
                id: Date.now().toString(),
                name: document.getElementById('subjectName').value,
                priority: document.getElementById('subjectPriority').value,
                hours: parseInt(document.getElementById('subjectHours').value),
                notes: document.getElementById('subjectNotes').value,
                createdAt: new Date().toISOString()
            };
            
            subjects.push(subject);
            localStorage.setItem('subjects', JSON.stringify(subjects));
            
            closeModal('addSubjectModal');
            renderSubjects();
            renderDashboard();
            updateSubjectSelects();
            showNotification('Subject added successfully!', 'success');
        }

        function renderSubjects() {
            const container = document.getElementById('subjectList');
            
            if (subjects.length === 0) {
                container.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><div class="empty-text">No subjects yet</div><p style="color: var(--text-secondary);">Add your first subject to get started</p></div>';
                return;
            }
            
            container.innerHTML = subjects.map(subject => `
                <div class="subject-item">
                    <div class="subject-name">${subject.name}</div>
                    <div class="subject-meta">
                        <span class="subject-tag priority-${subject.priority}">${subject.priority.toUpperCase()}</span>
                        <span class="subject-tag">${subject.hours}h/week</span>
                    </div>
                    ${subject.notes ? `<p style="color: var(--text-secondary); margin: 0.5rem 0;">${subject.notes}</p>` : ''}
                    <div class="subject-actions">
                        <button class="btn btn-small btn-secondary" onclick="editSubject('${subject.id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="deleteSubject('${subject.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        }

        let subjectToDeleteId = null;

        function deleteSubject(id) {
            subjectToDeleteId = id;
            const modal = document.getElementById('confirmModal');
            modal.classList.add('active');
            
            document.getElementById('confirmBtn').onclick = function() {
                subjects = subjects.filter(s => s.id !== subjectToDeleteId);
                localStorage.setItem('subjects', JSON.stringify(subjects));
                
                closeModal('confirmModal');
                renderSubjects();
                renderDashboard();
                updateSubjectSelects();
                showNotification('Subject deleted successfully', 'danger');
                
                subjectToDeleteId = null;
            };
        }

        function editSubject(id) {
            const subject = subjects.find(s => s.id === id);
            
            if (subject) {
                document.getElementById('addSubjectModal').classList.add('active');
                document.querySelector('#addSubjectModal .modal-title').textContent = 'Edit Subject';
                
                document.getElementById('subjectName').value = subject.name;
                document.getElementById('subjectPriority').value = subject.priority;
                document.getElementById('subjectHours').value = subject.hours;
                document.getElementById('subjectNotes').value = subject.notes || '';
                
                const form = document.getElementById('addSubjectForm');
                form.onsubmit = function(e) {
                    e.preventDefault();
                    
                    subject.name = document.getElementById('subjectName').value;
                    subject.priority = document.getElementById('subjectPriority').value;
                    subject.hours = parseInt(document.getElementById('subjectHours').value);
                    subject.notes = document.getElementById('subjectNotes').value;
                    
                    localStorage.setItem('subjects', JSON.stringify(subjects));
                    closeModal('addSubjectModal');
                    renderSubjects();
                    renderDashboard();
                    updateSubjectSelects();
                    
                    showNotification('Subject updated successfully!', 'success');
                    
                    form.onsubmit = addSubject;
                    document.querySelector('#addSubjectModal .modal-title').textContent = 'Add New Subject';
                };
            }
        }

        function selectDay(day) {
            currentDay = day;
            document.querySelectorAll('.day-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.day === day);
            });
            renderSchedules();
        }

        function openAddScheduleModal() {
            if (subjects.length === 0) {
                showNotification('Please add subjects first!', 'warning');
                return;
            }
            document.getElementById('addScheduleModal').classList.add('active');
            document.getElementById('addScheduleForm').reset();
            document.getElementById('scheduleDay').value = currentDay;
            updateSubjectSelects();
        }

        function addSchedule(e) {
            e.preventDefault();
            
            const day = document.getElementById('scheduleDay').value;
            const startTime = document.getElementById('scheduleStartTime').value;
            const endTime = document.getElementById('scheduleEndTime').value;
            
            const conflict = schedules.find(s => 
                s.day === day &&
                ((startTime >= s.startTime && startTime < s.endTime) ||
                 (endTime > s.startTime && endTime <= s.endTime) ||
                 (startTime <= s.startTime && endTime >= s.endTime))
            );
            
            if (conflict) {
                showNotification('Time conflict detected!', 'danger');
                return;
            }
            
            if (startTime >= endTime) {
                showNotification('End time must be after start time!', 'danger');
                return;
            }
            
            const schedule = {
                id: Date.now().toString(),
                day: day,
                subjectId: document.getElementById('scheduleSubject').value,
                startTime: startTime,
                endTime: endTime,
                createdAt: new Date().toISOString()
            };
            
            schedules.push(schedule);
            localStorage.setItem('schedules', JSON.stringify(schedules));
            
            closeModal('addScheduleModal');
            renderSchedules();
            renderDashboard();
            showNotification('Schedule added successfully!', 'success');
        }

        function renderSchedules() {
            const container = document.getElementById('scheduleList');
            const daySchedules = schedules.filter(s => s.day === currentDay).sort((a, b) => 
                a.startTime.localeCompare(b.startTime)
            );
            
            if (daySchedules.length === 0) {
                container.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-text">No schedule for ' + currentDay + '</div></div>';
                return;
            }
            
            container.innerHTML = daySchedules.map(schedule => {
                const subject = subjects.find(s => s.id === schedule.subjectId);
                return `
                    <div class="schedule-item">
                        <div>
                            <div class="schedule-time">${schedule.startTime} - ${schedule.endTime}</div>
                            <div class="schedule-subject">${subject ? subject.name : 'Unknown'}</div>
                        </div>
                        <button class="btn btn-small btn-danger" onclick="deleteSchedule('${schedule.id}')">Delete</button>
                    </div>
                `;
            }).join('');
        }

        function deleteSchedule(id) {
            if (confirm('Delete this schedule?')) {
                schedules = schedules.filter(s => s.id !== id);
                localStorage.setItem('schedules', JSON.stringify(schedules));
                renderSchedules();
                renderDashboard();
                showNotification('Schedule deleted', 'success');
            }
        }

        function openAddTaskModal() {
            if (subjects.length === 0) {
                showNotification('Please add subjects first!', 'warning');
                return;
            }
            document.getElementById('addTaskModal').classList.add('active');
            document.getElementById('addTaskForm').reset();
            updateSubjectSelects();
        }

        function addTask(e) {
            e.preventDefault();
            
            const task = {
                id: Date.now().toString(),
                title: document.getElementById('taskTitle').value,
                subjectId: document.getElementById('taskSubject').value,
                type: document.getElementById('taskType').value,
                deadline: document.getElementById('taskDeadline').value,
                description: document.getElementById('taskDescription').value,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(task);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            closeModal('addTaskModal');
            renderTasks();
            renderDashboard();
            showNotification('Task added successfully!', 'success');
        }

        function renderTasks() {
            const container = document.getElementById('taskList');
            
            if (tasks.length === 0) {
                container.innerHTML = '<div class="empty-state"><div class="empty-text">No tasks yet</div></div>';
                return;
            }
            
            const sortedTasks = tasks.sort((a, b) => a.completed - b.completed);
            
            container.innerHTML = sortedTasks.map(task => {
                const subject = subjects.find(s => s.id === task.subjectId);
                return `
                    <div class="task-item ${task.completed ? 'completed' : ''}">
                        <div class="task-info">
                            <h4>${task.title}</h4>
                            <p>${subject ? subject.name : 'General'} • Due: ${new Date(task.deadline).toLocaleDateString()}</p>
                        </div>
                        <button onclick="completeTask('${task.id}')" class="btn btn-small btn-success">Done</button>
                    </div>
                `;
            }).join('');
        }

        function completeTask(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = true;
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
                renderDashboard();
                renderAnalytics();
                showNotification('Task completed! 🎉', 'success');
            }
        }

        function renderAnalytics() {
            const chartContainer = document.getElementById('studyChart');
            if (subjects.length === 0) {
                chartContainer.innerHTML = '<p>Add subjects to see analytics.</p>';
                return;
            }

            const maxHours = Math.max(...subjects.map(s => s.hours));
            
            chartContainer.innerHTML = subjects.map(subject => {
                const heightPercentage = (subject.hours / maxHours) * 100;
                return `
                    <div class="chart-bar" style="height: ${heightPercentage}%">
                        <span class="bar-label">${subject.name}</span>
                    </div>
                `;
            }).join('');
            
            renderTaskAnalytics();
        }

        function saveSettings() {
            settings.reminders = document.getElementById('remindersToggle').checked;
            localStorage.setItem('settings', JSON.stringify(settings));
            showNotification('Settings saved!', 'success');
        }

        function exportData() {
            const data = {
                subjects: subjects,
                schedules: schedules,
                tasks: tasks,
                settings: settings,
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `study-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            showNotification('Data exported successfully!', 'success');
        }

        function resetData() {
            document.getElementById('resetConfirmModal').classList.add('active');

            document.getElementById('finalResetBtn').onclick = function() {
                localStorage.clear();
                
                subjects = [];
                schedules = [];
                tasks = [];
                settings = { reminders: true, darkMode: true };
                
                document.body.classList.remove('light-theme');
                closeModal('resetConfirmModal');
                init(); 
                
                showNotification('All data has been wiped successfully.', 'danger');
            };
        }

        function updateSubjectSelects() {
            const selects = [
                document.getElementById('scheduleSubject'),
                document.getElementById('taskSubject')
            ];
            
            selects.forEach(select => {
                select.innerHTML = subjects.map(subject => 
                    `<option value="${subject.id}">${subject.name}</option>`
                ).join('');
            });
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        function showNotification(message, type = 'success') {
            const existingNotifications = document.querySelectorAll('.notification');
            existingNotifications.forEach(n => n.remove());

            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'toastSlideOut 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });

        init();
