import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import CustomAlert from '../components/CustomAlert';
import { getSubjects } from '../services/api';
import api from '../services/api';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '' });
    const [formData, setFormData] = useState({
        label: '',
        credit: '',
        semester: '',
        department: '',
        batch: '',
        regulation: '21'
    });
    const [editingId, setEditingId] = useState(null);
    const [filters, setFilters] = useState({
        semester: '',
        department: '',
        batch: '',
        regulation: ''
    });

    // Check authentication on mount
    useEffect(() => {
        if (sessionStorage.getItem('adminAuthenticated') !== 'true') {
            navigate('/admin/login');
        }
    }, [navigate]);

    const filteredSubjects = subjects.filter(subject => {
        return (
            (filters.semester === '' || subject.semester === filters.semester) &&
            (filters.department === '' || subject.department === filters.department) &&
            (filters.batch === '' || subject.batch === filters.batch) &&
            (filters.regulation === '' || subject.regulation.toString() === filters.regulation)
        );
    });

    const clearFilters = () => {
        setFilters({ semester: '', department: '', batch: '', regulation: '' });
    };

    const showAlert = (message) => {
        setAlert({ show: true, message });
    };

    const hideAlert = () => {
        setAlert({ show: false, message: '' });
    };

    const departments = ['CSE', 'AIDS', 'AIML', 'ECE', 'EEE', 'IT', 'CYBER', 'VLSI', 'FT', 'BT', 'MECH', 'AGRI', 'CIVIL', 'BME'];
    const semesters = ['Sem-1', 'Sem-2', 'Sem-3', 'Sem-4', 'Sem-5', 'Sem-6', 'Sem-7', 'Sem-8'];
    const batches = ['2023-2027', '2024-2028', '2025-2029', '2026-2030', '2027-2031', '2028-2032'];
    const regulations = [21, 25, 29, 33];

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/subjects');
            setSubjects(response.data);
        } catch (error) {
            showAlert('Failed to load subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.label || formData.credit === '' || !formData.semester || !formData.department || !formData.batch || !formData.regulation) {
            showAlert('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/api/subjects/${editingId}`, {
                    ...formData,
                    credit: parseFloat(formData.credit),
                    regulation: parseInt(formData.regulation)
                });
                showAlert('Subject updated successfully');
                setEditingId(null);
            } else {
                await api.post('/api/subjects', {
                    ...formData,
                    credit: parseFloat(formData.credit),
                    regulation: parseInt(formData.regulation)
                });
                showAlert('Subject added successfully');
            }

            setFormData({ label: '', credit: '', semester: '', department: '', batch: '', regulation: '21' });
            loadSubjects();
        } catch (error) {
            showAlert(error.response?.data?.message || 'Error saving subject');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (subject) => {
        setFormData({
            label: subject.label,
            credit: subject.credit.toString(),
            semester: subject.semester,
            department: subject.department,
            batch: subject.batch,
            regulation: subject.regulation.toString()
        });
        setEditingId(subject._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;

        setLoading(true);
        try {
            await api.delete(`/api/subjects/${id}`);
            showAlert('Subject deleted successfully');
            loadSubjects();
        } catch (error) {
            showAlert('Error deleting subject');
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ label: '', credit: '', semester: '', department: '', batch: '', regulation: '21' });
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuthenticated');
        navigate('/admin/login');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f7f6' }}>
            <Header />
            <Loader show={loading} />
            <CustomAlert message={alert.message} show={alert.show} onClose={hideAlert} />

            <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 15px', width: '100%' }}>

                {/* Dashboard Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #04AA6D 0%, #028a55 100%)',
                    color: 'white',
                    padding: '25px',
                    borderRadius: '15px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    marginBottom: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        Logout
                    </button>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Admin Dashboard</h1>
                    <p style={{ margin: '8px 0 0', opacity: 0.9 }}>Manage Subjects, Credits & Regulations</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    {/* Management Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        padding: '30px',
                        border: '1px solid #eef2f1'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: '#333', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ background: '#e8f5e9', color: '#04AA6D', padding: '8px', borderRadius: '50%' }}>📝</span>
                                {editingId ? 'Edit Subject Details' : 'Add New Subject'}
                            </h3>
                            {editingId && (
                                <button onClick={cancelEdit} style={{ background: '#ffebee', color: '#c62828', border: 'none', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Cancel &times;
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '14px' }}>Subject Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Data Structures"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', background: '#FFFFFF', border: '2px solid #e0e0e0', fontSize: '14px', transition: 'all 0.3s', outline: 'none', color: '#333' }}
                                    onFocus={(e) => e.target.style.borderColor = '#04AA6D'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '14px' }}>Credits</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    placeholder="e.g. 3.0"
                                    value={formData.credit}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                            setFormData({ ...formData, credit: val });
                                        }
                                    }}
                                    style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', background: '#FFFFFF', border: '2px solid #e0e0e0', fontSize: '14px', transition: 'all 0.3s', outline: 'none', color: '#333' }}
                                    onFocus={(e) => e.target.style.borderColor = '#04AA6D'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '14px' }}>Semester</label>
                                <select
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '14px', backgroundColor: '#fff', cursor: 'pointer' }}
                                >
                                    <option value="">Select Semester</option>
                                    {semesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '14px' }}>Department</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '14px', backgroundColor: '#fff', cursor: 'pointer' }}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '14px' }}>Batch</label>
                                <select
                                    value={formData.batch}
                                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                    style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '14px', backgroundColor: '#fff', cursor: 'pointer' }}
                                >
                                    <option value="">Select Batch</option>
                                    {batches.map(batch => <option key={batch} value={batch}>{batch}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '14px' }}>Regulation</label>
                                <select
                                    value={formData.regulation}
                                    onChange={(e) => setFormData({ ...formData, regulation: e.target.value })}
                                    style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '14px', backgroundColor: '#fff', cursor: 'pointer' }}
                                >
                                    {regulations.map(reg => <option key={reg} value={reg}>20{reg} Regulation</option>)}
                                </select>
                            </div>

                            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                                <button type="submit" className="button1" style={{ width: '100%', padding: '14px', fontSize: '16px', background: 'linear-gradient(135deg, #04AA6D 0%, #038a58 100%)', color: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 15px rgba(4, 170, 109, 0.3)', cursor: 'pointer', transition: 'transform 0.2s' }}
                                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                    {editingId ? 'Update Subject Record' : 'Add Subject to Database'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Filter Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        padding: '25px',
                        border: '1px solid #eef2f1'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#333', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ background: '#fff3e0', color: '#ef6c00', padding: '6px', borderRadius: '50%' }}>🔍</span>
                                Filter Database
                            </h3>
                            <button onClick={clearFilters} style={{ background: 'transparent', border: '1px solid #ddd', padding: '6px 12px', borderRadius: '15px', color: '#666', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                                Clear Filters
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            <select
                                value={filters.semester}
                                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px', outline: 'none' }}
                            >
                                <option value="">All Semesters</option>
                                {semesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                            </select>

                            <select
                                value={filters.department}
                                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px', outline: 'none' }}
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>

                            <select
                                value={filters.batch}
                                onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px', outline: 'none' }}
                            >
                                <option value="">All Batches</option>
                                {batches.map(batch => <option key={batch} value={batch}>{batch}</option>)}
                            </select>

                            <select
                                value={filters.regulation}
                                onChange={(e) => setFilters({ ...filters, regulation: e.target.value })}
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px', outline: 'none' }}
                            >
                                <option value="">All Regulations</option>
                                {regulations.map(reg => <option key={reg} value={reg.toString()}>{reg} Regulation</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        padding: '30px',
                        border: '1px solid #eef2f1',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ margin: 0, color: '#333', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '8px', borderRadius: '50%' }}>📚</span>
                                Subject Database <span style={{ fontSize: '12px', background: '#f5f5f5', padding: '4px 12px', borderRadius: '15px', color: '#666' }}>{filteredSubjects.length} Found</span>
                            </h3>
                        </div>

                        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #eee' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead style={{ background: '#f8f9fa' }}>
                                    <tr>
                                        <th style={{ padding: '15px', textAlign: 'left', color: '#555', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject Name</th>
                                        <th style={{ padding: '15px', textAlign: 'center', color: '#555', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Credits</th>
                                        <th style={{ padding: '15px', textAlign: 'center', color: '#555', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Sem</th>
                                        <th style={{ padding: '15px', textAlign: 'center', color: '#555', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Dept</th>
                                        <th style={{ padding: '15px', textAlign: 'center', color: '#555', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Batch</th>
                                        <th style={{ padding: '15px', textAlign: 'center', color: '#555', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubjects.length > 0 ? (
                                        filteredSubjects.map((subject, index) => (
                                            <tr key={subject._id} style={{ borderTop: '1px solid #eee', background: index % 2 === 0 ? 'white' : '#fcfcfc', transition: 'background 0.2s' }} className="table-row">
                                                <td style={{ padding: '15px', fontWeight: '600', color: '#333' }}>{subject.label}</td>
                                                <td style={{ padding: '15px', textAlign: 'center', color: '#666' }}>{subject.credit}</td>
                                                <td style={{ padding: '15px', textAlign: 'center' }}><span style={{ background: '#e3f2fd', color: '#1565c0', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>{subject.semester}</span></td>
                                                <td style={{ padding: '15px', textAlign: 'center', fontWeight: '500' }}>{subject.department}</td>
                                                <td style={{ padding: '15px', textAlign: 'center', color: '#666', fontSize: '13px' }}>{subject.batch}</td>
                                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button onClick={() => handleEdit(subject)} style={{ background: '#fff3e0', color: '#ef6c00', border: '1px solid #ffe0b2', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }} title="Edit">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDelete(subject._id)} style={{ background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }} title="Delete">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                                No subjects found. Start adding some!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AdminPanel;
