import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";
import { Button } from "../../ui/ui/button";
import { SucessToast, ErrorToast, InfoToast } from "../../components/common/toast";
import { main_uri } from "../../service";

const SavedAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (authenticate) {
          const resp = await main_uri.get(`/api/v1/alerts`);
          setAlerts(resp.data?.data || []);
          return;
        }
      } catch (err) {
        // fallback to localStorage
      }
      try {
        const existing = JSON.parse(localStorage.getItem('savedAlerts') || '[]');
        setAlerts(existing);
      } catch (err) {
        setAlerts([]);
      }
    };
    load();
  }, []);

  const remove = (id) => {
    try {
      if (authenticate) {
        main_uri.delete(`/api/v1/alerts/${id}`).then(() => {
          const updated = alerts.filter(a => a.id !== id);
          setAlerts(updated);
          SucessToast({ message: 'Alert removed' });
        }).catch(() => ErrorToast({ message: 'Failed to remove' }));
        return;
      }

      const updated = alerts.filter(a => a.id !== id);
      localStorage.setItem('savedAlerts', JSON.stringify(updated));
      setAlerts(updated);
      SucessToast({ message: 'Alert removed' });
    } catch (err) {
      ErrorToast({ message: 'Failed to remove alert' });
    }
  };

  const clearAll = () => {
    if (!window.confirm('Clear all saved alerts?')) return;
    if (authenticate) {
      main_uri.delete(`/api/v1/alerts`).then(() => {
        setAlerts([]);
        InfoToast({ message: 'All alerts cleared' });
      }).catch(() => ErrorToast({ message: 'Failed to clear alerts' }));
      return;
    }

    localStorage.removeItem('savedAlerts');
    setAlerts([]);
    InfoToast({ message: 'All alerts cleared' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold">Saved Alerts</h1>
            <Button variant="outline" onClick={clearAll} className="text-sm">Clear All</Button>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">You have no saved alerts.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <p className="font-semibold">{a.name || 'Saved alert'}</p>
                    <p className="text-xs text-gray-500">ID: {a.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => window.location.assign(`/vehicles/public/${a.id}`)} className="text-sm" variant="outline">View</Button>
                    <Button onClick={() => remove(a.id)} className="text-sm">Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SavedAlerts;
