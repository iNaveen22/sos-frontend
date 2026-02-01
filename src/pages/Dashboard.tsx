import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSOSAlert } from '../hooks/useSOSAlert';
import { AlertCircle, LogOut, Users, MapPin, Clock, XCircle, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { activeAlert, loading, triggerSOS, cancelSOS } = useSOSAlert();
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/signin');
  };

  const handleTriggerSOS = async () => {
    const { error } = await triggerSOS();
    if (error) {
      alert('Failed to trigger SOS: ' + error.message);
    } else {
      setShowNotesInput(false);
      setNotes('');
    }
  };

  const handleCancelSOS = async () => {
    if (!confirm('Are you sure you want to cancel the SOS alert? Only do this if you are safe.')) {
      return;
    }
    const { error } = await cancelSOS();
    if (error) {
      alert('Failed to cancel SOS: ' + error.message);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getMapUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const lat = activeAlert?.current_latitude ?? activeAlert?.initial_latitude;

  const lng = activeAlert?.current_longitude ?? activeAlert?.initial_longitude;


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SOS Alert</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/contacts')}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Users className="w-5 h-5" />
                <span className="hidden sm:inline">Contacts</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-600 mt-1">Stay safe and connected</p>
        </div>

        {activeAlert ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-2 border-red-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-3 rounded-full animate-pulse">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-600">SOS ALERT ACTIVE</h2>
                  <p className="text-gray-600">Your emergency contacts have been notified</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Triggered at</p>
                  <p className="font-semibold text-gray-900">{formatTime(activeAlert.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Current Location</p>
                    {activeAlert ? ( 
                       lat !== undefined && lng !== undefined ? (
                      <a
                        href={getMapUrl(lat, lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        View on Map
                      </a>
                    ) : (
                      <span className="text-gray-500">Location not available yet</span>
                      )
                    ) : null}
                </div>
              </div>
            </div>

            {activeAlert.notes && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Notes</p>
                <p className="text-gray-900">{activeAlert.notes}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-medium">
                Your location is being tracked and shared automatically. Stay safe!
              </p>
            </div>

            <button
              onClick={handleCancelSOS}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{loading ? 'Cancelling...' : "I'm Safe - Cancel SOS"}</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Safe</h2>
              <p className="text-gray-600">No active emergency alerts</p>
            </div>

            {showNotesInput && (
              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe your emergency..."
                />
              </div>
            )}

            <div className="space-y-3">
              {!showNotesInput ? (
                <>
                  <button
                    onClick={handleTriggerSOS}
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                  >
                    <AlertCircle className="w-6 h-6" />
                    <span>{loading ? 'Triggering SOS...' : 'TRIGGER SOS ALERT'}</span>
                  </button>
                  <button
                    onClick={() => setShowNotesInput(true)}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Add Emergency Notes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleTriggerSOS}
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                  >
                    <AlertCircle className="w-6 h-6" />
                    <span>{loading ? 'Triggering SOS...' : 'TRIGGER SOS ALERT'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowNotesInput(false);
                      setNotes('');
                    }}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </>
              )}
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Pressing the SOS button will immediately alert your emergency contacts and start tracking your location.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Emergency Contacts</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Manage your emergency contact list</p>
            <button
              onClick={() => navigate('/contacts')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Manage Contacts
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Location Tracking</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Real-time location sharing during emergencies</p>
            <div className="text-sm text-gray-500">
              {activeAlert ? (
                <span className="text-green-600 font-semibold">Active</span>
              ) : (
                <span>Inactive</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Alert Status</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">Current emergency alert status</p>
            <div className="text-sm">
              {activeAlert ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                  ACTIVE ALERT
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  ALL CLEAR
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
