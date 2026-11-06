'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

/* -------------------------------------------------------------------------- */
/*  Icon System (Extended for Admin)                                          */
/* -------------------------------------------------------------------------- */
function Icon({ name, size = 18, className = '', style = {} }) {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round',
    strokeLinejoin: 'round', className, style, 'aria-hidden': true,
  };
  switch (name) {
    case 'users': return <svg {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'wallet': return <svg {...props}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
    case 'trending-up': return <svg {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
    case 'trending-down': return <svg {...props}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>;
    case 'shield': return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case 'trash-2': return <svg {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
    case 'ban': return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>;
    case 'search': return <svg {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
    case 'loader-2': return <svg {...props} className={`jp-spin ${className}`}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
    case 'x': return <svg {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
    default: return null;
  }
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ members: 0, deposits: 0, wins: 0, losses: 0 });
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (curr) => {
      if (!curr) {
        router.push('/auth');
        return;
      }
      
      // Check if user is admin (You must manually set role: 'admin' in Firestore for your account)
      const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', curr.email)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        if (userData.role === 'admin') {
          setUser(curr);
          setIsAdmin(true);
          fetchData();
        } else {
          router.push('/dashboard'); // Redirect non-admins
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchData = async () => {
    try {
      // Fetch Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsersList(usersData);

      // Fetch Stats (Aggregated from users collection. Adjust if you have a dedicated 'transactions' collection)
      const totalDeposits = usersData.reduce((acc, curr) => acc + (curr.totalDeposited || 0), 0);
      const totalWins = usersData.reduce((acc, curr) => acc + (curr.totalWon || 0), 0);
      const totalLosses = usersData.reduce((acc, curr) => acc + (curr.totalLost || 0), 0);

      setStats({
        members: usersData.length,
        deposits: totalDeposits,
        wins: totalWins,
        losses: totalLosses,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  const handleBanUser = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus === 'banned' ? 'UNBAN' : 'BAN'} this user?`)) return;
    setActionLoading(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: currentStatus === 'banned' ? 'active' : 'banned'
      });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: currentStatus === 'banned' ? 'active' : 'banned' } : u));
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("WARNING: This will delete the user's Firestore data. (Note: Permanent Firebase Auth deletion requires Firebase Admin SDK). Continue?")) return;
    setActionLoading(userId);
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsersList(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="jp-admin-loading">
        <Icon name="loader-2" size={32} />
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="jp-admin-loading">
        <Icon name="shield" size={32} style={{ color: '#ef4444' }} />
        <p>Access Denied. Admin privileges required.</p>
      </div>
    );
  }

  const filteredUsers = usersList.filter(u => 
    (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.mpesaPhone || '').includes(searchTerm)
  );

  return (
    <div className="jp-admin-cockpit">
      {/* Header */}
      <header className="jp-admin-header">
        <div className="jp-admin-brand">
          <Icon name="shield" size={24} style={{ color: '#22c55e' }} />
          <span>JET<span style={{ color: '#22c55e' }}>PESA</span> ADMIN</span>
        </div>
        <button onClick={() => router.push('/dashboard')} className="jp-admin-back-btn">
          Back to Game
        </button>
      </header>

      <div className="jp-admin-content">
        {/* Stats Grid */}
        <div className="jp-stats-grid">
          <div className="jp-stat-card">
            <div className="jp-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Icon name="users" size={24} />
            </div>
            <div className="jp-stat-info">
              <span className="jp-stat-label">Total Members</span>
              <span className="jp-stat-value">{stats.members}</span>
            </div>
          </div>
          
          <div className="jp-stat-card">
            <div className="jp-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
              <Icon name="wallet" size={24} />
            </div>
            <div className="jp-stat-info">
              <span className="jp-stat-label">Total Deposits</span>
              <span className="jp-stat-value">KES {stats.deposits.toLocaleString()}</span>
            </div>
          </div>

          <div className="jp-stat-card">
            <div className="jp-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
              <Icon name="trending-up" size={24} />
            </div>
            <div className="jp-stat-info">
              <span className="jp-stat-label">Total Wins</span>
              <span className="jp-stat-value">KES {stats.wins.toLocaleString()}</span>
            </div>
          </div>

          <div className="jp-stat-card">
            <div className="jp-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <Icon name="trending-down" size={24} />
            </div>
            <div className="jp-stat-info">
              <span className="jp-stat-label">Total Losses</span>
              <span className="jp-stat-value">KES {stats.losses.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Members Management */}
        <div className="jp-members-panel">
          <div className="jp-panel-header">
            <h2>Members Management</h2>
            <div className="jp-search-box">
              <Icon name="search" size={16} />
              <input 
                type="text" 
                placeholder="Search by name, email, or phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="jp-table-container">
            <table className="jp-admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="jp-empty-table">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="jp-user-cell">
                          <span className="jp-user-name">{u.displayName || 'Unnamed'}</span>
                          <span className="jp-user-email">{u.email}</span>
                        </div>
                      </td>
                      <td>{u.mpesaPhone || 'N/A'}</td>
                      <td style={{ fontWeight: 'bold', color: '#22c55e' }}>KES {u.walletBalance?.toFixed(2) || '0.00'}</td>
                      <td>
                        <span className={`jp-status-badge ${u.status === 'banned' ? 'jp-banned' : 'jp-active'}`}>
                          {u.status === 'banned' ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <div className="jp-action-btns">
                          <button 
                            className={`jp-action-btn jp-ban-btn ${u.status === 'banned' ? 'jp-unban' : ''}`}
                            onClick={() => handleBanUser(u.id, u.status)}
                            disabled={actionLoading === u.id}
                            title={u.status === 'banned' ? 'Unban User' : 'Ban User'}
                          >
                            {actionLoading === u.id ? <Icon name="loader-2" size={16} /> : <Icon name="ban" size={16} />}
                          </button>
                          <button 
                            className="jp-action-btn jp-delete-btn"
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={actionLoading === u.id}
                            title="Delete User Data"
                          >
                            {actionLoading === u.id ? <Icon name="loader-2" size={16} /> : <Icon name="trash-2" size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .jp-admin-cockpit { background: #020617; color: #f8fafc; min-height: 100vh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .jp-admin-loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; background: #020617; color: #94a3b8; font-weight: 700; }
        .jp-admin-header { background: rgba(15, 23, 42, 0.9); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; backdrop-filter: blur(12px); }
        .jp-admin-brand { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 900; letter-spacing: -0.5px; }
        .jp-admin-back-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px; }
        .jp-admin-back-btn:hover { background: rgba(255,255,255,0.1); }
        .jp-admin-content { padding: 24px; max-width: 1400px; margin: 0 auto; }
        .jp-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .jp-stat-card { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; }
        .jp-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .jp-stat-info { display: flex; flex-direction: column; }
        .jp-stat-label { color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .jp-stat-value { color: #fff; font-size: 22px; font-weight: 900; margin-top: 4px; }
        .jp-members-panel { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; }
        .jp-panel-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .jp-panel-header h2 { margin: 0; font-size: 18px; font-weight: 800; }
        .jp-search-box { display: flex; align-items: center; gap: 8px; background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 8px 12px; width: 300px; }
        .jp-search-box input { background: transparent; border: none; color: #fff; font-size: 13px; width: 100%; outline: none; }
        .jp-search-box input::placeholder { color: #475569; }
        .jp-table-container { overflow-x: auto; }
        .jp-admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .jp-admin-table th { text-align: left; padding: 14px 20px; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 11px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .jp-admin-table td { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
        .jp-admin-table tbody tr:hover { background: rgba(255,255,255,0.02); }
        .jp-user-cell { display: flex; flex-direction: column; gap: 2px; }
        .jp-user-name { font-weight: 700; color: #fff; }
        .jp-user-email { font-size: 11px; color: #64748b; }
        .jp-status-badge { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
        .jp-status-badge.jp-active { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
        .jp-status-badge.jp-banned { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .jp-action-btns { display: flex; gap: 8px; }
        .jp-action-btn { width: 32px; height: 32px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .jp-ban-btn { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .jp-ban-btn:hover { background: rgba(239, 68, 68, 0.2); }
        .jp-ban-btn.jp-unban { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .jp-ban-btn.jp-unban:hover { background: rgba(34, 197, 94, 0.2); }
        .jp-delete-btn { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }
        .jp-delete-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .jp-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .jp-empty-table { text-align: center; padding: 40px !important; color: #64748b; font-weight: 700; }
        .jp-spin { animation: jpSpin 1s linear infinite; }
        @keyframes jpSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .jp-panel-header { flex-direction: column; align-items: stretch; }
          .jp-search-box { width: 100%; }
          .jp-stats-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .jp-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
