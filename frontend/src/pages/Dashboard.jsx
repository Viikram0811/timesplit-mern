import { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';
import dashboardService from '../services/dashboardService';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import SplitText from '../components/reactbits/SplitText';
import FadeInStagger from '../components/reactbits/FadeInStagger';
import { IconTrend, IconSuccess, IconAlert, IconClock } from '../components/common/Icons';

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
          <span className="loading loading-spinner loading-lg text-blue-600"></span>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="text-center text-gray-600">No data available</div>
      </Layout>
    );
  }

  const COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b'];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-700 border border-orange-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'Low':
        return 'bg-green-100 text-green-700 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <SplitText
          text="📊 Dashboard Overview"
          as="h1"
          className="text-4xl font-bold text-gray-900"
          delay={35}
          duration={0.7}
        />

        {/* Stats Grid */}
        <FadeInStagger as="div" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" delay={0.1}>
          {/* Total Tasks Card */}
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg border border-blue-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Total Tasks</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">
                    {dashboardData.completionStats.total}
                  </p>
                </div>
                <div className="text-blue-300">
                  <IconClock className="w-12 h-12" />
                </div>
              </div>
            </div>
          </div>

          {/* Completed Card */}
          <div className="card bg-gradient-to-br from-green-50 to-green-100 shadow-lg border border-green-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Completed</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {dashboardData.completionStats.completed}
                  </p>
                </div>
                <div className="text-green-300">
                  <IconSuccess className="w-12 h-12" />
                </div>
              </div>
            </div>
          </div>

          {/* Completion Rate Card */}
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg border border-purple-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Completion</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {dashboardData.completionStats.completionRate}%
                  </p>
                </div>
                <div className="text-purple-300">
                  <IconTrend className="w-12 h-12" />
                </div>
              </div>
            </div>
          </div>

          {/* Stress Level Card */}
          <div className="card bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg border border-orange-200">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Current Stress</p>
                  <p className="text-3xl font-bold text-orange-900 mt-1">
                    {dashboardData.stressAnalytics.current || 'N/A'}/10
                  </p>
                </div>
                <div className="text-orange-300">
                  <IconAlert className="w-12 h-12" />
                </div>
              </div>
            </div>
          </div>
        </FadeInStagger>

        {/* Today's Schedule */}
        <FadeInStagger as="div" className="card bg-white shadow-lg border border-gray-200" delay={0.15}>
          <div className="card-body">
            <h2 className="card-title text-2xl text-gray-900 flex items-center gap-2">
              <IconClock className="w-6 h-6 text-blue-600" />
              Today's Schedule
            </h2>
            {dashboardData.todaySchedule.length > 0 ? (
              <div className="space-y-3 mt-4">
                {dashboardData.todaySchedule.map((schedule) => (
                  <div
                    key={schedule._id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">
                        {schedule.task.title}
                      </div>
                      <div className="text-sm text-gray-600">{schedule.task.subject}</div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-1 inline-block ${getPriorityColor(schedule.task.priority)}`}>
                          {schedule.task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8 bg-gray-50 rounded-lg mt-4">
                ✨ No schedule for today. Enjoy your break!
              </p>
            )}
          </div>
        </FadeInStagger>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stress Trend */}
          <FadeInStagger as="div" className="card bg-white shadow-lg border border-gray-200" delay={0.2}>
            <div className="card-body">
              <h2 className="card-title text-gray-900 flex items-center gap-2">
                <span>📈</span> Stress Trend (Last 7 Days)
              </h2>
              {dashboardData.stressAnalytics.trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.stressAnalytics.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis domain={[0, 10]} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="level"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={{ fill: '#f97316', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-600 text-center py-12">
                  No stress data available yet
                </p>
              )}
            </div>
          </FadeInStagger>

          {/* Priority Distribution */}
          <FadeInStagger as="div" className="card bg-white shadow-lg border border-gray-200" delay={0.25}>
            <div className="card-body">
              <h2 className="card-title text-gray-900 flex items-center gap-2">
                <span>🎯</span> Task Priority Distribution
              </h2>
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-600 text-center py-12">
                  No tasks available yet
                </p>
              )}
            </div>
          </FadeInStagger>
        </div>

        {/* Upcoming Deadlines */}
        <FadeInStagger as="div" className="card bg-white shadow-lg border border-gray-200" delay={0.3}>
          <div className="card-body">
            <h2 className="card-title text-2xl text-gray-900 flex items-center gap-2">
              <span>📅</span> Upcoming Deadlines
            </h2>
            {dashboardData.upcomingDeadlines.length > 0 ? (
              <div className="space-y-3 mt-4">
                {dashboardData.upcomingDeadlines.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg border border-gray-200 hover:shadow-md transition"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">{task.title}</div>
                      <div className="text-sm text-gray-600">{task.subject}</div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {format(new Date(task.deadline), 'MMM dd, yyyy')}
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-1 inline-block ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8 bg-gray-50 rounded-lg mt-4">
                🎉 No upcoming deadlines!
              </p>
            )}
          </div>
        </FadeInStagger>
      </div>
    </Layout>
  );
};

export default Dashboard;
