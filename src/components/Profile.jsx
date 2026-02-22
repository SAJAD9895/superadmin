
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Upload, MapPin, Globe, Phone, Mail, Building, Image as ImageIcon } from 'lucide-react';
import SupportModal from './SupportModal';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [company, setCompany] = useState({
        company_name: '',
        company_description: '',
        year_established: '',
        company_type: '',
        country: '',
        city: '',
        complete_address: '',
        google_map_location: '',
        phone: '',
        whatsapp_mobile: '',
        contact_email: '',
        website: '',
        main_category: '',
        sub_category: '',
        listing_type: 'Regular',
        logo_url: '',
        cover_image_url: ''
    });
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [supportModalType, setSupportModalType] = useState(null);

    useEffect(() => {
        if (!user) return;
        fetchCompany();
    }, [user]);

    const fetchCompany = async () => {
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            if (data) setCompany(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error('Error loading company:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCompany(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if image already exists - if so, show support modal
        const existingUrl = type === 'logo' ? company.logo_url : company.cover_image_url;
        if (existingUrl) {
            setSupportModalType(type);
            setShowSupportModal(true);
            e.target.value = ''; // Reset file input
            return;
        }

        try {
            setSaving(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${type}.${fileExt}`;

            // Use correct bucket names: 'company_logo' or 'cover_images'
            const bucketName = type === 'logo' ? 'company_logo' : 'cover_images';

            let { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            setCompany(prev => ({
                ...prev,
                [type === 'logo' ? 'logo_url' : 'cover_image_url']: publicUrl
            }));

        } catch (error) {
            // Ignore 413 errors as they are handled by the global interceptor
            if (error.statusCode === 413 || error.status === 413) {
                console.warn('Upload failed (handled globally): Payload too large');
            } else {
                alert('Error uploading image: ' + error.message);
                console.error(error);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('companies')
                .upsert({ ...company, user_id: user.id });

            if (error) throw error;
            alert('Company profile updated!');
        } catch (error) {
            console.error('Error updating company:', error);
            alert('Error updating profile!');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="spinner" /></div>;

    return (
        <form onSubmit={handleSubmit} className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="h2 mb-2">Company Profile</h1>
                    <p className="text-muted">Manage your public business listing and details</p>
                </div>
                <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: 'white' }} /> : null}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Basic Info */}
                <section className="card flex flex-col gap-4">
                    <h3 className="h3 flex items-center gap-2 mb-2 text-lg text-primary"><Building size={20} /> Basic Details</h3>

                    <div className="input-group">
                        <label className="label">Company Name</label>
                        <input name="company_name" value={company.company_name} onChange={handleChange} className="input" placeholder="Acme Corp" required />
                    </div>

                    <div className="input-group">
                        <label className="label">Description</label>
                        <textarea name="company_description" value={company.company_description} onChange={handleChange} className="textarea" placeholder="Tell us about your business..." rows="4" style={{ minHeight: '120px' }} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="label">Year Est.</label>
                            <input type="date" name="year_established" value={company.year_established} onChange={handleChange} className="input" />
                        </div>
                        <div className="input-group">
                            <label className="label">Type</label>
                            <select name="company_type" value={company.company_type} onChange={handleChange} className="select">
                                <option value="">Select Type</option>
                                <option value="Manufacturer">Manufacturer</option>
                                <option value="Supplier">Supplier</option>
                                <option value="Contractor">Contractor</option>
                                <option value="Service Provider">Service Provider</option>
                                <option value="Trader">Trader</option>
                                <option value="Distributor">Distributor</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Location */}
                <section className="card flex flex-col gap-4">
                    <h3 className="h3 flex items-center gap-2 mb-2 text-lg text-primary"><MapPin size={20} /> Location</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="label">Country</label>
                            <input name="country" value={company.country} onChange={handleChange} className="input" />
                        </div>
                        <div className="input-group">
                            <label className="label">City</label>
                            <input name="city" value={company.city} onChange={handleChange} className="input" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Complete Address</label>
                        <textarea name="complete_address" value={company.complete_address} onChange={handleChange} className="input" style={{ minHeight: '80px', resize: 'vertical' }} />
                    </div>

                    <div className="input-group">
                        <label className="label">Google Map URL</label>
                        <input name="google_map_location" value={company.google_map_location} onChange={handleChange} className="input" placeholder="https://maps.google.com/..." />
                    </div>
                </section>

                {/* Contact */}
                <section className="card flex flex-col gap-4">
                    <h3 className="h3 flex items-center gap-2 mb-2 text-lg text-primary"><Phone size={20} /> Contact & Social</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="label">Phone</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input name="phone" value={company.phone} onChange={handleChange} className="input" style={{ paddingLeft: '40px' }} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="label">WhatsApp</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input name="whatsapp_mobile" value={company.whatsapp_mobile} onChange={handleChange} className="input" style={{ paddingLeft: '40px' }} />
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input type="email" name="contact_email" value={company.contact_email} onChange={handleChange} className="input" style={{ paddingLeft: '40px' }} />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Website</label>
                        <div style={{ position: 'relative' }}>
                            <Globe size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input name="website" value={company.website} onChange={handleChange} className="input" style={{ paddingLeft: '40px' }} />
                        </div>
                    </div>
                </section>

                {/* Branding */}
                <section className="card flex flex-col gap-4">
                    <h3 className="h3 flex items-center gap-2 mb-2 text-lg text-primary"><ImageIcon size={20} /> Branding</h3>

                    <div className="input-group">
                        <label className="label">Logo</label>
                        <div className="flex items-center gap-4 p-4 rounded" style={{ border: '1px dashed var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            {company.logo_url ? (
                                <div className="flex items-center justify-between w-full">
                                    <img src={company.logo_url} className="w-16 h-16 rounded object-cover border border-slate-700" alt="Logo" style={{ width: '64px', height: '64px' }} />
                                    <button
                                        type="button"
                                        onClick={() => { setSupportModalType('logo'); setShowSupportModal(true); }}
                                        style={{ color: 'var(--primary)', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        Update Logo
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="icon-bg icon-bg-primary" style={{ width: '64px', height: '64px' }}><ImageIcon /></div>
                                    <input type="file" onChange={(e) => handleFileUpload(e, 'logo')} className="text-sm" accept="image/*" />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Cover Image</label>
                        <div className="space-y-2 p-4 rounded" style={{ border: '1px dashed var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            {company.cover_image_url ? (
                                <div style={{ position: 'relative' }}>
                                    <img src={company.cover_image_url} alt="Cover" style={{ width: '100%', height: '128px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                                    <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                        <button
                                            type="button"
                                            onClick={() => { setSupportModalType('cover image'); setShowSupportModal(true); }}
                                            style={{
                                                background: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '20px',
                                                padding: '4px 12px',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.8)'}
                                            onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.6)'}
                                        >
                                            Update Cover
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ width: '100%', height: '128px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
                                        <span className="text-muted text-sm">No cover image</span>
                                    </div>
                                    <input type="file" onChange={(e) => handleFileUpload(e, 'cover')} className="text-sm mt-2" accept="image/*" />
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <SupportModal
                isOpen={showSupportModal}
                onClose={() => setShowSupportModal(false)}
                type={supportModalType}
            />
        </form>
    );
};

export default Profile;
