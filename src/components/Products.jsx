
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Search, Package } from 'lucide-react';

const Products = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [masterProducts, setMasterProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [companyId, setCompanyId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        try {
            // Get Company ID
            const { data: company } = await supabase
                .from('companies')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!company) return;
            setCompanyId(company.id);

            // Get Company Products
            const { data: companyProducts } = await supabase
                .from('products')
                .select(`
          *,
          master_products (name)
        `)
                .eq('company_id', company.id);

            setProducts(companyProducts || []);

            // Get Master Products (for dropdown)
            const { data: masters } = await supabase
                .from('master_products')
                .select('*')
                .order('name');

            setMasterProducts(masters || []);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async () => {
        if (!searchTerm.trim() || !companyId) return;

        try {
            let masterId;

            // Check if exists in master
            const existingMaster = masterProducts.find(
                p => p.name.toLowerCase() === searchTerm.toLowerCase()
            );

            if (existingMaster) {
                masterId = existingMaster.id;
            } else {
                // Create new master product
                const { data: newMaster, error } = await supabase
                    .from('master_products')
                    .insert({ name: searchTerm })
                    .select()
                    .single();

                if (error) throw error;
                masterId = newMaster.id;
                setMasterProducts([...masterProducts, newMaster]);
            }

            // Link to company
            const { data: newProduct, error: linkError } = await supabase
                .from('products')
                .insert({
                    company_id: companyId,
                    master_product_id: masterId
                })
                .select('*, master_products(name)')
                .single();

            if (linkError) throw linkError;

            setProducts([...products, newProduct]);
            setSearchTerm('');
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    if (loading) return <div className="flex items-center justify-center p-8 h-screen"><div className="spinner" /></div>;

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="h2 flex items-center gap-2 mb-2">Products Catalog</h1>
                    <p className="text-muted">Manage your product offerings and inventory</p>
                </div>
            </div>

            <div className="card mb-8">
                <h3 className="h3 mb-4 flex items-center gap-2"><Plus size={20} className="text-primary" /> Add New Product</h3>
                <div className="flex gap-4 items-end">
                    <div className="input-group flex-1 mb-0">
                        <div style={{ position: 'relative' }}>
                            <Search size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                className="input"
                                style={{ paddingLeft: '40px' }}
                                placeholder="Search or type new product name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                list="master-products-list"
                            />
                        </div>
                        <datalist id="master-products-list">
                            {masterProducts.map(p => (
                                <option key={p.id} value={p.name} />
                            ))}
                        </datalist>
                    </div>
                    <button onClick={handleAddProduct} className="btn btn-primary" style={{ height: '42px' }}>
                        Add Product
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="h3">Your Products <span className="text-muted text-sm font-normal">({products.length})</span></h3>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-12 text-muted border border-dashed border-slate-700 rounded-lg">
                        <Package size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No products added yet.</p>
                        <p className="text-sm">Add your first product above to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <div key={product.id} className="p-4 border border-slate-700 rounded-lg flex items-center justify-between transition-all hover:bg-white/5 group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="icon-bg icon-bg-primary" style={{ width: '40px', height: '40px' }}>
                                        <Package size={18} />
                                    </div>
                                    <span className="font-medium truncate">{product.master_products?.name}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 text-muted hover:text-red-400 rounded transition-colors"
                                    title="Remove Product"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
