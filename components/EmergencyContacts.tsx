import React, { useState } from "react";
import GlassCard from "./GlassCard";
import { Phone, UserPlus, Trash2, Bell } from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

interface EmergencyContactsProps {
  onNotify: (contacts: EmergencyContact[]) => void;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ onNotify }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: "1", name: "Home", phone: "+94771234567", relation: "Family" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    relation: "",
  });

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      setContacts([...contacts, { ...newContact, id: Date.now().toString() }]);
      setNewContact({ name: "", phone: "", relation: "" });
      setShowAdd(false);
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
    if (navigator.vibrate) navigator.vibrate(100);
  };

  const notifyAll = () => {
    // In real implementation, this would send SMS/notifications
    onNotify(contacts);

    // Show success feedback
    alert(
      `Emergency notifications sent to ${
        contacts.length
      } contact(s):\n${contacts
        .map((c) => `• ${c.name} (${c.phone})`)
        .join("\n")}`
    );

    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Phone className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-gray-400 text-sm uppercase tracking-wider">
            Emergency Contacts
          </h3>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
        >
          <UserPlus className="w-4 h-4 text-blue-400" />
        </button>
      </div>

      {/* Add Contact Form */}
      {showAdd && (
        <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={newContact.name}
            onChange={(e) =>
              setNewContact({ ...newContact, name: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <input
            type="tel"
            placeholder="Phone (+94XXXXXXXXX)"
            value={newContact.phone}
            onChange={(e) =>
              setNewContact({ ...newContact, phone: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Relation (e.g., Family, Friend)"
            value={newContact.relation}
            onChange={(e) =>
              setNewContact({ ...newContact, relation: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addContact}
            className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
          >
            Add Contact
          </button>
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-2 mb-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex-1">
              <div className="font-semibold text-white">{contact.name}</div>
              <div className="text-sm text-gray-400">{contact.phone}</div>
              {contact.relation && (
                <div className="text-xs text-gray-500">{contact.relation}</div>
              )}
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

      {contacts.length > 0 && (
        <button
          onClick={notifyAll}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold transition-all shadow-lg shadow-red-500/30"
        >
          <Bell className="w-5 h-5" />
          Notify All Contacts
        </button>
      )}
    </GlassCard>
  );
};

export default EmergencyContacts;
