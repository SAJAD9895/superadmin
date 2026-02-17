
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Search, Users, Phone } from 'lucide-react';

const Leads = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [leadsData, setLeadsData] = useState([]); // Store original data
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadLeads();
    }, [user]);

    const loadLeads = async () => {
        try {
            const { data: company } = await supabase
                .from('companies')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!company) return;

            const { data, error } = await supabase
                .from('company_leads')
                .select(`
          *,
          master_products (name)
        `)
                .eq('company_id', company.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeadsData(data || []);
            setLeads(data || []);
        } catch (error) {
            console.error('Error loading leads:', error);
        } finally {
            setLoading(false);
        }
    };

    // Derived state for filtering
    const filteredLeads = leadsData.filter(lead =>
        (lead.customer_name?.toLowerCase() || '').includes(filter.toLowerCase()) ||
        (lead.customer_email?.toLowerCase() || '').includes(filter.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center p-8 h-screen"><div className="spinner" /></div>;

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="h2 flex items-center gap-2 mb-2">Leads</h1>
                    <p className="text-muted">Track and manage potential customer inquiries</p>
                </div>
            </div>

            <div className="card mb-8">
                <div className="input-group mb-0">
                    <div style={{ position: 'relative' }}>
                        <Search size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            className="input"
                            style={{ paddingLeft: '40px' }}
                            placeholder="Search leads by name or email..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Contact Info</th>
                            <th>Product Interest</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-12 text-muted">
                                    {filter ? 'No leads found matching your search.' : 'No leads found.'}
                                </td>
                            </tr>
                        ) : (
                            filteredLeads.map((lead) => (
                                <tr key={lead.id}>
                                    <td className="text-sm text-muted" style={{ whiteSpace: 'nowrap' }}>
                                        <div>{new Date(lead.created_at).toLocaleDateString()}</div>
                                        <div className="text-xs">{new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td>
                                        <div className="font-medium text-main">{lead.customer_name}</div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col gap-1">
                                            {lead.customer_email && (
                                                <a href={`mailto:${lead.customer_email}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                                                    <Mail size={14} /> {lead.customer_email}
                                                </a>
                                            )}
                                            {lead.customer_phone && (
                                                <span className="text-sm text-muted flex items-center gap-1">
                                                    <Phone size={14} /> {lead.customer_phone}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-blue">
                                            {lead.master_products?.name || 'General Inquiry'}
                                        </span>
                                    </td>
                                    <td className="text-sm text-muted" style={{ maxWidth: '300px' }}>
                                        {lead.message}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leads;
