"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Settings,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Users,
  FolderOpen,
  Tag,
  Upload,
  Calendar,
  X,
  Loader,
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Star,
  Sparkles,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Dashboard Data
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form Modals Toggles
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Product Form Fields
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productFeatured, setProductFeatured] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Category Form Field
  const [categoryName, setCategoryName] = useState("");

  // Coupon Form Fields
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscountType, setCouponDiscountType] = useState("PERCENTAGE");
  const [couponDiscountValue, setCouponDiscountValue] = useState("");
  const [couponMinOrderValue, setCouponMinOrderValue] = useState("");

  // Settings Configuration states
  const [boutiqueTax, setBoutiqueTax] = useState("5");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("1500");
  const [checkoutNotice, setCheckoutNotice] = useState("Please note: All boutique wedding cakes require at least 48 hours notice before scheduled dispatch.");

  // Home Page Customization States
  const [homeHeadline, setHomeHeadline] = useState("");
  const [homeSubtitle, setHomeSubtitle] = useState("");
  const [homeCta1Label, setHomeCta1Label] = useState("");
  const [homeCta2Label, setHomeCta2Label] = useState("");
  const [homeImageUrl, setHomeImageUrl] = useState("");
  const [isSavingHome, setIsSavingHome] = useState(false);

  // Orders Search & Filter states
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderFilterStatus, setOrderFilterStatus] = useState("ALL");

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "ADMIN") {
        toast("Access denied. Admin authorization required.", "error");
        router.push("/login");
      } else {
        loadDashboardData();
      }
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [analyticsRes, productsRes, categoriesRes, ordersRes, couponsRes, homeSettingsRes] =
        await Promise.all([
          fetch("/api/admin/analytics"),
          fetch("/api/products"),
          fetch("/api/categories"),
          fetch("/api/orders"),
          fetch("/api/coupons"),
          fetch("/api/admin/home-settings"),
        ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (productsRes.ok) setProducts((await productsRes.json()).products);
      if (categoriesRes.ok) setCategories((await categoriesRes.json()).categories);
      if (ordersRes.ok) setOrders((await ordersRes.json()).orders);
      if (couponsRes.ok) setCoupons((await couponsRes.json()).coupons);

      if (homeSettingsRes.ok) {
        const homeData = await homeSettingsRes.json();
        setHomeHeadline(homeData.settings.heroHeadline);
        setHomeSubtitle(homeData.settings.heroSubtitle);
        setHomeCta1Label(homeData.settings.heroCta1Label);
        setHomeCta2Label(homeData.settings.heroCta2Label);
        setHomeImageUrl(homeData.settings.heroImageUrl);
      }
    } catch (e) {
      toast("Error loading administrative records.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  // Image Upload Handler (Base64 fallback)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProductImages([...productImages, data.url]);
        toast("Image uploaded successfully!", "success");
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setProductImages([...productImages, reader.result as string]);
            toast("Image uploaded (Local Data URL fallback)!", "success");
          }
        };
        reader.readAsDataURL(files[0]);
      }
    } catch (err) {
      toast("Error uploading image.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  // Save Product (Create or Edit)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productDescription || !productPrice || !productCategoryId) {
      toast("Please fill in all product fields.", "error");
      return;
    }

    const payload = {
      name: productName,
      description: productDescription,
      price: parseFloat(productPrice),
      categoryId: productCategoryId,
      stock: parseInt(productStock) || 10,
      isFeatured: productFeatured,
      images: productImages,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast(editingProduct ? "Product updated successfully!" : "Product created successfully!", "success");
        setIsProductModalOpen(false);
        resetProductForm();
        loadDashboardData();
      } else {
        const errData = await res.json();
        toast(errData.error || "Failed to save product.", "error");
      }
    } catch (e) {
      toast("Error submitting product.", "error");
    }
  };

  const openEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProductName(prod.name);
    setProductDescription(prod.description);
    setProductPrice(prod.price.toString());
    setProductCategoryId(prod.categoryId);
    setProductStock(prod.stock.toString());
    setProductFeatured(prod.isFeatured);
    setProductImages(prod.images.map((img: any) => img.url));
    setIsProductModalOpen(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductCategoryId("");
    setProductStock("");
    setProductFeatured(false);
    setProductImages([]);
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cake?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("Product deleted successfully.", "success");
        loadDashboardData();
      } else {
        toast("Failed to delete product.", "error");
      }
    } catch (e) {
      toast("Error deleting product.", "error");
    }
  };

  // Save Category
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName }),
      });

      if (res.ok) {
        toast("Category created!", "success");
        setCategoryName("");
        setIsCategoryModalOpen(false);
        loadDashboardData();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to create category.", "error");
      }
    } catch (e) {
      toast("Error saving category.", "error");
    }
  };

  // Save Coupon
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponDiscountValue) return;

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          discountType: couponDiscountType,
          discountValue: parseFloat(couponDiscountValue),
          minOrderValue: couponMinOrderValue ? parseFloat(couponMinOrderValue) : 0,
        }),
      });

      if (res.ok) {
        toast("Coupon created successfully!", "success");
        setCouponCode("");
        setCouponDiscountValue("");
        setCouponMinOrderValue("");
        setIsCouponModalOpen(false);
        loadDashboardData();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to create coupon.", "error");
      }
    } catch (e) {
      toast("Error saving coupon.", "error");
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Remove this coupon?")) return;
    try {
      const res = await fetch(`/api/coupons?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast("Coupon deleted.", "success");
        loadDashboardData();
      } else {
        toast("Failed to delete coupon.", "error");
      }
    } catch (e) {
      toast("Error removing coupon.", "error");
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast("Order status updated successfully!", "success");
        loadDashboardData();
      } else {
        toast("Failed to update status.", "error");
      }
    } catch (e) {
      toast("Error updating order status.", "error");
    }
  };

  // Save Homepage layout customization settings
  const handleHomeSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHome(true);
    try {
      const res = await fetch("/api/admin/home-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroHeadline: homeHeadline,
          heroSubtitle: homeSubtitle,
          heroCta1Label: homeCta1Label,
          heroCta2Label: homeCta2Label,
          heroImageUrl: homeImageUrl,
        }),
      });

      if (res.ok) {
        toast("Homepage customized successfully!", "success");
        loadDashboardData();
      } else {
        toast("Failed to update homepage settings.", "error");
      }
    } catch (err) {
      toast("Error saving homepage settings.", "error");
    } finally {
      setIsSavingHome(false);
    }
  };

  // Derive Client Customers from orders DB records
  const uniqueCustomers = Array.from(
    new Map(
      orders.map((o) => [
        o.shippingEmail,
        {
          name: o.shippingName,
          email: o.shippingEmail,
          phone: o.shippingPhone,
          totalOrders: 0,
          totalSpent: 0,
        },
      ])
    ).values()
  );

  orders.forEach((o) => {
    const cust = uniqueCustomers.find((c) => c.email === o.shippingEmail);
    if (cust) {
      cust.totalOrders += 1;
      cust.totalSpent += o.totalAmount;
    }
  });

  // Extract all Reviews from product lists
  const allReviews = products.flatMap(
    (p) => p.reviews?.map((r: any) => ({ ...r, productName: p.name })) || []
  );

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.shippingName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.shippingEmail.toLowerCase().includes(orderSearchQuery.toLowerCase());
    
    const matchesStatus = orderFilterStatus === "ALL" || o.status === orderFilterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary gap-4">
        <Loader className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">
          Loading Registry...
        </span>
      </div>
    );
  }

  // Sidebar Tabs Config
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "products", label: "Products", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "customers", label: "Customers", icon: <Users className="w-4 h-4" /> },
    { id: "categories", label: "Categories", icon: <FolderOpen className="w-4 h-4" /> },
    { id: "coupons", label: "Coupons", icon: <Tag className="w-4 h-4" /> },
    { id: "reviews", label: "Reviews", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "homepage", label: "Homepage", icon: <Sparkles className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex bg-secondary transition-colors duration-300">
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <aside 
        className={`bg-card border-r border-border flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        } shrink-0 sticky top-0 h-screen`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-foreground">Boutique Console</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-foreground/45">Operations Control</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-secondary text-foreground/60 hover:text-foreground cursor-pointer"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4.5 h-4.5" /> : <ChevronLeft className="w-4.5 h-4.5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive 
                    ? "bg-secondary text-foreground shadow-sm" 
                    : "text-foreground/50 hover:bg-secondary/40 hover:text-foreground"
                } ${isSidebarCollapsed ? "justify-center" : ""}`}
                title={tab.label}
              >
                {tab.icon}
                {!isSidebarCollapsed && <span>{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Admin Tag */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-border bg-secondary/50 text-[10px] text-foreground/50 text-center uppercase tracking-wider font-semibold">
            Root Terminal v1.0
          </div>
        )}
      </aside>

      {/* 2. MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col overflow-y-auto h-screen p-8 sm:p-12 gap-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div className="text-left flex flex-col gap-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/40">Administrative Portal</span>
            <h1 className="font-serif text-3xl font-bold capitalize">
              {activeTab === "homepage" ? "Homepage Customization" : `${activeTab} Manager`}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {activeTab === "products" && (
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="py-2.5 px-5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            )}
            {activeTab === "categories" && (
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="py-2.5 px-5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            )}
            {activeTab === "coupons" && (
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="py-2.5 px-5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Coupon
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            TAB: DASHBOARD
           ======================================================== */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-10">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-foreground/40">Gross Revenue</span>
                  <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                    ₹{(analytics?.totalRevenue || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center"><DollarSign className="w-4 h-4 text-foreground/60" /></div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-foreground/40">Active Orders</span>
                  <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                    {orders.filter((o) => o.status !== "DELIVERED").length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center"><ClipboardList className="w-4 h-4 text-foreground/60" /></div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-foreground/40">Patron Accounts</span>
                  <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                    {uniqueCustomers.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center"><Users className="w-4 h-4 text-foreground/60" /></div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-foreground/40">Products Catalog</span>
                  <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                    {products.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center"><ShoppingBag className="w-4 h-4 text-foreground/60" /></div>
              </div>
            </div>

            {/* Custom SVG Revenue trend line & list grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sales Graph Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col gap-4 text-left">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Revenue Analytics</h3>
                    <p className="text-[10px] text-foreground/40 mt-0.5">Real-time daily transaction curves</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold bg-emerald-500/10 py-1.5 px-3 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5" /> +14.2%
                  </div>
                </div>

                {/* Custom Sparkline Chart */}
                <div className="w-full h-48 bg-secondary/35 rounded-xl border border-border overflow-hidden relative p-4 flex items-end">
                  <svg className="w-full h-full absolute inset-0 text-foreground" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,90 Q 20,40 40,65 T 80,25 T 100,10 L 100,100 L 0,100 Z"
                      fill="url(#chartGrad)"
                    />
                    <path
                      d="M 0,90 Q 20,40 40,65 T 80,25 T 100,10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    />
                  </svg>
                  <div className="flex justify-between w-full text-[8px] uppercase tracking-widest text-foreground/40 font-bold z-10 px-1">
                    <span>Q1 Start</span>
                    <span>Mid Semester</span>
                    <span>Live Closing</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-left">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Recent Orders</h3>
                  <p className="text-[10px] text-foreground/40 mt-0.5">Live checkouts timeline</p>
                </div>

                <div className="flex flex-col gap-3.5 divide-y divide-border">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="flex justify-between items-center text-xs pt-3.5 first:pt-0">
                      <div>
                        <p className="font-bold text-foreground truncate max-w-[120px]">{order.shippingName}</p>
                        <p className="text-[9px] text-foreground/40 font-bold mt-0.5 uppercase tracking-wider">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider py-1 px-3 rounded-full bg-secondary border border-border">
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB: PRODUCTS
           ======================================================== */}
        {activeTab === "products" && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/40 text-[9px] uppercase tracking-widest text-foreground/50 border-b border-border">
                    <th className="p-4.5 font-bold">Cakes Details</th>
                    <th className="p-4.5 font-bold">Category</th>
                    <th className="p-4.5 font-bold text-right">Price</th>
                    <th className="p-4.5 font-bold text-center">In-Stock</th>
                    <th className="p-4.5 font-bold text-center">Featured</th>
                    <th className="p-4.5 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-secondary/15 transition-colors">
                      <td className="p-4.5 flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-secondary rounded-lg overflow-hidden border border-border shrink-0">
                          <img
                            src={prod.images && prod.images.length > 0 ? prod.images[0].url : "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{prod.name}</p>
                          <p className="text-[10px] text-foreground/45 max-w-xs truncate leading-normal">{prod.description}</p>
                        </div>
                      </td>
                      <td className="p-4.5 uppercase font-bold text-[9px] tracking-wider text-foreground/60">{prod.category.name}</td>
                      <td className="p-4.5 font-bold text-right text-foreground">₹{prod.price.toLocaleString("en-IN")}</td>
                      <td className="p-4.5 font-bold text-center text-foreground">{prod.stock}</td>
                      <td className="p-4.5 text-center">
                        <span className={`text-[8px] uppercase tracking-wider py-1 px-2.5 rounded-full font-bold ${
                          prod.isFeatured ? "bg-emerald-500/10 text-emerald-600" : "bg-foreground/5 text-foreground/50"
                        }`}>
                          {prod.isFeatured ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="p-4.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditProduct(prod)}
                            className="p-2 rounded-lg border border-border hover:bg-secondary text-foreground/60 hover:text-foreground cursor-pointer"
                            title="Edit Cake"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 rounded-lg border border-border hover:bg-red-50 text-red-500 cursor-pointer"
                            title="Delete Cake"
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
        )}

        {/* ========================================================
            TAB: ORDERS
           ======================================================== */}
        {activeTab === "orders" && (
          <div className="flex flex-col gap-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <input
                type="text"
                placeholder="Search orders (ID, Name, Email)..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full sm:max-w-md bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary shadow-sm font-semibold"
              />

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-[10px] uppercase font-bold text-foreground/45 tracking-widest hidden sm:inline">Status Filter:</span>
                <select
                  value={orderFilterStatus}
                  onChange={(e) => setOrderFilterStatus(e.target.value)}
                  className="bg-card border border-border rounded-xl py-2.5 px-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary text-foreground/80 shadow-sm cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="BAKING">Baking</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders list table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 text-[9px] uppercase tracking-widest text-foreground/50 border-b border-border">
                      <th className="p-4.5 font-bold">Order ID</th>
                      <th className="p-4.5 font-bold">Customer Details</th>
                      <th className="p-4.5 font-bold text-center">Delivery Date</th>
                      <th className="p-4.5 font-bold text-right">Grand Total</th>
                      <th className="p-4.5 font-bold text-center">Status</th>
                      <th className="p-4.5 font-bold text-center">Method</th>
                      <th className="p-4.5 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-secondary/15 transition-colors">
                        <td className="p-4.5 font-mono text-[10px] text-foreground/60">{o.id}</td>
                        <td className="p-4.5">
                          <p className="font-bold text-foreground">{o.shippingName}</p>
                          <p className="text-[10px] text-foreground/45 mt-0.5">{o.shippingEmail} &bull; {o.shippingPhone}</p>
                        </td>
                        <td className="p-4.5 text-center font-bold text-foreground">{o.deliveryDate}</td>
                        <td className="p-4.5 font-bold text-right text-foreground">₹{o.totalAmount.toLocaleString("en-IN")}</td>
                        <td className="p-4.5 text-center">
                          <span className={`text-[8px] uppercase tracking-widest py-1 px-3 rounded-full font-bold ${
                            o.status === "DELIVERED"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/10"
                              : o.status === "BAKING"
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/10"
                              : o.status === "OUT_FOR_DELIVERY"
                              ? "bg-blue-500/10 text-blue-600 border border-blue-500/10"
                              : o.status === "CANCELLED"
                              ? "bg-red-500/10 text-red-600"
                              : "bg-foreground/5 text-foreground/50 border border-border"
                          }`}>
                            {o.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-4.5 text-center uppercase text-[8px] font-bold text-foreground/60">{o.paymentMethod}</td>
                        <td className="p-4.5 text-center">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-secondary border border-border rounded-lg py-1.5 px-2.5 text-[9px] font-bold uppercase tracking-wider focus:outline-none focus:border-primary text-foreground/75 cursor-pointer shadow-sm"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="BAKING">Baking</option>
                            <option value="OUT_FOR_DELIVERY">Dispatch</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancel</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: CUSTOMERS
           ======================================================== */}
        {activeTab === "customers" && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm text-left">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/40 text-[9px] uppercase tracking-widest text-foreground/50 border-b border-border">
                    <th className="p-4.5 font-bold">Patron Name</th>
                    <th className="p-4.5 font-bold">Email Address</th>
                    <th className="p-4.5 font-bold">Phone Connection</th>
                    <th className="p-4.5 font-bold text-center">Orders Count</th>
                    <th className="p-4.5 font-bold text-right">LTV spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {uniqueCustomers.map((cust, i) => (
                    <tr key={i} className="hover:bg-secondary/15 transition-colors">
                      <td className="p-4.5 font-bold text-foreground">{cust.name}</td>
                      <td className="p-4.5 font-mono text-[10px] text-foreground/60">{cust.email}</td>
                      <td className="p-4.5 font-semibold text-foreground/75">{cust.phone || "Not Shared"}</td>
                      <td className="p-4.5 font-bold text-center text-foreground">{cust.totalOrders}</td>
                      <td className="p-4.5 font-bold text-right text-foreground">₹{cust.totalSpent.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: CATEGORIES
           ======================================================== */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold border-b border-border pb-3.5 mb-4 text-foreground">Boutique Categories</h3>
              <div className="flex flex-col gap-3.5">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                    <div>
                      <p className="font-bold text-foreground">{cat.name}</p>
                      <p className="text-[10px] text-foreground/45 mt-0.5 font-semibold">Slug: {cat.slug}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: COUPONS
           ======================================================== */}
        {activeTab === "coupons" && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm text-left">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/40 text-[9px] uppercase tracking-widest text-foreground/50 border-b border-border">
                    <th className="p-4.5 font-bold">Promo Code</th>
                    <th className="p-4.5 font-bold text-center">Type</th>
                    <th className="p-4.5 font-bold text-right">Value</th>
                    <th className="p-4.5 font-bold text-right">Min Order Requirement</th>
                    <th className="p-4.5 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-secondary/15 transition-colors">
                      <td className="p-4.5 font-mono font-bold tracking-widest text-foreground text-xs uppercase">{c.code}</td>
                      <td className="p-4.5 text-center uppercase font-bold text-[9px] text-foreground/55">{c.discountType}</td>
                      <td className="p-4.5 font-bold text-right text-foreground">
                        {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                      </td>
                      <td className="p-4.5 font-bold text-right text-foreground">₹{c.minOrderValue.toLocaleString("en-IN")}</td>
                      <td className="p-4.5 text-center">
                        <button
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="p-2 rounded-lg border border-border hover:bg-red-50 text-red-500 cursor-pointer"
                          title="Remove Promo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: REVIEWS
           ======================================================== */}
        {activeTab === "reviews" && (
          <div className="flex flex-col gap-6 text-left">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold border-b border-border pb-3.5 mb-6 text-foreground">Patron Reviews Moderation</h3>
              
              <div className="flex flex-col gap-6">
                {allReviews.map((rev) => (
                  <div key={rev.id} className="p-5 border border-border bg-secondary/20 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-foreground">{rev.authorName}</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-0.5">Cake: {rev.productName}</p>
                      </div>
                      <span className="text-[9px] text-foreground/45 font-bold uppercase tracking-wider">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>

                    <p className="text-xs text-foreground/75 leading-relaxed italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: HOMEPAGE CUSTOMIZATION
           ======================================================== */}
        {activeTab === "homepage" && (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-left max-w-2xl flex flex-col gap-6 animate-slide-in">
            <h3 className="font-serif text-lg font-bold border-b border-border pb-3.5 text-foreground">Boutique Hero Customizer</h3>

            <form onSubmit={handleHomeSettingsSubmit} className="flex flex-col gap-5 text-xs">
              <div>
                <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Hero Headline (Supports line breaks)</label>
                <textarea
                  required
                  rows={2}
                  value={homeHeadline}
                  onChange={(e) => setHomeHeadline(e.target.value)}
                  placeholder="Cakes made as fine art."
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:outline-none mt-1.5 shadow-sm resize-none leading-relaxed font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Hero Subtitle & Description</label>
                <textarea
                  required
                  rows={3}
                  value={homeSubtitle}
                  onChange={(e) => setHomeSubtitle(e.target.value)}
                  placeholder="Welcome to Sweet Delights..."
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:outline-none mt-1.5 shadow-sm resize-none leading-relaxed font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Primary CTA Button Label</label>
                  <input
                    type="text"
                    required
                    value={homeCta1Label}
                    onChange={(e) => setHomeCta1Label(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:outline-none mt-1.5 shadow-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Secondary CTA Button Label</label>
                  <input
                    type="text"
                    required
                    value={homeCta2Label}
                    onChange={(e) => setHomeCta2Label(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:outline-none mt-1.5 shadow-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Hero Image URL (or upload local file)</label>
                <div className="flex gap-4 items-center mt-1.5">
                  <input
                    type="text"
                    required
                    value={homeImageUrl}
                    onChange={(e) => setHomeImageUrl(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:outline-none shadow-sm font-semibold"
                  />
                  
                  <label className="py-2.5 px-4 rounded-xl border border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer shrink-0 text-foreground font-bold uppercase tracking-widest text-[9px] shadow-sm">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (reader.result) {
                            setHomeImageUrl(reader.result as string);
                            toast("Homepage Hero Image selected!", "success");
                          }
                        };
                        reader.readAsDataURL(files[0]);
                      }}
                      className="hidden"
                    />
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </label>
                </div>
                
                {homeImageUrl && (
                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-border mt-3 bg-secondary">
                    <img src={homeImageUrl} className="w-full h-full object-cover" alt="Hero Preview" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSavingHome}
                className="py-3 px-6 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all self-start mt-2 cursor-pointer disabled:opacity-50 animate-pulse-once"
              >
                {isSavingHome ? "Saving..." : "Save Customization"}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            TAB: ANALYTICS
           ======================================================== */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            {/* Top Products */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground border-b border-border pb-3.5">Top-Selling Cakes</h3>
              <div className="flex flex-col gap-4">
                {products.slice(0, 4).map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xs text-foreground/45 w-4">#{idx+1}</span>
                      <p className="font-bold text-foreground text-xs">{p.name}</p>
                    </div>
                    <span className="font-bold text-xs text-foreground">₹{p.price.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance metrics overview */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground border-b border-border pb-3.5">Key Performance Ratios</h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs mt-2">
                <div className="p-4 bg-secondary rounded-xl border border-border">
                  <p className="text-foreground/50">Average Transaction Size</p>
                  <p className="font-bold text-base mt-1 text-foreground">₹1,950</p>
                </div>

                <div className="p-4 bg-secondary rounded-xl border border-border">
                  <p className="text-foreground/50">Returning Customer Share</p>
                  <p className="font-bold text-base mt-1 text-foreground">42.5%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: SETTINGS
           ======================================================== */}
        {activeTab === "settings" && (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-left max-w-2xl flex flex-col gap-6">
            <h3 className="font-serif text-lg font-bold border-b border-border pb-3.5 text-foreground">Shop Operational Parameters</h3>

            <div className="flex flex-col gap-5 text-xs">
              <div>
                <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">VAT / CGST + SGST Tax percentage (%)</label>
                <input
                  type="text"
                  value={boutiqueTax}
                  onChange={(e) => setBoutiqueTax(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:outline-none mt-1.5 shadow-sm font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Free Delivery Minimum Threshold (₹)</label>
                <input
                  type="text"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:outline-none mt-1.5 shadow-sm font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Checkout Notice Alert Text</label>
                <textarea
                  value={checkoutNotice}
                  onChange={(e) => setCheckoutNotice(e.target.value)}
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 focus:outline-none mt-1.5 shadow-sm resize-none leading-relaxed font-semibold"
                />
              </div>

              <button
                onClick={() => toast("Administrative parameters updated successfully!", "success")}
                className="py-3 px-6 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all self-start mt-2 cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================
          DIALOG PRODUCT MODAL
         ======================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-8 flex flex-col gap-5 shadow-2xl relative z-10 animate-slide-in text-left max-h-[85vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-border pb-3.5">
              <h2 className="font-serif text-lg font-bold text-foreground">
                {editingProduct ? "Modify Product Details" : "Create Artisan Cake"}
              </h2>
              <button 
                onClick={() => setIsProductModalOpen(false)} 
                className="p-1 rounded-full hover:bg-secondary text-foreground/50 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Cake Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Gourmet Raspberry Cream Cake"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 mt-1 focus:outline-none shadow-sm font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Category *</label>
                <select
                  required
                  value={productCategoryId}
                  onChange={(e) => setProductCategoryId(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 mt-1 focus:outline-none cursor-pointer font-semibold shadow-sm text-foreground/80"
                >
                  <option value="">Choose Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1200"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 mt-1 focus:outline-none font-semibold shadow-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Stock Available *</label>
                  <input
                    type="number"
                    required
                    placeholder="15"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 mt-1 focus:outline-none font-semibold shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Description & Flavors *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Artisanal description with flavor layering..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 mt-1 focus:outline-none resize-none shadow-sm leading-relaxed font-semibold"
                />
              </div>

              {/* Multi-Image Drag-and-Drop / Upload */}
              <div className="flex flex-col gap-2.5">
                <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Cake Images (Drag/Upload Multiple)</label>
                <div className="flex flex-wrap gap-2.5 items-center mt-1">
                  
                  {/* Preview uploaded thumbs */}
                  {productImages.map((imgUrl, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl border border-border overflow-hidden shrink-0">
                      <img src={imgUrl} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(i)}
                        className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] hover:bg-red-600 transition-colors"
                        title="Remove Image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Drag-drop selector container */}
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-foreground flex flex-col items-center justify-center cursor-pointer transition-all text-foreground/45 hover:text-foreground bg-secondary shrink-0">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    {isUploading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-4.5 h-4.5" />
                        <span className="text-[7px] font-bold uppercase mt-1">Upload</span>
                      </>
                    )}
                  </label>

                </div>
              </div>

              {/* Display Featured block */}
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={productFeatured}
                  onChange={(e) => setProductFeatured(e.target.checked)}
                  className="text-primary focus:ring-primary rounded"
                />
                <span className="font-bold text-foreground/75 select-none leading-none">
                  Display in Featured Showcase on Home
                </span>
              </label>

              {/* Modal Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="py-3 px-4 rounded-xl border border-border text-foreground font-bold uppercase tracking-widest text-[9px] hover:bg-secondary transition-all text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold uppercase tracking-widest text-[9px] shadow-md transition-all text-center cursor-pointer"
                >
                  {editingProduct ? "Save Changes" : "Create Cake"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================
          DIALOG CATEGORY MODAL
         ======================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 flex flex-col gap-4 shadow-2xl relative z-10 animate-slide-in text-left">
            <div className="flex justify-between items-center border-b border-border pb-3.5">
              <h2 className="font-serif text-base font-bold text-foreground">Add Category</h2>
              <button 
                onClick={() => setIsCategoryModalOpen(false)} 
                className="p-1 rounded-full hover:bg-secondary text-foreground/50 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="flex flex-col gap-4 text-xs">
              <input
                type="text"
                required
                placeholder="Category name (e.g. Sugar-Free Cakes)"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none font-semibold shadow-sm"
              />
              <button type="submit" className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[9px] rounded-xl shadow-md transition-all cursor-pointer">
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DIALOG COUPON MODAL
         ======================================================== */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setIsCouponModalOpen(false)} />
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 flex flex-col gap-4 shadow-2xl relative z-10 animate-slide-in text-left">
            <div className="flex justify-between items-center border-b border-border pb-3.5">
              <h2 className="font-serif text-base font-bold text-foreground">Add Coupon</h2>
              <button 
                onClick={() => setIsCouponModalOpen(false)} 
                className="p-1 rounded-full hover:bg-secondary text-foreground/50 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <form onSubmit={handleCouponSubmit} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Promo Code *</label>
                <input
                  type="text"
                  required
                  placeholder="SWEET15"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 mt-1 focus:outline-none uppercase font-bold tracking-widest shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Type *</label>
                  <select
                    value={couponDiscountType}
                    onChange={(e) => setCouponDiscountType(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-2.5 py-2.5 mt-1 focus:outline-none cursor-pointer font-bold shadow-sm"
                  >
                    <option value="PERCENTAGE">Percent (%)</option>
                    <option value="FIXED">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Value *</label>
                  <input
                    type="number"
                    required
                    placeholder="15"
                    value={couponDiscountValue}
                    onChange={(e) => setCouponDiscountValue(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 mt-1 focus:outline-none font-semibold shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground/60 uppercase tracking-widest text-[9px]">Min Order Requirement (₹)</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={couponMinOrderValue}
                  onChange={(e) => setCouponMinOrderValue(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 mt-1 focus:outline-none font-semibold shadow-sm"
                />
              </div>

              <button type="submit" className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[9px] rounded-xl shadow-md transition-all cursor-pointer">
                Create Coupon
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
