
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Search, Package, X, AlertCircle, Mail, CheckCircle } from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────────────── */
const normalize = (str) => str.replace(/\s+/g, '').toUpperCase();

/* ─── Support Modal (product limit) ──────────────────────────────────── */
const ProductLimitModal = ({ isOpen, onClose, limit }) => {
    if (!isOpen) return null;
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.75)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, padding: '1rem'
            }}
        >
            <div
                className="card animate-fade-in"
                style={{ maxWidth: 480, width: '100%', position: 'relative' }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.4rem', cursor: 'pointer',
                        color: 'var(--text-muted)'
                    }}
                ><X size={18} /></button>

                <div className="text-center mb-6">
                    <div className="icon-bg icon-bg-primary"
                        style={{ width: 64, height: 64, margin: '0 auto 1rem', background: 'rgba(226,19,35,0.1)' }}>
                        <AlertCircle size={32} color="#e21323" />
                    </div>
                    <h2 className="h3 mb-2">Product Limit Reached</h2>
                    <p className="text-muted">
                        You have reached your maximum of <strong>{limit}</strong> products.
                        Contact support to increase your product limit.
                    </p>
                </div>

                <div className="p-4 mb-6 rounded"
                    style={{ background: 'rgba(226,19,35,0.05)', border: '1px solid rgba(226,19,35,0.2)' }}>
                    <div className="flex items-center gap-3">
                        <div className="icon-bg"
                            style={{ background: 'rgba(226,19,35,0.1)', width: 40, height: 40 }}>
                            <Mail size={20} color="#e21323" />
                        </div>
                        <div>
                            <div className="text-sm text-muted mb-1">Contact Support</div>
                            <a href="mailto:info@souqroute.com"
                                style={{ color: '#e21323', fontWeight: 500, fontSize: '1.05rem', textDecoration: 'none' }}
                                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                                info@souqroute.com
                            </a>
                        </div>
                    </div>
                </div>

                <button onClick={onClose} className="btn btn-secondary w-full">Close</button>
            </div>
        </div>
    );
};

/* ─── Add New Product Modal ───────────────────────────────────────────── */
const AddNewModal = ({ isOpen, onClose, onAdd, prefill }) => {
    const [name, setName] = useState(prefill || '');
    const [adding, setAdding] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setName(prefill || '');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, prefill]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setAdding(true);
        await onAdd(name.trim());
        setAdding(false);
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.75)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, padding: '1rem'
            }}
        >
            <div
                className="card animate-fade-in"
                style={{ maxWidth: 440, width: '100%', position: 'relative' }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.4rem', cursor: 'pointer',
                        color: 'var(--text-muted)'
                    }}
                ><X size={18} /></button>

                <div className="mb-6">
                    <h2 className="h3 mb-1">Add New Product</h2>
                    <p className="text-muted text-sm">
                        This product will be added to the master catalog and your list.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="input-group mb-0">
                        <label className="label">Product Name</label>
                        <input
                            ref={inputRef}
                            type="text"
                            className="input"
                            placeholder="e.g. Steel Pipes"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                        {name.trim() && (
                            <p className="text-xs text-muted mt-1">
                                Stored as: <strong style={{ color: 'var(--primary)' }}>{normalize(name)}</strong>
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={adding || !name.trim()} className="btn btn-primary flex-1">
                            {adding
                                ? <span className="spinner" style={{ width: 16, height: 16, borderTopColor: 'white' }} />
                                : <><Plus size={16} /> Add Product</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─── Main Products Component ─────────────────────────────────────────── */
const Products = () => {
    const { user } = useAuth();

    const [myProducts, setMyProducts] = useState([]);       // user's linked products
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);  // filtered master products
    const [companyId, setCompanyId] = useState(null);
    const [productLimit, setProductLimit] = useState(10);   // default 10, overridable by master
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(null);             // id of product being added
    const [errorMsg, setErrorMsg] = useState('');

    const [showLimitModal, setShowLimitModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const searchTimeout = useRef(null);

    /* ── load company + products ── */
    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const { data: company } = await supabase
                .from('companies')
                .select('id, product_limit')
                .eq('user_id', user.id)
                .maybeSingle();

            if (!company) return;
            setCompanyId(company.id);
            if (company.product_limit) setProductLimit(company.product_limit);

            const { data: linked } = await supabase
                .from('products')
                .select('id, master_product_id, master_products(id, name)')
                .eq('company_id', company.id);

            setMyProducts(linked || []);
        } catch (err) {
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
        }
    };

    /* ── live search ── */
    useEffect(() => {
        clearTimeout(searchTimeout.current);
        setErrorMsg('');

        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            const normalized = normalize(searchTerm);
            const { data } = await supabase
                .from('master_products')
                .select('id, name')
                .ilike('name', `%${normalized}%`)
                .order('name')
                .limit(20);

            setSearchResults(data || []);
        }, 300);

        return () => clearTimeout(searchTimeout.current);
    }, [searchTerm]);

    /* ── add from search result ── */
    const handleAddFromSearch = async (masterProduct) => {
        if (!companyId) return;
        setErrorMsg('');

        // duplicate check
        const alreadyAdded = myProducts.some(p => p.master_product_id === masterProduct.id);
        if (alreadyAdded) {
            setErrorMsg(`"${masterProduct.name}" is already in your product list.`);
            return;
        }

        // limit check
        if (myProducts.length >= productLimit) {
            setShowLimitModal(true);
            return;
        }

        setAdding(masterProduct.id);
        try {
            const { data: newProduct, error } = await supabase
                .from('products')
                .insert({ company_id: companyId, master_product_id: masterProduct.id })
                .select('id, master_product_id, master_products(id, name)')
                .single();

            if (error) throw error;
            setMyProducts(prev => [...prev, newProduct]);
            setSearchTerm('');
            setSearchResults([]);
        } catch (err) {
            console.error('Error adding product:', err);
            setErrorMsg('Failed to add product. Please try again.');
        } finally {
            setAdding(null);
        }
    };

    /* ── add brand-new product (from modal) ── */
    const handleAddNew = async (rawName) => {
        if (!companyId) return;
        setErrorMsg('');

        const stored = normalize(rawName);

        // limit check
        if (myProducts.length >= productLimit) {
            setShowAddModal(false);
            setShowLimitModal(true);
            return;
        }

        try {
            // check if already exists in master
            const { data: existing } = await supabase
                .from('master_products')
                .select('id, name')
                .eq('name', stored)
                .maybeSingle();

            let masterId;
            if (existing) {
                masterId = existing.id;
                // check if user already has it
                const alreadyAdded = myProducts.some(p => p.master_product_id === existing.id);
                if (alreadyAdded) {
                    setErrorMsg(`"${stored}" is already in your product list.`);
                    setShowAddModal(false);
                    return;
                }
            } else {
                // create in master
                const { data: created, error: createErr } = await supabase
                    .from('master_products')
                    .insert({ name: stored })
                    .select()
                    .single();
                if (createErr) throw createErr;
                masterId = created.id;
            }

            // link to company
            const { data: newProduct, error: linkErr } = await supabase
                .from('products')
                .insert({ company_id: companyId, master_product_id: masterId })
                .select('id, master_product_id, master_products(id, name)')
                .single();

            if (linkErr) throw linkErr;

            setMyProducts(prev => [...prev, newProduct]);
            setSearchTerm('');
            setSearchResults([]);
            setShowAddModal(false);
        } catch (err) {
            console.error('Error creating product:', err);
            setErrorMsg('Failed to create product. Please try again.');
            setShowAddModal(false);
        }
    };

    /* ── delete ── */
    const handleDelete = async (id) => {
        if (!confirm('Remove this product from your list?')) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            setMyProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };

    /* ── derived ── */
    const isSearching = searchTerm.trim().length > 0;
    const noResults = isSearching && searchResults.length === 0;

    if (loading) return (
        <div className="flex items-center justify-center p-8 h-screen">
            <div className="spinner" />
        </div>
    );

    return (
        <div className="animate-fade-in">
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="h2 mb-2">Products Catalog</h1>
                    <p className="text-muted">
                        Manage your product offerings &nbsp;
                        <span className="badge badge-blue">{myProducts.length} / {productLimit}</span>
                    </p>
                </div>
            </div>

            {/* ── Search Box ── */}
            <div className="card mb-6">
                <h3 className="h3 mb-4 flex items-center gap-2">
                    <Search size={20} className="text-primary" /> Search Products
                </h3>

                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{
                        position: 'absolute', left: 12, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none'
                    }} />
                    <input
                        type="text"
                        className="input"
                        style={{ paddingLeft: 40 }}
                        placeholder="Search for a product to add…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => { setSearchTerm(''); setSearchResults([]); setErrorMsg(''); }}
                            style={{
                                position: 'absolute', right: 10, top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--text-muted)'
                            }}
                        ><X size={16} /></button>
                    )}
                </div>

                {/* Error message */}
                {errorMsg && (
                    <div className="flex items-center gap-2 mt-3 p-3 rounded text-sm"
                        style={{ background: 'rgba(226,19,35,0.08)', border: '1px solid rgba(226,19,35,0.25)', color: '#e21323' }}>
                        <AlertCircle size={16} /> {errorMsg}
                    </div>
                )}

                {/* Search Results */}
                {isSearching && (
                    <div className="mt-4">
                        {searchResults.length > 0 ? (
                            <>
                                <p className="text-xs text-muted mb-3 uppercase" style={{ letterSpacing: '0.05em' }}>
                                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                                </p>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: '0.75rem'
                                }}>
                                    {searchResults.map(mp => {
                                        const alreadyAdded = myProducts.some(p => p.master_product_id === mp.id);
                                        const isAdding = adding === mp.id;
                                        return (
                                            <div
                                                key={mp.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: alreadyAdded
                                                        ? '1px solid rgba(34,197,94,0.4)'
                                                        : '1px solid var(--border)',
                                                    background: alreadyAdded
                                                        ? 'rgba(34,197,94,0.06)'
                                                        : 'var(--bg-card-hover)',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <Package size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                                    <span className="font-medium text-sm" style={{
                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                                    }}>
                                                        {mp.name}
                                                    </span>
                                                </div>

                                                {alreadyAdded ? (
                                                    <CheckCircle size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddFromSearch(mp)}
                                                        disabled={isAdding}
                                                        title="Add to my products"
                                                        style={{
                                                            width: 28, height: 28, flexShrink: 0,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            background: 'var(--primary)',
                                                            border: 'none', borderRadius: '50%',
                                                            cursor: isAdding ? 'wait' : 'pointer',
                                                            color: 'white',
                                                            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                                                        }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.transform = 'scale(1.15)';
                                                            e.currentTarget.style.boxShadow = '0 0 10px rgba(226,19,35,0.5)';
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        {isAdding
                                                            ? <span className="spinner" style={{ width: 12, height: 12, borderTopColor: 'white' }} />
                                                            : <Plus size={14} />}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            /* No results → offer to create */
                            <div className="text-center py-8"
                                style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                                <Package size={36} className="mx-auto mb-3 opacity-40" />
                                <p className="text-muted mb-1">No products found for <strong>"{searchTerm}"</strong></p>
                                <p className="text-sm text-muted mb-4">Would you like to add it as a new product?</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="btn btn-primary"
                                >
                                    <Plus size={16} /> Add New Product
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── My Products List ── */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="h3">
                        My Products&nbsp;
                        <span className="text-muted text-sm font-normal">
                            ({myProducts.length}/{productLimit})
                        </span>
                    </h3>
                </div>

                {myProducts.length === 0 ? (
                    <div className="text-center py-12 text-muted"
                        style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                        <Package size={48} className="mx-auto mb-4 opacity-40" />
                        <p>No products added yet.</p>
                        <p className="text-sm">Search above to add your first product.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '0.75rem'
                    }}>
                        {myProducts.map(product => (
                            <div
                                key={product.id}
                                className="group"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-card-hover)',
                                    transition: 'border-color 0.15s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(226,19,35,0.35)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="icon-bg icon-bg-primary"
                                        style={{ width: 32, height: 32, flexShrink: 0 }}>
                                        <Package size={14} />
                                    </div>
                                    <span className="font-medium text-sm" style={{
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                    }}>
                                        {product.master_products?.name}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    title="Remove"
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-muted)', padding: '0.25rem',
                                        borderRadius: 'var(--radius-sm)', flexShrink: 0,
                                        transition: 'color 0.15s ease'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#e21323'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            <ProductLimitModal
                isOpen={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                limit={productLimit}
            />
            <AddNewModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddNew}
                prefill={searchTerm}
            />
        </div>
    );
};

export default Products;
