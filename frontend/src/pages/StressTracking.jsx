import { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';
import stressService from '../services/stressService';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const StressTracking = () => {
  const [stressLevel, setStressLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await stressService.getStressHistory(30);
      setHistory(response.stressLogs);
      setStatistics(response.statistics);
    } catch (error) {
      toast.error('Failed to load stress history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await stressService.logStress({ stressLevel, notes });
      toast.success('Stress level logged successfully');
      setNotes('');
      loadHistory();
    } catch (error) {
      toast.error('Failed to log stress level');
    }
  };

  const chartData = history.map((log) => ({
    date: format(new Date(log.date), 'MMM dd'),
    level: log.stressLevel
  }));

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Stress Tracking</h1>

        {/* Log Stress Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Log Your Stress Level</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stress Level: {stressLevel}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="How are you feeling today?"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Log Stress Level
            </button>
          </form>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Average Stress</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {statistics.average.toFixed(1)}/10
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Recent Stress</div>
              <div className="mt-2 text-3xl font-bold text-orange-600">
                {statistics.recent}/10
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">High Stress Days</div>
              <div className="mt-2 text-3xl font-bold text-red-600">
                {statistics.highStressDays}
              </div>
            </div>
          </div>
        )}

        {/* Stress Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stress Trend (Last 30 Days)</h2>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="#f97316"
                  strokeWidth={2}
                  name="Stress Level"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No stress data available yet</p>
          )}
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent History</h2>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.slice(0, 10).map((log) => (
                <div key={log._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {format(new Date(log.date), 'MMM dd, yyyy')}
                    </div>
                    {log.notes && (
                      <div className="text-sm text-gray-500">{log.notes}</div>
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${
                    log.stressLevel <= 3 ? 'text-green-600' :
                    log.stressLevel <= 6 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {log.stressLevel}/10
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No stress history available</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StressTracking;
