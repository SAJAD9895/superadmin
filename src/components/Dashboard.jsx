
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, ShoppingBag, Users as UsersIcon, Award, MessageSquare } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ products: 0, leads: 0 });
    const [company, setCompany] = useState(null);
    const [recentLeads, setRecentLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch company
                const { data: companyData } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                setCompany(companyData);

                if (companyData) {
                    // Fetch stats
                    const { count: productsCount } = await supabase
                        .from('products')
                        .select('*', { count: 'exact', head: true })
                        .eq('company_id', companyData.id);

                    const { count: leadsCount } = await supabase
                        .from('company_leads')
                        .select('*', { count: 'exact', head: true })
                        .eq('company_id', companyData.id);

                    setStats({ products: productsCount || 0, leads: leadsCount || 0 });

                    // Fetch recent leads
                    const { data: leads } = await supabase
                        .from('company_leads')
                        .select(`
              *,
              master_products (name)
            `)
                        .eq('company_id', companyData.id)
                        .order('created_at', { ascending: false })
                        .limit(5);

                    setRecentLeads(leads || []);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return <div className="flex items-center justify-center p-8 h-screen"><div className="spinner" /></div>;
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="h2 mb-2">Dashboard</h1>
                    <p className="text-muted">Welcome back, <span className="text-main font-medium">{company?.company_name || 'Business Owner'}</span></p>
                </div>
                {company?.listing_type && (
                    <span className={`badge ${company.listing_type === 'Power' ? 'badge-blue' : 'badge-yellow'}`}>
                        {company.listing_type} Plan
                    </span>
                )}
            </div>

            <div className="grid grid-cols-4 mb-8 gap-6">
                <div className="card animate-fade-in" style={{ animationDelay: '0.0s' }}>
                    <div className="flex items-center gap-4">
                        <div className="icon-bg icon-bg-primary">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted mb-1">Total Products</p>
                            <p className="h3">{stats.products}</p>
                        </div>
                    </div>
                </div>

                <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-4">
                        <div className="icon-bg icon-bg-success">
                            <UsersIcon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted mb-1">Total Leads</p>
                            <p className="h3">{stats.leads}</p>
                        </div>
                    </div>
                </div>

                {/* Placeholders for future metrics */}
                <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-4">
                        <div className="icon-bg" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
                            <Award size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted mb-1">Conversion Rate</p>
                            <p className="h3">--%</p>
                        </div>
                    </div>
                </div>

                <div className="card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center gap-4">
                        <div className="icon-bg" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted mb-1">Unread Messages</p>
                            <p className="h3">0</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="h3">Recent Leads</h3>
                    <button className="btn btn-secondary text-sm">View All</button>
                </div>

                {recentLeads.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Product Interest</th>
                                    <th>Message</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLeads.map((lead) => (
                                    <tr key={lead.id}>
                                        <td>
                                            <div className="font-medium text-main">{lead.customer_name}</div>
                                            <div className="text-xs text-muted">{lead.customer_email}</div>
                                        </td>
                                        <td>
                                            <span className="badge badge-blue">
                                                {lead?.master_products?.name || 'General Inquiry'}
                                            </span>
                                        </td>
                                        <td className="text-muted text-sm" style={{ maxWidth: '300px' }}>
                                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {lead.message}
                                            </div>
                                        </td>
                                        <td className="text-sm text-muted">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted border border-dashed border-slate-700 rounded-lg">
                        <p>No leads yet. Share your products to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
