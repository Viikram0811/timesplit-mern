import { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';
import dashboardService from '../services/dashboardService';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardService.getDashboard();
      setDashboardData(response.dashboard);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="text-center text-gray-500">No data available</div>
      </Layout>
    );
  }

  const COLORS = ['#0ea5e9', '#0284c7', '#0369a1', '#075985'];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Tasks</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{dashboardData.completionStats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Completed</div>
            <div className="mt-2 text-3xl font-bold text-green-600">{dashboardData.completionStats.completed}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Completion Rate</div>
            <div className="mt-2 text-3xl font-bold text-primary-600">{dashboardData.completionStats.completionRate}%</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Current Stress</div>
            <div className="mt-2 text-3xl font-bold text-orange-600">
              {dashboardData.stressAnalytics.current || 'N/A'}
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
          {dashboardData.todaySchedule.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.todaySchedule.map((schedule) => (
                <div key={schedule._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{schedule.task.title}</div>
                    <div className="text-sm text-gray-500">{schedule.task.subject}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{schedule.startTime} - {schedule.endTime}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      schedule.task.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      schedule.task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      schedule.task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {schedule.task.priority}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No schedule for today</p>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stress Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Stress Trend (Last 7 Days)</h2>
            {dashboardData.stressAnalytics.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.stressAnalytics.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="level" stroke="#f97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No stress data available</p>
            )}
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Task Priority Distribution</h2>
            {dashboardData.priorityDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.priorityDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, count }) => `${_id}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {dashboardData.priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No tasks available</p>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Deadlines</h2>
          {dashboardData.upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingDeadlines.map((task) => (
                <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-500">{task.subject}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {format(new Date(task.deadline), 'MMM dd, yyyy')}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {task.priority}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming deadlines</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
