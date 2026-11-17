import React, { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  Check,
  X,
  Plus,
  LogOut,
  Mail,
  Lock,
  ListTodo
} from "lucide-react";
import { auth, googleProvider, db } from "./firebase";
import "./App.css";

export default function App() {
  // Estados de Autenticación
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Estados de Tareas (Firestore)
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // 1. Escuchar estado de sesión del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Escuchar tareas en tiempo real con onSnapshot (solo del usuario activo)
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data()
        }));
        // Ordenar del más reciente al más antiguo en cliente (evita requerir índices compuestos)
        list.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        setTasks(list);
      },
      (error) => {
        console.error("Error leyendo Firestore:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Manejadores de Autenticación
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail("");
      setPassword("");
    } catch (err) {
      setAuthError("Error de autenticación: " + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError("Error con Google: " + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Manejadores CRUD en Firestore
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;

    try {
      await addDoc(collection(db, "tasks"), {
        title: newTaskTitle.trim(),
        completed: false,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      setNewTaskTitle("");
    } catch (err) {
      console.error("Error al crear tarea:", err);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, {
        completed: !task.completed
      });
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingText(task.title);
  };

  const handleSaveEdit = async (taskId) => {
    if (!editingText.trim()) return;
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        title: editingText.trim()
      });
      setEditingId(null);
      setEditingText("");
    } catch (err) {
      console.error("Error al editar tarea:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (err) {
      console.error("Error al eliminar tarea:", err);
    }
  };

  if (authLoading) {
    return <div className="loader-screen">Cargando aplicación...</div>;
  }

  // PANTALLA DE LOGIN / REGISTRO (Si no hay sesión iniciada)
  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="brand-header">
            <ListTodo size={36} className="brand-icon" />
            <h1>TaskFlow PWA</h1>
            <p>
              {isRegistering
                ? "Crea una cuenta para sincronizar tus tareas"
                : "Inicia sesión"}
            </p>
          </div>

          {authError && <div className="error-alert">{authError}</div>}

          <form onSubmit={handleEmailAuth} className="auth-form">
            <div className="input-group">
              <Mail size={18} />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Contraseña (mín. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn-primary">
              {isRegistering ? "Registrarse" : "Iniciar Sesión"}
            </button>
          </form>

          <div className="divider">
            <span>o continúa con</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn-google"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              width="18"
            />
            <span>Continuar con Google</span>
          </button>

          <p className="toggle-auth">
            {isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError("");
              }}
            >
              {isRegistering ? "Inicia sesión" : "Regístrate aquí"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // PANTALLA PRINCIPAL DE TAREAS (Solo visible con sesión iniciada)
  return (
    <div className="app-wrapper">
      <header className="top-bar">
        <div className="user-info">
          <ListTodo size={24} />
          <div>
            <h2>Mis Tareas</h2>
            <span className="user-email">{user.email}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout" title="Cerrar sesión">
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </header>

      <main className="main-content">
        <form onSubmit={handleCreateTask} className="new-task-form">
          <input
            type="text"
            placeholder="¿Qué tarea necesitas hacer hoy?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button type="submit" className="btn-add">
            <Plus size={20} />
            <span>Agregar</span>
          </button>
        </form>

        <div className="tasks-stats">
          <span>Total: {tasks.length}</span>
          <span>
            Completadas: {tasks.filter((t) => t.completed).length}
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            No tienes tareas registradas. Agrega una arriba para comenzar.
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`task-item ${task.completed ? "completed" : ""}`}
              >
                {editingId === task.id ? (
                  <div className="edit-mode">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(task.id)}
                      className="icon-btn save"
                      title="Guardar"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="icon-btn cancel"
                      title="Cancelar"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="check-btn"
                      aria-label="Marcar completada"
                    >
                      {task.completed ? (
                        <CheckCircle2 size={22} className="checked-icon" />
                      ) : (
                        <Circle size={22} />
                      )}
                    </button>

                    <span
                      className="task-title"
                      onClick={() => handleToggleComplete(task)}
                    >
                      {task.title}
                    </span>

                    <div className="task-actions">
                      <button
                        onClick={() => startEditing(task)}
                        className="icon-btn edit"
                        title="Editar tarea"
                      >
                        <Edit3 size={17} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="icon-btn delete"
                        title="Eliminar tarea"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}