import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from '@tanstack/react-router';
import { db, auth } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'sonner';
import { User, Smartphone, Lock, Download, CreditCard, Save } from 'lucide-react';

export function SettingsPage() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // 1. Redirect if not logged in (Fixes 'user possibly null' errors)
  if (!user) {
      return <Navigate to="/login" />;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      // 1. Update Auth Profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { 
          displayName: formData.get('name') as string 
        });
      }

      // 2. Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        name: formData.get('name'),
        phone: formData.get('phone'),
        college: formData.get('college')
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success(`Reset link sent to ${user.email}`);
    } catch (e) {
      toast.error("Could not send reset link.");
    }
  };

  const handleDeviceReset = async () => {
    if (!confirm("Unlink your current device? You will be logged out.")) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { primaryDeviceID: null });
      toast.success("Device unlinked.");
    } catch (e) { toast.error("Failed to reset device."); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 font-handwritten">Account Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: PROFILE FORM */}
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-teal-600"/> Personal Details
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Full Name</label>
                  {/* FIX: Add fallback empty string */}
                  <input name="name" defaultValue={user.displayName || ''} className="w-full p-2 border rounded-lg font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">Phone</label>
                    <input name="phone" defaultValue={userProfile?.phone || ''} placeholder="+91..." className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-1">College</label>
                    <input name="college" defaultValue={userProfile?.college || ''} placeholder="IIT..." className="w-full p-2 border rounded-lg" />
                  </div>
                </div>
                <button disabled={loading} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 flex items-center gap-2">
                  <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </section>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-teal-600"/> Billing History
              </h2>
              {userProfile?.transactions?.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {userProfile.transactions.map((tx: any, i: number) => (
                        <tr key={i}>
                          <td className="p-3">{new Date(tx.date).toLocaleDateString()}</td>
                          <td className="p-3 font-bold">₹{tx.amount}</td>
                          <td className="p-3 text-green-600 font-bold uppercase">{tx.status}</td>
                          <td className="p-3">
                            <button className="text-blue-600 hover:underline flex items-center gap-1">
                              <Download size={14}/> PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">No payment history found.</p>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: SECURITY */}
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Lock size={20} className="text-teal-600"/> Security
              </h2>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Logged in as <strong>{user.email}</strong></p>
                <button onClick={handlePasswordReset} className="text-sm text-blue-600 font-bold hover:underline">
                  Change Password
                </button>
              </div>

              <hr className="my-4"/>

              <div>
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Smartphone size={16}/> Device Lock
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Your account is locked to: <br/>
                  <code className="bg-gray-100 p-1 rounded">{userProfile?.primaryDeviceID || "No device linked"}</code>
                </p>
                <button onClick={handleDeviceReset} className="w-full border border-red-200 text-red-600 bg-red-50 py-2 rounded-lg text-sm font-bold hover:bg-red-100">
                  Reset Device Lock
                </button>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}