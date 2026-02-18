import { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';
import dashboardService from '../services/dashboardService';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import SplitText from '../components/reactbits/SplitText';
import FadeInStagger from '../components/reactbits/FadeInStagger';

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
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="text-center text-base-content/70">No data available</div>
      </Layout>
    );
  }

  const COLORS = ['#0ea5e9', '#0284c7', '#0369a1', '#075985'];

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Critical': return 'badge-error';
      case 'High': return 'badge-warning';
      case 'Medium': return 'badge-info';
      case 'Low': return 'badge-success';
      default: return 'badge-ghost';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <SplitText
          text="Dashboard Overview"
          as="h1"
          className="text-3xl font-bold text-base-content"
          delay={35}
          duration={0.7}
        />

        {/* Stats Grid */}
        <FadeInStagger
          as="div"
          className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-100"
          delay={0.1}
        >
          <div className="stat">
            <div className="stat-title">Total Tasks</div>
            <div className="stat-value text-primary">{dashboardData.completionStats.total}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Completed</div>
            <div className="stat-value text-success">{dashboardData.completionStats.completed}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Completion Rate</div>
            <div className="stat-value text-primary">{dashboardData.completionStats.completionRate}%</div>
          </div>
          <div className="stat">
            <div className="stat-title">Current Stress</div>
            <div className="stat-value text-warning">
              {dashboardData.stressAnalytics.current || 'N/A'}
            </div>
          </div>
        </FadeInStagger>

        {/* Today's Schedule */}
        <FadeInStagger as="div" className="card bg-base-100 shadow-xl" delay={0.15}>
          <div className="card-body">
            <h2 className="card-title text-2xl">Today's Schedule</h2>
            {dashboardData.todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.todaySchedule.map((schedule) => (
                  <div
                    key={schedule._id}
                    className="flex items-center justify-between p-4 bg-base-200 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold text-base-content">{schedule.task.title}</div>
                      <div className="text-sm text-base-content/70">{schedule.task.subject}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-base-content">
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div
                        className={`badge ${getPriorityBadgeClass(schedule.task.priority)} mt-1`}
                      >
                        {schedule.task.priority}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/70">No schedule for today</p>
            )}
          </div>
        </FadeInStagger>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stress Trend */}
          <FadeInStagger as="div" className="card bg-base-100 shadow-xl" delay={0.2}>
            <div className="card-body">
              <h2 className="card-title">Stress Trend (Last 7 Days)</h2>
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
                <p className="text-base-content/70 text-center py-12">No stress data available</p>
              )}
            </div>
          </FadeInStagger>

          {/* Priority Distribution */}
          <FadeInStagger as="div" className="card bg-base-100 shadow-xl" delay={0.25}>
            <div className="card-body">
              <h2 className="card-title">Task Priority Distribution</h2>
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
                <p className="text-base-content/70 text-center py-12">No tasks available</p>
              )}
            </div>
          </FadeInStagger>
        </div>

        {/* Upcoming Deadlines */}
        <FadeInStagger as="div" className="card bg-base-100 shadow-xl" delay={0.3}>
          <div className="card-body">
            <h2 className="card-title text-2xl">Upcoming Deadlines</h2>
            {dashboardData.upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcomingDeadlines.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-4 bg-base-200 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold text-base-content">{task.title}</div>
                      <div className="text-sm text-base-content/70">{task.subject}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-base-content">
                        {format(new Date(task.deadline), 'MMM dd, yyyy')}
                      </div>
                      <div className={`badge ${getPriorityBadgeClass(task.priority)} mt-1`}>
                        {task.priority}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/70">No upcoming deadlines</p>
            )}
          </div>
        </FadeInStagger>
      </div>
    </Layout>
  );
};

export default Dashboard;
