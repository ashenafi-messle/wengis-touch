import React, { useState } from 'react';
import { Product } from '../../types';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Sparkles, Image as ImageIcon, Layers, Eye, Upload, Loader2, Star } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BackButton } from '../BackButton';
import { getThumbnailImageUrl } from '../../utils/imageOptimizer';

const heroImg = '/src/assets/images/wengi_hero_crochet_1785323531326.jpg';

interface AdminImageItem {
  id: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

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
  const [colorsInput, setColorsInput] = useState<string>('');
  const [available, setAvailable] = useState<boolean>(true);

  // 1-10 Images State
  const [imagesList, setImagesList] = useState<AdminImageItem[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string>('');

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setDescription('');
    setPrice(250);
    setColorsInput('');
    setAvailable(true);
    setEditingProduct(null);
    setImagesList([]);
    setImageError('');
    setUploading(false);
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setCategory(p.category);
    setDescription(p.description);
    setPrice(p.price);
    setColorsInput(p.colors);
    setAvailable(p.available);
    setImageError('');

    const existingImages = (p.images || []).map((url, idx) => ({
      id: `existing-${idx}-${url}`,
      url,
      isNew: false
    }));
    setImagesList(existingImages);
    setIsAddOpen(true);
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    if (imagesList.length + files.length > 10) {
      setImageError(
        `Maximum 10 images are allowed for one product. You currently have ${imagesList.length} and can add at most ${10 - imagesList.length} more.`
      );
      return;
    }

    const newItems: AdminImageItem[] = [];
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

    for (const file of files) {
      if (!allowed.includes(file.type.toLowerCase())) {
        setImageError(`"${file.name}" has an unsupported format. Supported: JPEG, PNG, WEBP, AVIF.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setImageError(`"${file.name}" exceeds the 10MB size limit.`);
        return;
      }
      newItems.push({
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: URL.createObjectURL(file),
        file,
        isNew: true
      });
    }

    setImagesList(prev => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageError('');
    setImagesList(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    setImagesList(prev => {
      const copy = [...prev];
      const [item] = copy.splice(indexToPrimary, 1);
      return [item, ...copy];
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setImageError('');
    if (!title.trim() || !price) return;

    if (imagesList.length === 0) {
      setImageError('Please select at least 1 product image.');
      return;
    }

    if (imagesList.length > 10) {
      setImageError('Maximum 10 images are allowed for one product.');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload any newly selected files to Cloudinary
      const newItems = imagesList.filter(item => item.isNew && item.file);
      const existingUrls = imagesList.filter(item => !item.isNew).map(item => item.url);

      let newlyUploadedUrls: string[] = [];

      if (newItems.length > 0) {
        const formData = new FormData();
        formData.append('existingCount', String(existingUrls.length));
        for (const item of newItems) {
          if (item.file) formData.append('files', item.file);
        }

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to upload images to Cloudinary.');
        }

        const data = await res.json();
        if (Array.isArray(data.images)) {
          newlyUploadedUrls = data.images.map((img: any) => img.url);
        } else if (data.url) {
          newlyUploadedUrls = [data.url];
        }
      }

      // 2. Assemble final array preserving order
      let newUploadIndex = 0;
      const finalImages: string[] = [];
      for (const item of imagesList) {
        if (!item.isNew) {
          finalImages.push(item.url);
        } else if (newUploadIndex < newlyUploadedUrls.length) {
          finalImages.push(newlyUploadedUrls[newUploadIndex++]);
        }
      }

      const productPayload = {
        title: title.trim(),
        category: category.toLowerCase().trim(),
        description: description.trim(),
        price: Number(price),
        images: finalImages,
        colors: colorsInput.trim(),
        available
      };

      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, productPayload);
      } else {
        await onAddProduct(productPayload);
      }

      setIsAddOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving product:', error);
      setImageError(error.message || 'Failed to save product. Please try again.');
    } finally {
      setUploading(false);
    }
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
          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-full bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('adminProd.addNew')}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#142E52] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#C95A1A]/30">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#D8C3A5] absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('adminProd.search')}
            className="w-full bg-[#0F2747] text-xs text-[#FAF7F1] pl-9 pr-4 py-2 rounded-xl border border-[#C95A1A]/20 focus:outline-none focus:border-[#C95A1A]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-[#D8C3A5] uppercase font-bold shrink-0">{t('adminProd.filter')}:</span>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="bg-[#0F2747] text-xs text-[#FAF7F1] border border-[#C95A1A]/20 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#C95A1A] cursor-pointer"
          >
            <option value="All">{t('adminProd.all')}</option>
            {Array.from(new Set(products.map(p => p.category.toLowerCase().trim()))).sort().map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#142E52] rounded-2xl sm:rounded-3xl border border-[#C95A1A]/30 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px] sm:min-w-full">
            <thead>
              <tr className="border-b border-[#C95A1A]/20 bg-[#0F2747] text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#D8C3A5]">
                <th className="p-3 sm:p-4">{t('adminProd.item')}</th>
                <th className="p-3 sm:p-4">{t('adminProd.price')}</th>
                <th className="p-3 sm:p-4">{t('adminProd.colorsSizes')}</th>
                <th className="p-3 sm:p-4">Images</th>
                <th className="p-3 sm:p-4">{t('adminProd.stock')}</th>
                <th className="p-3 sm:p-4 text-right">{t('adminProd.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C95A1A]/10 text-xs text-[#FAF7F1]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#0F2747]/50 transition-colors">
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getThumbnailImageUrl(p.images[0] || heroImg)}
                        alt={p.title}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-[#C95A1A]/30 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="font-serif-luxury font-bold text-xs sm:text-sm text-[#FAF7F1] block line-clamp-1">{p.title}</span>
                        <span className="text-[10px] uppercase font-bold text-[#C95A1A]">{p.category}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 sm:p-4 font-serif-luxury font-bold text-sm sm:text-base text-[#FAF7F1]">
                    ${p.price}
                  </td>

                  <td className="p-3 sm:p-4 text-[10px] sm:text-xs text-[#D8C3A5] max-w-[120px] truncate">
                    {p.colors || '—'}
                  </td>

                  <td className="p-3 sm:p-4 text-[11px] text-[#D8C3A5]">
                    <span className="px-2 py-0.5 rounded-full bg-[#0F2747] border border-[#C95A1A]/30">
                      {p.images?.length || 0} / 10
                    </span>
                  </td>

                  <td className="p-3 sm:p-4">
                    <button
                      onClick={() => onUpdateProduct(p.id, { available: !p.available })}
                      className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase cursor-pointer flex items-center space-x-1 ${
                        p.available
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {p.available ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{p.available ? 'In Stock' : 'Unavailable'}</span>
                    </button>
                  </td>

                  <td className="p-3 sm:p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="p-1.5 sm:p-2 rounded-lg bg-[#0F2747] hover:bg-[#C95A1A] text-[#FAF7F1] transition-colors cursor-pointer"
                        title={t('adminProd.edit')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${p.title}"?`)) {
                            onDeleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 sm:p-2 rounded-lg bg-[#0F2747] hover:bg-red-600 text-[#FAF7F1] transition-colors cursor-pointer"
                        title={t('adminProd.delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F2747]/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0F2747] text-[#FAF7F1] w-full max-w-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[#C95A1A]/30 shadow-2xl relative my-6">
            
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold mb-1">
              {editingProduct ? 'Edit Product' : 'Add Handcrafted Piece'}
            </h3>
            <p className="text-xs text-[#D8C3A5] mb-6">
              Configure product details, categories, pricing, and up to 10 Cloudinary CDN images.
            </p>

            {imageError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                {imageError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase text-[#D8C3A5] tracking-wider block mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Royal Tote Bag"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className="font-bold uppercase text-[#D8C3A5] tracking-wider block mb-1">
                    Colors (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    placeholder="Classic Navy, Warm Adobe, Cream Beige"
                    className="w-full bg-[#142E52] border border-[#C95A1A]/30 rounded-xl px-3 py-2 text-[#FAF7F1]"
                  />
                </div>
              </div>

              {/* 1 - 10 Product Images Section */}
              <div className="p-4 rounded-2xl bg-[#142E52] border border-[#C95A1A]/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="font-bold uppercase text-[#D8C3A5] tracking-wider block text-xs">
                      Product Images ({imagesList.length} / 10) *
                    </label>
                    <span className="text-[10px] text-[#D8C3A5]/70">
                      Upload 1 to 10 images. The first image will be used as the primary showcase cover.
                    </span>
                  </div>

                  {imagesList.length >= 10 && (
                    <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40">
                      Maximum image limit reached (10/10)
                    </span>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex items-center space-x-3">
                  <label
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors cursor-pointer border ${
                      imagesList.length >= 10
                        ? 'bg-[#0F2747]/50 border-white/10 opacity-50 cursor-not-allowed'
                        : 'bg-[#0F2747] border-[#C95A1A]/40 hover:border-[#C95A1A] text-[#FAF7F1]'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-[#C95A1A]" />
                    <span className="text-xs font-semibold">
                      {imagesList.length >= 10 ? 'Limit Reached' : `Choose Images (${10 - imagesList.length} remaining)`}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={imagesList.length >= 10 || uploading}
                      onChange={handleFilesSelect}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-[#D8C3A5]/60">JPEG, PNG, WEBP, AVIF (Max 10MB each)</span>
                </div>

                {/* Image Previews Grid */}
                {imagesList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                    {imagesList.map((item, index) => (
                      <div
                        key={item.id}
                        className={`relative group rounded-xl overflow-hidden border aspect-square bg-[#0F2747] flex flex-col justify-between ${
                          index === 0 ? 'border-[#C95A1A] ring-2 ring-[#C95A1A]/40' : 'border-white/10'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={`Product view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Badges */}
                        <div className="absolute top-1 left-1 flex flex-col gap-1">
                          {index === 0 && (
                            <span className="bg-[#C95A1A] text-[#FAF7F1] text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shadow">
                              Cover
                            </span>
                          )}
                          {item.isNew && (
                            <span className="bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                              New
                            </span>
                          )}
                        </div>

                        {/* Quick actions overlay */}
                        <div className="absolute inset-0 bg-[#0F2747]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1 p-1">
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(index)}
                              className="p-1 rounded bg-[#C95A1A] text-white hover:bg-[#A94712] transition-colors"
                              title="Make Cover Image"
                            >
                              <Star className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                            title="Remove image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* In Stock Toggle */}
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
                  disabled={uploading}
                  onClick={() => {
                    setIsAddOpen(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#142E52] text-[#FAF7F1] text-xs font-semibold uppercase disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-full bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] text-xs font-bold uppercase tracking-wider shadow-lg flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading to Cloudinary...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Update Product' : 'Publish Product'}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
