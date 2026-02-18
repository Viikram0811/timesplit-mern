import { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';
import taskService from '../services/taskService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    priority: 'Medium',
    deadline: '',
    estimatedTime: ''
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await taskService.getTasks();
      setTasks(response.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask._id, formData);
        toast.success('Task updated successfully');
      } else {
        await taskService.createTask(formData);
        toast.success('Task created successfully');
      }
      setShowModal(false);
      setEditingTask(null);
      resetForm();
      loadTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      subject: task.subject,
      description: task.description || '',
      priority: task.priority,
      deadline: format(new Date(task.deadline), 'yyyy-MM-dd'),
      estimatedTime: task.estimatedTime.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(id);
        toast.success('Task deleted successfully');
        loadTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleComplete = async (task) => {
    try {
      await taskService.updateTask(task._id, { status: 'Completed' });
      toast.success('Task marked as completed');
      loadTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      description: '',
      priority: 'Medium',
      deadline: '',
      estimatedTime: ''
    });
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical': return 'badge-error';
      case 'High': return 'badge-warning';
      case 'Medium': return 'badge-info';
      case 'Low': return 'badge-success';
      default: return 'badge-ghost';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return 'badge-success';
      case 'In Progress': return 'badge-info';
      case 'Pending': return 'badge-ghost';
      default: return 'badge-error';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-base-content">Tasks</h1>
          <button
            onClick={() => {
              resetForm();
              setEditingTask(null);
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            + Add Task
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Subject</th>
                      <th>Priority</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task._id}>
                        <td className="font-semibold">{task.title}</td>
                        <td>{task.subject}</td>
                        <td>
                          <span className={`badge ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td>{format(new Date(task.deadline), 'MMM dd, yyyy')}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {task.status !== 'Completed' && (
                              <button
                                onClick={() => handleComplete(task)}
                                className="btn btn-sm btn-success"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(task)}
                              className="btn btn-sm btn-primary"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(task._id)}
                              className="btn btn-sm btn-error"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        <dialog className={`modal ${showModal ? 'modal-open' : ''}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">{editingTask ? 'Edit Task' : 'Create Task'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="Enter task title"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Subject</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="Enter subject"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="textarea textarea-bordered w-full"
                  rows="3"
                  placeholder="Enter description"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Priority</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Deadline</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Estimated Time (minutes)</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="Enter estimated time"
                />
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                  className="btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setShowModal(false);
              setEditingTask(null);
              resetForm();
            }}>close</button>
          </form>
        </dialog>
      </div>
    </Layout>
  );
};

export default Tasks;
