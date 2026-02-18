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

  const getStressColor = (level) => {
    if (level <= 3) return 'text-success';
    if (level <= 6) return 'text-warning';
    return 'text-error';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-base-content">Stress Tracking</h1>

        {/* Log Stress Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl">Log Your Stress Level</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Stress Level: {stressLevel}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  className="range range-warning"
                />
                <div className="w-full flex justify-between text-xs px-2">
                  <span>Low</span>
                  <span>5</span>
                  <span>High</span>
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Notes (Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="textarea textarea-bordered"
                  rows="3"
                  placeholder="How are you feeling today?"
                />
              </div>
              <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary">
                  Log Stress Level
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
            <div className="stat">
              <div className="stat-title">Average Stress</div>
              <div className="stat-value text-primary">{statistics.average.toFixed(1)}/10</div>
            </div>
            <div className="stat">
              <div className="stat-title">Recent Stress</div>
              <div className="stat-value text-warning">{statistics.recent}/10</div>
            </div>
            <div className="stat">
              <div className="stat-title">High Stress Days</div>
              <div className="stat-value text-error">{statistics.highStressDays}</div>
            </div>
          </div>
        )}

        {/* Stress Trend Chart */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl">Stress Trend (Last 30 Days)</h2>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
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
              <p className="text-base-content/70 text-center py-12">No stress data available yet</p>
            )}
          </div>
        </div>

        {/* Recent History */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl">Recent History</h2>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.slice(0, 10).map((log) => (
                  <div key={log._id} className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                    <div>
                      <div className="font-semibold text-base-content">
                        {format(new Date(log.date), 'MMM dd, yyyy')}
                      </div>
                      {log.notes && (
                        <div className="text-sm text-base-content/70">{log.notes}</div>
                      )}
                    </div>
                    <div className={`text-3xl font-bold ${getStressColor(log.stressLevel)}`}>
                      {log.stressLevel}/10
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/70">No stress history available</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StressTracking;
