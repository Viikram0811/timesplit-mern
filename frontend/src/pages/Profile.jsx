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
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-base-content">Profile Settings</h1>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Academic Goals</span>
                </label>
                <textarea
                  value={formData.academicGoals}
                  onChange={(e) => setFormData({ ...formData, academicGoals: e.target.value })}
                  className="textarea textarea-bordered w-full"
                  rows="4"
                  placeholder="Describe your academic goals..."
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Available Study Hours Per Day: {formData.availableHoursPerDay} hours
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={formData.availableHoursPerDay}
                  onChange={(e) => setFormData({ ...formData, availableHoursPerDay: parseInt(e.target.value) })}
                  className="range range-primary"
                />
                <div className="w-full flex justify-between text-xs px-2">
                  <span>1</span>
                  <span>12</span>
                  <span>24</span>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Preferred Time Slots</span>
                </label>
                <div className="space-y-3">
                  {formData.preferredTimeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-base-200 rounded-lg">
                      <span className="flex-1 font-medium">
                        {slot.start} - {slot.end}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeSlot(index)}
                        className="btn btn-sm btn-error"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={newSlot.start}
                      onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                      className="input input-bordered flex-1"
                      placeholder="Start time"
                    />
                    <input
                      type="time"
                      value={newSlot.end}
                      onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                      className="input input-bordered flex-1"
                      placeholder="End time"
                    />
                    <button
                      type="button"
                      onClick={handleAddTimeSlot}
                      className="btn btn-primary"
                    >
                      Add Slot
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary w-full">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
