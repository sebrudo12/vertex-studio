import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Tag } from 'lucide-react';
import api from '../../services/api';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminProducts: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('19.99');
  const [category, setCategory] = useState<'Scripts' | 'UI' | 'Framework' | 'Vehicles' | 'Maps' | 'Misc'>('Scripts');
  const [frameworks, setFrameworks] = useState('QBCore, ESX, Qbox');
  const [version, setVersion] = useState('1.0.0');
  const [downloadFilename, setDownloadFilename] = useState('vertex_script.zip');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80');

  const load = async () => {
    try {
      const res = await api.get('/admin/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreateModal = () => {
    setEditingProd(null);
    setTitle('');
    setSlug('');
    setShortDesc('');
    setDesc('');
    setPrice('19.99');
    setCategory('Scripts');
    setFrameworks('QBCore, ESX, Qbox');
    setVersion('1.0.0');
    setDownloadFilename('vertex_script.zip');
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProd(p);
    setTitle(p.title);
    setSlug(p.slug);
    setShortDesc(p.short_description);
    setDesc(p.description);
    setPrice(p.price.toString());
    setCategory(p.category);
    setFrameworks(p.frameworks?.join(', ') || 'QBCore, ESX');
    setVersion(p.version);
    setDownloadFilename(p.download_filename);
    setThumbnail(p.thumbnail);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fwArray = frameworks.split(',').map((f) => f.trim()).filter(Boolean);

    try {
      if (editingProd) {
        await api.put(`/admin/products/${editingProd.id}`, {
          title,
          short_description: shortDesc,
          description: desc,
          price: parseFloat(price),
          category,
          frameworks: fwArray,
          version,
          download_filename: downloadFilename,
          thumbnail,
        });
        showToast('Product updated successfully!', 'success');
      } else {
        await api.post('/admin/products', {
          title,
          slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
          short_description: shortDesc,
          description: desc,
          price: parseFloat(price),
          category,
          frameworks: fwArray,
          version,
          download_filename: downloadFilename,
          thumbnail,
        });
        showToast('Product created successfully!', 'success');
      }

      setModalOpen(false);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save product', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      showToast('Product deleted', 'info');
      load();
    } catch (err: any) {
      showToast('Failed to delete product', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Product Catalog</h2>
          <p className="text-xs text-gray-400 mt-1">Manage FiveM scripts, pricing, versions, and upload archives.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="rounded-2xl bg-dark-850/80 border border-white/5 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-dark-900 border-b border-white/5 text-gray-400 uppercase font-semibold">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Frameworks</th>
              <th className="p-4">Version</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.thumbnail} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-dark-800" />
                    <div>
                      <div className="font-bold text-white">{p.title}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">{p.category}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {p.frameworks?.map((fw) => (
                      <span key={fw} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px]">
                        {fw}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 font-mono">v{p.version}</td>
                <td className="p-4 font-bold text-white">€{parseFloat(p.price as string).toFixed(2)}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase border border-emerald-500/20">
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-dark-900 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">
              {editingProd ? `Edit Product: ${editingProd.title}` : 'Add New Product'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Short Description</label>
                <input
                  type="text"
                  required
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Full Description (Markdown)</label>
                <textarea
                  rows={4}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-white"
                  >
                    <option value="Scripts">Scripts</option>
                    <option value="UI">UI</option>
                    <option value="Framework">Framework</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Maps">Maps</option>
                    <option value="Misc">Misc</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Version</label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Frameworks (comma separated)</label>
                  <input
                    type="text"
                    value={frameworks}
                    onChange={(e) => setFrameworks(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Zip File (Storage filename)</label>
                  <input
                    type="text"
                    required
                    value={downloadFilename}
                    onChange={(e) => setDownloadFilename(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  required
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-dark-800 border border-white/10 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
