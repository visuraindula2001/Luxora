import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiEdit, FiUsers, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [updatingRole, setUpdatingRole] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        fetchUsers();
    }, [page, limit]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('luxora_token');
            const { data } = await axios.get(
                `/api/users?page=${page}&limit=${limit}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(data.users);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            setUpdatingRole(userId);
            const token = localStorage.getItem('luxora_token');
            await axios.put(
                `/api/users/${userId}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers();
            setSelectedUser(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update role');
        } finally {
            setUpdatingRole(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const token = localStorage.getItem('luxora_token');
            await axios.delete(
                `/api/users/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers();
            setSelectedUser(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) return <div className="admin-page-loading">Loading users...</div>;

    return (
        <div className="user-management-page">
            <div className="user-management-header">
                <div className="header-content">
                    <h1><FiUsers /> Users Management</h1>
                    <p>Manage user accounts and roles</p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="user-management-container">
                {users.length === 0 ? (
                    <div className="empty-state">
                        <FiUsers size={48} />
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="users-table-responsive">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Verified</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} className={selectedUser?._id === user._id ? 'selected' : ''}>
                                        <td>{user.name}</td>
                                        <td className="email-cell">{user.email}</td>
                                        <td>
                                            <span className={`role-badge role-${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            {user.isVerified ? (
                                                <FiCheckCircle className="verified" />
                                            ) : (
                                                <FiXCircle className="not-verified" />
                                            )}
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="actions-cell">
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => setSelectedUser(user)}
                                                title="Edit"
                                            >
                                                <FiEdit />
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDeleteUser(user._id)}
                                                title="Delete"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Edit Modal */}
                {selectedUser && (
                    <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Edit User</h2>
                                <button
                                    className="modal-close"
                                    onClick={() => setSelectedUser(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="user-detail">
                                    <label>Name</label>
                                    <p>{selectedUser.name}</p>
                                </div>
                                <div className="user-detail">
                                    <label>Email</label>
                                    <p>{selectedUser.email}</p>
                                </div>
                                <div className="user-detail">
                                    <label>Current Role</label>
                                    <p className="current-role">{selectedUser.role}</p>
                                </div>
                                <div className="role-selector">
                                    <label>Change Role To</label>
                                    <div className="role-options">
                                        {['user', 'admin'].map((role) => (
                                            <button
                                                key={role}
                                                className={`role-option ${selectedUser.role === role ? 'active' : ''}`}
                                                onClick={() => handleUpdateRole(selectedUser._id, role)}
                                                disabled={updatingRole === selectedUser._id}
                                            >
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedUser(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;