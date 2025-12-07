import React, { useState } from "react";
import {
  X,
  Activity,
  Phone,
  UserPlus,
  Trash2,
  Globe,
  Bell,
  MapPin,
  Check,
} from "lucide-react";
import GlassCard from "./GlassCard";

interface SettingsModalProps {
  onClose: () => void;
  onTestCrash: () => void;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onTestCrash,
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "emergency">(
    "general"
  );
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: "1", name: "Emergency Services", phone: "119", relation: "Police" },
    { id: "2", name: "Ambulance", phone: "110", relation: "Medical" },
  ]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    relation: "",
  });
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("en");

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      setContacts([...contacts, { ...newContact, id: Date.now().toString() }]);
      setNewContact({ name: "", phone: "", relation: "" });
      setShowAddContact(false);
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
    if (navigator.vibrate) navigator.vibrate(100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-slate-900/95 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 px-6 pt-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-3 px-2 font-semibold transition-colors relative ${
              activeTab === "general"
                ? "text-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            General
            {activeTab === "general" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("emergency")}
            className={`pb-3 px-2 font-semibold transition-colors relative ${
              activeTab === "emergency"
                ? "text-red-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Emergency Settings
            {activeTab === "emergency" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "general" && (
            <>
              {/* Language Selection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { code: "en", label: "English", flag: "🇬🇧" },
                    { code: "si", label: "සිංහල", flag: "🇱🇰" },
                    { code: "ta", label: "தமிழ்", flag: "🇱🇰" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-3 rounded-xl border transition-all ${
                        language === lang.code
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-2xl mb-1">{lang.flag}</div>
                      <div className="text-sm font-medium">{lang.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Permissions
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">
                          GPS Location
                        </div>
                        <div className="text-xs text-gray-400">
                          Track accident location
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setGpsEnabled(!gpsEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        gpsEnabled ? "bg-green-500" : "bg-gray-600"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          gpsEnabled ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-yellow-400" />
                      <div>
                        <div className="text-white font-medium">
                          Notifications
                        </div>
                        <div className="text-xs text-gray-400">
                          Emergency alerts
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setNotificationsEnabled(!notificationsEnabled)
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notificationsEnabled ? "bg-green-500" : "bg-gray-600"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          notificationsEnabled
                            ? "translate-x-6"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Diagnostics */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Diagnostics
                </h3>
                <button
                  onClick={() => {
                    onTestCrash();
                    onClose();
                  }}
                  className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 font-bold flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all"
                >
                  <Activity className="w-5 h-5" />
                  Test Crash Sensor (Simulation)
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Triggers the Red Alert sequence without contacting authorities
                </p>
              </div>
            </>
          )}

          {activeTab === "emergency" && (
            <>
              {/* Emergency Contacts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Emergency Contacts
                  </h3>
                  <button
                    onClick={() => setShowAddContact(!showAddContact)}
                    className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-blue-400" />
                  </button>
                </div>

                {/* Add Contact Form */}
                {showAddContact && (
                  <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newContact.name}
                      onChange={(e) =>
                        setNewContact({ ...newContact, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (e.g., +94771234567)"
                      value={newContact.phone}
                      onChange={(e) =>
                        setNewContact({ ...newContact, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Relation (e.g., Family, Friend)"
                      value={newContact.relation}
                      onChange={(e) =>
                        setNewContact({
                          ...newContact,
                          relation: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      onClick={addContact}
                      className="w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Add Contact
                    </button>
                  </div>
                )}

                {/* Contacts List */}
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">
                            {contact.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {contact.phone}
                          </div>
                          {contact.relation && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {contact.relation}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteContact(contact.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>

                {contacts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Phone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No emergency contacts added yet</p>
                  </div>
                )}
              </div>

              {/* Emergency Info */}
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-sm text-yellow-300">
                  <strong>Important:</strong> These contacts will be
                  automatically notified when you activate Emergency SOS mode.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default SettingsModal;
