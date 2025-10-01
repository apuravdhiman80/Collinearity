import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Custom Hook for localStorage
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// --- SVG Icons ---
// Using simple functional components for icons to keep it self-contained.
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const CheckSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

// --- Components ---

const Dashboard = ({ tasks, events }) => {
  const [time, setTime] = useState(new Date());
  const [quote, setQuote] = useState({ text: "Loading...", author: "..." });

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    fetch("https://type.fit/api/quotes")
        .then(response => response.json())
        .then(data => {
            const randomQuote = data[Math.floor(Math.random() * data.length)];
            setQuote({ text: randomQuote.text, author: randomQuote.author || "Unknown" });
        })
        .catch(() => setQuote({ text: "The best way to predict the future is to create it.", author: "Peter Drucker" }));
    return () => clearInterval(timerId);
  }, []);
  
  const welcomeMessage = useMemo(() => {
    const hour = time.getHours();
    if (hour < 12) return "Good Morning!";
    if (hour < 18) return "Good Afternoon!";
    return "Good Evening!";
  }, [time]);

  const tasksToday = tasks.filter(t => !t.completed).length;
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3);

  return (
    <div className="dashboard-content fade-in">
      <h1>{welcomeMessage}</h1>
      <p className="current-time">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      <p className="current-date">{time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <div className="quote-card">
        <p>"{quote.text}"</p>
        <span>- {quote.author}</span>
      </div>

      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Tasks Pending</h3>
          <p className="summary-value">{tasksToday}</p>
          <span>Keep up the good work!</span>
        </div>
        <div className="summary-card">
          <h3>Upcoming Events</h3>
          {upcomingEvents.length > 0 ? (
            <ul className="upcoming-events-list">
              {upcomingEvents.map(event => (
                <li key={event.id}><strong>{event.title}</strong> - {new Date(event.date).toLocaleDateString()}</li>
              ))}
            </ul>
          ) : (
            <p className="summary-value small">No upcoming events.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const TodoApp = ({ tasks, setTasks }) => {
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim() === "") return;
    setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };
  
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const filteredTasks = useMemo(() => {
    switch(filter) {
        case "completed":
            return tasks.filter(t => t.completed);
        case "active":
            return tasks.filter(t => !t.completed);
        default:
            return tasks;
    }
  }, [tasks, filter]);

  return (
    <div className="feature-content fade-in">
      <h2>Task Manager</h2>
      <form onSubmit={handleAddTask} className="todo-form">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new assignment..."
        />
        <button type="submit"><PlusIcon /></button>
      </form>
      <div className="todo-filters">
          <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
          <button onClick={() => setFilter('active')} className={filter === 'active' ? 'active' : ''}>Active</button>
          <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active' : ''}>Completed</button>
      </div>
      <ul className="todo-list">
        {filteredTasks.map(task => (
          <li key={task.id} className={task.completed ? "completed" : ""}>
            <span onClick={() => toggleTask(task.id)}>{task.text}</span>
            <button className="delete-btn" onClick={() => deleteTask(task.id)}><TrashIcon /></button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PomodoroTimer = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const audioRef = React.useRef(null);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            if (audioRef.current) {
                audioRef.current.play();
            }
            setIsActive(false);
            switchMode(mode === 'work' ? 'shortBreak' : 'work');
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, mode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = (newMinutes) => {
    setIsActive(false);
    setMinutes(newMinutes);
    setSeconds(0);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    switch (newMode) {
      case 'work':
        resetTimer(25);
        break;
      case 'shortBreak':
        resetTimer(5);
        break;
      case 'longBreak':
        resetTimer(15);
        break;
      default:
        resetTimer(25);
    }
  };
  
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progress = useMemo(() => {
    const totalSeconds = (mode === 'work' ? 25 : mode === 'shortBreak' ? 5 : 15) * 60;
    const remainingSeconds = minutes * 60 + seconds;
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  }, [minutes, seconds, mode]);


  return (
    <div className="feature-content fade-in">
        <h2>Focus Timer</h2>
        <div className="pomodoro-modes">
            <button onClick={() => switchMode('work')} className={mode === 'work' ? 'active' : ''}>Pomodoro</button>
            <button onClick={() => switchMode('shortBreak')} className={mode === 'shortBreak' ? 'active' : ''}>Short Break</button>
            <button onClick={() => switchMode('longBreak')} className={mode === 'longBreak' ? 'active' : ''}>Long Break</button>
        </div>
        <div className="pomodoro-timer">
          <div className="progress-ring">
             <svg className="progress-ring__svg" width="200" height="200">
                <circle className="progress-ring__circle-bg" strokeWidth="8" fill="transparent" r="90" cx="100" cy="100"/>
                <circle className="progress-ring__circle" strokeWidth="8" fill="transparent" r="90" cx="100" cy="100"
                    style={{ strokeDasharray: 2 * Math.PI * 90, strokeDashoffset: (2 * Math.PI * 90) * (1 - progress / 100) }} />
            </svg>
            <div className="timer-display">{timeFormatted}</div>
          </div>
        </div>
        <div className="pomodoro-controls">
            <button onClick={toggleTimer} className="control-btn">{isActive ? 'Pause' : 'Start'}</button>
            <button onClick={() => switchMode(mode)} className="control-btn reset">Reset</button>
        </div>
        <audio ref={audioRef} src="https://www.soundjay.com/buttons/beep-07a.wav" />
    </div>
  );
};

const NotesApp = () => {
    const [notes, setNotes] = useLocalStorage('notes', [{id: 1, title: "Welcome Note", content: "Write your notes here. They are saved automatically!"}]);
    const [activeNote, setActiveNote] = useLocalStorage('activeNoteId', 1);
    
    const currentNote = useMemo(() => notes.find(n => n.id === activeNote), [notes, activeNote]);

    const addNote = () => {
        const newNote = {
            id: Date.now(),
            title: "New Note",
            content: ""
        };
        setNotes([newNote, ...notes]);
        setActiveNote(newNote.id);
    };

    const deleteNote = (id) => {
        setNotes(notes.filter(n => n.id !== id));
        if (activeNote === id) {
            setActiveNote(notes.length > 1 ? notes.find(n => n.id !== id).id : null);
        }
    };
    
    const updateNote = (field, value) => {
        setNotes(notes.map(n => n.id === activeNote ? { ...n, [field]: value } : n));
    };

    return (
        <div className="notes-app-layout fade-in">
            <div className="notes-sidebar">
                <div className="notes-sidebar-header">
                    <h2>Notes</h2>
                    <button onClick={addNote}><PlusIcon /></button>
                </div>
                <div className="notes-list">
                    {notes.map(note => (
                        <div key={note.id} 
                             className={`note-item ${note.id === activeNote ? 'active' : ''}`}
                             onClick={() => setActiveNote(note.id)}>
                            <h3>{note.title || "Untitled Note"}</h3>
                            <button className="delete-note-btn" onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}><TrashIcon /></button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="note-editor">
                {currentNote ? (
                    <>
                        <input 
                            className="note-title-input"
                            type="text"
                            value={currentNote.title}
                            onChange={(e) => updateNote('title', e.target.value)}
                            placeholder="Note Title"
                        />
                        <textarea
                            className="note-content-textarea"
                            value={currentNote.content}
                            onChange={(e) => updateNote('content', e.target.value)}
                            placeholder="Start writing..."
                        />
                    </>
                ) : (
                    <div className="no-note-selected">
                        <h2>Select a note or create a new one.</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

const Scheduler = ({ events, setEvents }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [eventTitle, setEventTitle] = useState("");
    const [eventType, setEventType] = useState("event");

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));

    const openAddEventModal = (date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleAddEvent = (e) => {
        e.preventDefault();
        if (!eventTitle.trim()) return;
        setEvents([...events, { id: Date.now(), title: eventTitle, date: selectedDate, type: eventType }]);
        setIsModalOpen(false);
        setEventTitle("");
        setEventType("event");
    };

    const renderCalendar = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateString = date.toISOString().split('T')[0];
            const dayEvents = events.filter(e => new Date(e.date).toISOString().split('T')[0] === dateString);

            days.push(
                <div key={i} className="calendar-day" onClick={() => openAddEventModal(date)}>
                    <span>{i}</span>
                    <div className="events-container">
                        {dayEvents.map(event => (
                            <div key={event.id} className={`event-marker ${event.type}`}>{event.title}</div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="feature-content fade-in">
            <div className="calendar-header">
                <button onClick={handlePrevMonth}>&lt;</button>
                <h2>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={handleNextMonth}>&gt;</button>
            </div>
            <div className="calendar-grid">
                <div className="day-name">Sun</div><div className="day-name">Mon</div><div className="day-name">Tue</div><div className="day-name">Wed</div><div className="day-name">Thu</div><div className="day-name">Fri</div><div className="day-name">Sat</div>
                {renderCalendar()}
            </div>
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Add Event for {selectedDate.toLocaleDateString()}</h3>
                        <form onSubmit={handleAddEvent}>
                            <input type="text" value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Event Title" autoFocus />
                            <select value={eventType} onChange={e => setEventType(e.target.value)}>
                                <option value="event">Event</option>
                                <option value="exam">Exam</option>
                                <option value="assignment">Assignment</option>
                            </select>
                            <button type="submit">Add Event</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [events, setEvents] = useLocalStorage('events', []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard tasks={tasks} events={events} />;
      case 'tasks':
        return <TodoApp tasks={tasks} setTasks={setTasks} />;
      case 'focus':
        return <PomodoroTimer />;
      case 'notes':
        return <NotesApp />;
      case 'scheduler':
        return <Scheduler events={events} setEvents={setEvents}/>;
      default:
        return <Dashboard tasks={tasks} events={events}/>;
    }
  };

  const NavLink = ({ tab, icon, children }) => (
    <button
      className={`nav-link ${activeTab === tab ? 'active' : ''}`}
      onClick={() => setActiveTab(tab)}
    >
      {icon}
      <span>{children}</span>
    </button>
  );

  return (
    <>
    <style>{`
      /* --- Global Styles & Variables --- */
      :root {
        --bg-primary: #1a1a2e;
        --bg-secondary: #16213e;
        --bg-tertiary: #0f3460;
        --text-primary: #e94560;
        --text-secondary: #dcdcdc;
        --accent: #e94560;
        --accent-hover: #f06a81;
        --border-color: #3a476a;
        --completed-text: #888;
        --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      html, body, #root {
        height: 100%;
        font-family: var(--font-family);
        background-color: var(--bg-primary);
        color: var(--text-secondary);
        font-size: 16px;
      }

      /* --- App Layout --- */
      .app-container {
        display: flex;
        height: 100vh;
        overflow: hidden;
      }

      .sidebar {
        width: 250px;
        background-color: var(--bg-secondary);
        padding: 2rem 1rem;
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--border-color);
      }

      .sidebar-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: var(--text-primary);
        margin-bottom: 3rem;
        padding-left: 0.5rem;
      }

      .sidebar-header h1 {
        font-size: 1.5rem;
      }

      .nav-links {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.9rem 1rem;
        border-radius: 8px;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1rem;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .nav-link:hover {
        background-color: var(--bg-tertiary);
        color: #fff;
      }

      .nav-link.active {
        background-color: var(--accent);
        color: #fff;
        font-weight: 600;
      }

      .content {
        flex-grow: 1;
        padding: 3rem;
        overflow-y: auto;
      }

      /* --- Animations --- */
      .fade-in {
        animation: fadeIn 0.5s ease-in-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* --- Dashboard --- */
      .dashboard-content h1 {
        font-size: 2.5rem;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }
      .quote-card {
        background-color: var(--bg-secondary);
        border-left: 4px solid var(--accent);
        padding: 1rem 1.5rem;
        margin-bottom: 2rem;
        border-radius: 4px;
      }
      .quote-card p {
        font-style: italic;
        color: #fff;
      }
      .quote-card span {
        display: block;
        text-align: right;
        margin-top: 0.5rem;
        color: var(--text-secondary);
      }

      .dashboard-content .current-time {
        font-size: 1.5rem;
        margin-bottom: 0.2rem;
        color: var(--text-secondary);
      }

      .dashboard-content .current-date {
        color: #aaa;
        margin-bottom: 2.5rem;
      }

      .dashboard-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
      }

      .summary-card {
        background-color: var(--bg-secondary);
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .summary-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
      }
      .summary-card h3 {
        color: var(--accent);
        margin-bottom: 0.5rem;
      }
      .summary-card .summary-value {
        font-size: 2.5rem;
        font-weight: bold;
        color: #fff;
        margin-bottom: 0.5rem;
      }
       .summary-card .summary-value.small { font-size: 1.2rem; }
      .summary-card span {
        font-size: 0.9rem;
        color: #aaa;
      }
      .upcoming-events-list {
        list-style: none;
      }
      .upcoming-events-list li {
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }


      /* --- Feature Content (Shared) --- */
      .feature-content {
        max-width: 900px;
        margin: 0 auto;
      }

      .feature-content h2 {
        font-size: 2rem;
        color: var(--text-primary);
        margin-bottom: 2rem;
        border-bottom: 2px solid var(--border-color);
        padding-bottom: 0.5rem;
      }


      /* --- To-Do App --- */
      .todo-form {
        display: flex;
        margin-bottom: 1.5rem;
      }

      .todo-form input {
        flex-grow: 1;
        padding: 0.8rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px 0 0 8px;
        background-color: var(--bg-secondary);
        color: var(--text-secondary);
        font-size: 1rem;
      }

      .todo-form input:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.2);
      }

      .todo-form button {
        padding: 0.8rem 1rem;
        border: none;
        background-color: var(--accent);
        color: white;
        border-radius: 0 8px 8px 0;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .todo-form button:hover {
        background-color: var(--accent-hover);
      }

      .todo-filters {
          margin-bottom: 1rem;
          display: flex;
          gap: 0.5rem;
      }
      .todo-filters button {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
      }
      .todo-filters button:hover {
          background-color: var(--bg-tertiary);
      }
      .todo-filters button.active {
          background-color: var(--accent);
          color: white;
          border-color: var(--accent);
      }

      .todo-list {
        list-style: none;
      }

      .todo-list li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        background-color: var(--bg-secondary);
        border-radius: 8px;
        margin-bottom: 0.5rem;
        border-left: 4px solid var(--accent);
        transition: background-color 0.2s ease;
      }

      .todo-list li:hover {
        background-color: #202b4d;
      }

      .todo-list li.completed span {
        text-decoration: line-through;
        color: var(--completed-text);
      }

      .todo-list li.completed {
          border-left-color: #555;
      }

      .todo-list li span {
        cursor: pointer;
        flex-grow: 1;
      }

      .delete-btn {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        visibility: hidden;
        opacity: 0;
        transition: color 0.2s, opacity 0.2s;
      }

      .todo-list li:hover .delete-btn {
          visibility: visible;
          opacity: 1;
      }

      .delete-btn:hover {
        color: var(--accent);
      }

      /* --- Pomodoro Timer --- */
      .pomodoro-modes {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
      }
      .pomodoro-modes button {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 0.6rem 1.2rem;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
      }
      .pomodoro-modes button:hover {
          background-color: var(--bg-tertiary);
      }
      .pomodoro-modes button.active {
          background-color: var(--accent);
          color: white;
          border-color: var(--accent);
      }

      .pomodoro-timer {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 2rem;
      }

      .progress-ring {
          position: relative;
          width: 200px;
          height: 200px;
      }
      .progress-ring__svg {
          transform: rotate(-90deg);
      }
      .progress-ring__circle, .progress-ring__circle-bg {
          transition: stroke-dashoffset 0.5s;
      }
      .progress-ring__circle-bg {
          stroke: var(--bg-tertiary);
      }
      .progress-ring__circle {
          stroke: var(--accent);
      }

      .timer-display {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3.5rem;
        font-weight: bold;
      }

      .pomodoro-controls {
        display: flex;
        justify-content: center;
        gap: 1rem;
      }

      .control-btn {
        padding: 0.8rem 2rem;
        font-size: 1.2rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .control-btn:first-of-type {
        background-color: var(--accent);
        color: white;
      }
      .control-btn:first-of-type:hover {
        background-color: var(--accent-hover);
      }
      .control-btn.reset {
        background-color: var(--bg-secondary);
        color: var(--text-secondary);
      }

      /* --- Notes App --- */
      .notes-app-layout {
          display: flex;
          height: calc(100vh - 6rem); /* Full height minus content padding */
      }
      .notes-sidebar {
          width: 300px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
      }
      .notes-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
      }
      .notes-sidebar-header h2 {
          margin: 0;
          font-size: 1.2rem;
          color: var(--text-primary);
      }
      .notes-sidebar-header button {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
      }
      .notes-list {
          overflow-y: auto;
          flex-grow: 1;
      }
      .note-item {
          padding: 1rem;
          cursor: pointer;
          border-bottom: 1px solid var(--border-color);
          transition: background-color 0.2s;
          position: relative;
      }
      .note-item:hover {
          background-color: var(--bg-tertiary);
      }
      .note-item.active {
          background-color: var(--bg-tertiary);
          border-left: 3px solid var(--accent);
      }
      .note-item h3 {
          font-size: 1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-right: 2rem;
      }
      .delete-note-btn {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.2s;
      }
      .note-item:hover .delete-note-btn {
          visibility: visible;
          opacity: 1;
      }

      .note-editor {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          padding: 0 1rem;
      }
      .note-title-input {
          background: none;
          border: none;
          color: #fff;
          font-size: 2rem;
          font-weight: bold;
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-color);
      }
      .note-title-input:focus, .note-content-textarea:focus {
          outline: none;
      }
      .note-content-textarea {
          flex-grow: 1;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.1rem;
          padding: 1rem 0;
          resize: none;
          line-height: 1.6;
          font-family: inherit;
      }
      .no-note-selected {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: #888;
      }

      /* Scheduler */
      .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
      }
      .calendar-header h2 {
          color: var(--text-primary);
          margin: 0;
          padding: 0;
          border: none;
      }
      .calendar-header button {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
      }
      .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
      }
      .day-name {
          text-align: center;
          color: var(--accent);
          font-weight: bold;
          padding-bottom: 0.5rem;
      }
      .calendar-day {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          min-height: 100px;
          padding: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
      }
      .calendar-day:not(.empty):hover {
          background-color: var(--bg-tertiary);
      }
      .calendar-day.empty {
          background-color: transparent;
          border: none;
          cursor: default;
      }
      .events-container {
        margin-top: 0.5rem;
      }
      .event-marker {
        font-size: 0.75rem;
        padding: 2px 5px;
        border-radius: 4px;
        margin-bottom: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .event-marker.event { background-color: #0f3460; }
      .event-marker.exam { background-color: #e94560; color: #fff; }
      .event-marker.assignment { background-color: #fca311; color: #000; }
      .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background-color: rgba(0,0,0,0.7); display: flex;
          justify-content: center; align-items: center; z-index: 100;
      }
      .modal-content {
          background-color: var(--bg-secondary); padding: 2rem;
          border-radius: 12px; width: 90%; max-width: 400px;
      }
      .modal-content h3 { color: var(--accent); margin-bottom: 1rem; }
      .modal-content form { display: flex; flex-direction: column; gap: 1rem; }
      .modal-content input, .modal-content select, .modal-content button {
          padding: 0.8rem; border-radius: 8px; border: 1px solid var(--border-color);
          background-color: var(--bg-tertiary); color: var(--text-secondary);
          font-size: 1rem;
      }
      .modal-content button { background-color: var(--accent); cursor: pointer; }


      /* --- Responsive Design --- */
      @media (max-width: 768px) {
        .app-container {
          flex-direction: column;
        }
        .sidebar {
          width: 100%;
          height: auto;
          flex-direction: row;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          border-right: none;
          border-bottom: 1px solid var(--border-color);
        }
        .sidebar-header {
          margin-bottom: 0;
        }
        .sidebar-header h1 {
          display: none;
        }
        .nav-links {
          flex-direction: row;
        }
        .nav-link span {
          display: none;
        }
        .nav-link {
          padding: 0.7rem;
        }
        .content {
          padding: 1.5rem;
        }
        .notes-app-layout {
          flex-direction: column;
        }
        .notes-sidebar {
          width: 100%;
          height: 200px;
          border-right: none;
          border-bottom: 1px solid var(--border-color);
        }
      }
    `}</style>
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <BookOpenIcon />
          <h1>Student Hub</h1>
        </div>
        <div className="nav-links">
          <NavLink tab="dashboard" icon={<HomeIcon />}>Dashboard</NavLink>
          <NavLink tab="tasks" icon={<CheckSquareIcon />}>Tasks</NavLink>
          <NavLink tab="scheduler" icon={<CalendarIcon />}>Scheduler</NavLink>
          <NavLink tab="focus" icon={<ClockIcon />}>Focus</NavLink>
          <NavLink tab="notes" icon={<BookOpenIcon />}>Notes</NavLink>
        </div>
      </nav>
      <main className="content">
        {renderContent()}
      </main>
    </div>
    </>
  );
}

