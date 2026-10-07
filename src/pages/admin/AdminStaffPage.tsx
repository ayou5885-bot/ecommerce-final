import { useState } from 'react';
import { useStaff } from '@/hooks/useStaff';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import type { Staff, StaffRole } from '@/types';
import { UserPlus, Trash2, X } from 'lucide-react';

export function AdminStaffPage() {
  const { staff, refetch } = useStaff();
  const { session } = useAuth();
  const { t } = useI18n();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<StaffRole>('staff');
  const [inviteName, setInviteName] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleInvite = async () => {
    setInviting(true);
    setError('');
    setMessage('');

    // Create auth user via admin invite (requires service role, but we try signup approach)
    // Since we can't use service role client-side, we use signUp with email
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: inviteEmail,
      password: `Temp${Date.now()}!${Math.random().toString(36).slice(2, 8)}`,
      options: { data: { display_name: inviteName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setInviting(false);
      return;
    }

    if (signUpData.user) {
      // Insert staff row — the RLS policy requires is_admin() for the current user
      const { error: insertError } = await supabase.from('staff').insert({
        id: signUpData.user.id,
        email: inviteEmail,
        display_name: inviteName || null,
        role: inviteRole,
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        setMessage(`Invitation sent to ${inviteEmail}`);
        setInviteEmail('');
        setInviteName('');
        refetch();
        setShowInvite(false);
      }
    }
    setInviting(false);
  };

  const handleRoleChange = async (s: Staff, newRole: StaffRole) => {
    await supabase.from('staff').update({ role: newRole }).eq('id', s.id);
    refetch();
  };

  const handleRemove = async (s: Staff) => {
    if (!confirm(t('confirmDelete'))) return;
    // Remove staff row — this cascades to auth.users via FK
    await supabase.from('staff').delete().eq('id', s.id);
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('staff')}</h1>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
          <UserPlus size={16} /> {t('inviteByEmail')}
        </button>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 text-sm">{error}</div>}
      {message && <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 text-sm">{message}</div>}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800/50">
        {staff.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
                {(s.display_name ?? s.email)[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{s.display_name ?? s.email}</p>
                <p className="text-xs text-gray-500 truncate">{s.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {s.id !== session?.user.id && (
                <select
                  value={s.role}
                  onChange={(e) => handleRoleChange(s, e.target.value as StaffRole)}
                  className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-semibold outline-none"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              )}
              {s.id !== session?.user.id && (
                <button onClick={() => handleRemove(s)} className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label={t('remove')}>
                  <Trash2 size={16} />
                </button>
              )}
              {s.id === session?.user.id && (
                <span className="text-xs text-gray-400 px-2">You</span>
              )}
            </div>
          </div>
        ))}
        {staff.length === 0 && <p className="p-8 text-center text-gray-500">No staff members</p>}
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t('inviteByEmail')}</h2>
              <button onClick={() => setShowInvite(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">{t('email')} *</label><input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium mb-1">{t('displayName')}</label><input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium mb-1">{t('role')}</label><select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as StaffRole)} className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-blue-500"><option value="staff">Staff</option><option value="admin">Admin</option></select></div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium">{t('cancel')}</button>
              <button onClick={handleInvite} disabled={inviting} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium">{inviting ? '...' : t('invite')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
