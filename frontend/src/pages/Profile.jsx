import { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';
import userService from '../services/userService';
import toast from 'react-hot-toast';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    academicGoals: '',
    availableHoursPerDay: 8,
    preferredTimeSlots: []
  });
  const [newSlot, setNewSlot] = useState({ start: '', end: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();
      setProfile(response.user);
      setFormData({
        name: response.user.name,
        academicGoals: response.user.academicGoals || '',
        availableHoursPerDay: response.user.availableHoursPerDay || 8,
        preferredTimeSlots: response.user.preferredTimeSlots || []
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(formData);
      toast.success('Profile updated successfully');
      loadProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddTimeSlot = () => {
    if (newSlot.start && newSlot.end) {
      setFormData({
        ...formData,
        preferredTimeSlots: [...formData.preferredTimeSlots, { ...newSlot }]
      });
      setNewSlot({ start: '', end: '' });
    }
  };

  const handleRemoveTimeSlot = (index) => {
    setFormData({
      ...formData,
      preferredTimeSlots: formData.preferredTimeSlots.filter((_, i) => i !== index)
    });
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

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Goals</label>
              <textarea
                value={formData.academicGoals}
                onChange={(e) => setFormData({ ...formData, academicGoals: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="4"
                placeholder="Describe your academic goals..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Study Hours Per Day: {formData.availableHoursPerDay} hours
              </label>
              <input
                type="range"
                min="1"
                max="24"
                value={formData.availableHoursPerDay}
                onChange={(e) => setFormData({ ...formData, availableHoursPerDay: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time Slots</label>
              <div className="space-y-3">
                {formData.preferredTimeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1">
                      {slot.start} - {slot.end}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTimeSlot(index)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <input
                    type="time"
                    value={newSlot.start}
                    onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Start time"
                  />
                  <input
                    type="time"
                    value={newSlot.end}
                    onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="End time"
                  />
                  <button
                    type="button"
                    onClick={handleAddTimeSlot}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add Slot
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save Profile
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
