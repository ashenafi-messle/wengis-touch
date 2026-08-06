import React, { useState } from 'react';
import { Product } from '../../types';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Sparkles, Image as ImageIcon, Layers, Eye, Upload } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { supabaseAdmin } from '../../../lib/supabase';
import { BackButton } from '../BackButton';
const heroImg = '/src/assets/images/wengi_hero_crochet_1785323531326.jpg';
const toteImg = '/src/assets/images/wengi_crochet_tote_1785323544902.jpg';
const cardiganImg = '/src/assets/images/wengi_crochet_cardigan_1785323557878.jpg';
const flowersImg = '/src/assets/images/wengi_crochet_flowers_1785323568097.jpg';

interface AdminProductsProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  isAddOpen: boolean;
  setIsAddOpen: (open: boolean) => void;
  onBack: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  isAddOpen,
  setIsAddOpen,
  onBack
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState<string>('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(250);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [colorsInput, setColorsInput] = useState<string>('');
  const [available, setAvailable] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setDescription('');
    setPrice(250);
    setImageUrl('');
    setColorsInput('');
    setAvailable(true);
    setEditingProduct(null);
    setImageFile(null);
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setCategory(p.category);
    setDescription(p.description);
    setPrice(p.price);
    setImageUrl(p.images[0] || '');
    setColorsInput(p.colors);
    setAvailable(p.available);
    setIsAddOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;

    let finalImageUrl = imageUrl;
    
    // If a file was selected, upload it to Supabase
    if (imageFile) {
      try {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('Failed to upload image. Please try again.');
          return;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('product-images')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
        return;
      }
    }

    const productPayload = {
      title,
      category: category.toLowerCase().trim(),
      description,
      price: Number(price),
      images: [finalImageUrl],
      colors: colorsInput,
      available
    };

    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, productPayload);
    } else {
      await onAddProduct(productPayload);
    }

    setIsAddOpen(false);
    resetForm();
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCat === 'All' || 
      p.category.toLowerCase().includes(filterCat.toLowerCase()) ||
      filterCat.toLowerCase().includes(p.category.toLowerCase());
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4 sm:space-y-6 text-left animate-fadeIn">
      
      {/* Back Button */}
      <div className="mb-4">
        <BackButton onClick={onBack} />
      </div>

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-[#142E52] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#C95A1A]/30 text-[#FAF7F1]">
        <div>
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#FAF7F1]">
            {t('adminProd.title')}
          </h2>
          <p className="text-[11px] sm:text-xs text-[#D8C3A5] line-clamp-2 sm:line-clamp-none">
            {t('adminProd.desc')}
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] text-[11px] sm:text-xs font-semibold uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer shadow-md"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{t('adminProd.addProduct')}</span>
        </button>
      </div>

      {/* Filter and Search Row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between bg-[#F3E7D3] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#D8C3A5]">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F2747] absolute left-2.5 sm:left-3 top-2.5 sm:top-3" />
          <input
            type="text"
            placeholder={t('adminProd.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F1] border border-[#D8C3A5] rounded-lg sm:rounded-xl pl-8 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 text-[11px] sm:text-xs text-[#0F2747] focus:outline-none focus:border-[#C95A1A]"
          />
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 w-full sm:w-auto">
          <span className="text-[11px] sm:text-xs font-bold text-[#0F2747] uppercase">{t('adminProd.category')}:</span>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="bg-[#FAF7F1] text-[11px] sm:text-xs text-[#0F2747] border border-[#D8C3A5] rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 focus:outline-none"
          >
            <option value="All">{t('adminProd.allCategories')}</option>
            {Array.from(new Set(products.map(p => p.category.toLowerCase().trim()))).sort().map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#142E52] rounded-2xl sm:rounded-3xl border border-[#C95A1A]/30 overflow-hidden shadow-xl text-[#FAF7F1]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] sm:text-xs">
            <thead className="bg-[#0F2747] text-[#D8C3A5] uppercase font-bold text-[9px] sm:text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="p-2 sm:p-4">{t('adminProd.titleCategory')}</th>
                <th className="p-2 sm:p-4">{t('adminProd.price')}</th>
                <th className="p-2 sm:p-4">{t('adminProd.colorsSizes')}</th>
                <th className="p-2 sm:p-4">{t('adminProd.availability')}</th>
                <th className="p-2 sm:p-4 text-right">{t('adminProd.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover border border-[#C95A1A]/30 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="font-serif-luxury font-bold text-sm text-[#FAF7F1] block">{p.title}</span>
                        <span className="text-[10px] uppercase font-bold text-[#C95A1A]">{p.category}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-serif-luxury font-bold text-base text-[#FAF7F1]">${p.price}</span>
                  </td>

                  <td className="p-4">
                    <span className="text-[10px] text-[#D8C3A5] block">{p.colors}</span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => onUpdateProduct(p.id, { available: !p.available })}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer flex items-center space-x-1 ${
                        p.available
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {p.available ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{p.available ? 'In Stock' : 'Unavailable'}</span>
                    </button>
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleStartEdit(p)}
                      className="p-2 rounded-xl bg-[#0F2747] text-[#D8C3A5] hover:text-[#C95A1A] transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-2 rounded-xl bg-red-900/40 text-red-300 hover:text-red-100 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0F2747] border border-[#C95A1A]/40 text-[#FAF7F1] p-6 sm:p-8 rounded-3xl max-w-2xl w-full my-8 space-y-6 shadow-2xl relative text-left">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-serif-luxury text-2xl font-bold text-[#FAF7F1]">
                {editingProduct ? 'Edit Atelier Product' : 'Add New Crochet Piece'}
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase text-[#D8C3A5] tracking-wider block mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Royal Atelier Shoulder Clutch"
                    className="w-full bg-[#142E52] border border-[#C95A1A]/30 rounded-xl px-3 py-2 text-[#FAF7F1] focus:outline-none focus:border-[#C95A1A]"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-[#D8C3A5] tracking-wider block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Bags, Garments, Accessories, etc."
                    className="w-full bg-[#142E52] border border-[#C95A1A]/30 rounded-xl px-3 py-2 text-[#FAF7F1] focus:outline-none focus:border-[#C95A1A]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-[#D8C3A5] tracking-wider block mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of weave, materials, and design inspiration..."
                  className="w-full bg-[#142E52] border border-[#C95A1A]/30 rounded-xl px-3 py-2 text-[#FAF7F1] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                <div>
                  <label className="font-bold uppercase text-[#D8C3A5] tracking-wider block mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#142E52] border border-[#C95A1A]/30 rounded-xl px-3 py-2 text-[#FAF7F1]"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="font-bold uppercase text-[#D8C3A5] tracking-wider block mb-2">
                  Product Image *
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 px-4 py-2 bg-[#142E52] border border-[#C95A1A]/30 rounded-xl cursor-pointer hover:border-[#C95A1A] transition-colors">
                      <Upload className="w-4 h-4 text-[#C95A1A]" />
                      <span className="text-xs text-[#FAF7F1]">Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            setImageUrl(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {imageFile && (
                      <span className="text-xs text-[#D8C3A5]">{imageFile.name}</span>
                    )}
                  </div>
                  
                  {imageUrl && (
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt="Product preview"
                        className="w-full h-48 object-cover rounded-xl border border-[#C95A1A]/30"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setImageFile(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Colors Input */}
              <div>
                <label className="font-bold uppercase text-[#D8C3A5] tracking-wider block mb-1">
                  Colors (Text)
                </label>
                <input
                  type="text"
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  placeholder="Classic Navy, Warm Adobe, Cream Beige"
                  className="w-full bg-[#142E52] border border-[#C95A1A]/30 rounded-xl px-3 py-2 text-[#FAF7F1]"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="rounded text-[#C95A1A]"
                  />
                  <span>Product Available / In Stock</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#142E52] text-[#FAF7F1] text-xs font-semibold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  {editingProduct ? 'Update Product' : 'Publish Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
