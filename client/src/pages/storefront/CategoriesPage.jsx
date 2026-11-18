import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

// Core Nishorama-style Curated Categories matching Image 2
const DEFAULT_CATEGORIES = [
  {
    id: 'most-wanted',
    title: 'Most Wanted',
    slug: 'most-wanted',
    link: '/products?sort=popular',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=85',
    tag: 'Trending Now',
  },
  {
    id: 'kurtis',
    title: 'Kurtis',
    slug: 'kurtis',
    link: '/category/kurtis',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=85',
    tag: 'Casual & Festive',
  },
  {
    id: 'sets',
    title: 'Sets',
    slug: 'sets',
    link: '/products?search=Sets',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=85',
    tag: 'Co-ord Sets',
  },
  {
    id: 'bottoms',
    title: 'Bottoms',
    slug: 'bottoms',
    link: '/products?search=Bottoms',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=85',
    tag: 'Palazzos & Pants',
  },
  {
    id: 'tops',
    title: 'Tops',
    slug: 'tops',
    link: '/products?search=Tops',
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=900&auto=format&fit=crop&q=85',
    tag: 'Designer Tunics',
  },
  {
    id: 'dresses',
    title: 'Dresses',
    slug: 'dresses',
    link: '/category/dresses',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&auto=format&fit=crop&q=85',
    tag: 'Gowns & Fits',
  },
  {
    id: 'pure-silk-sarees',
    title: 'Pure Silk Sarees',
    slug: 'sarees',
    link: '/category/sarees',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&auto=format&fit=crop&q=85',
    tag: 'Aaradhya Silks',
  },
  {
    id: 'running-fabrics',
    title: 'Running Fabrics',
    slug: 'fabrics',
    link: '/category/fabrics',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=900&auto=format&fit=crop&q=85',
    tag: 'Aaradhya Fabrics',
  },
  {
    id: 'dress-materials',
    title: 'Dress Materials',
    slug: 'dress-materials',
    link: '/category/dress-materials',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&auto=format&fit=crop&q=85',
    tag: 'Unstitched Luxury',
  },
  {
    id: 'mens-wear',
    title: "Men's Wear",
    slug: 'mens-wear',
    link: '/products?category=mens-wear',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=900&auto=format&fit=crop&q=85',
    tag: 'Silk Kurtas & Dhotis',
  },
  {
    id: 'kids-wear',
    title: 'Kids Wear',
    slug: 'kids-wear',
    link: '/products?category=kids-wear',
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=900&auto=format&fit=crop&q=85',
    tag: 'Pattu Pavadai & Kurtas',
  },
  {
    id: 'festive-offers',
    title: 'Festive Offers',
    slug: 'offers',
    link: '/products?deal=flash',
    image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=900&auto=format&fit=crop&q=85',
    tag: 'Up to 50% OFF',
  },
];

const CategoriesPage = () => {
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get('/categories');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Merge dynamic backend categories with default visual layouts
          const backendCats = res.data.map((cat, idx) => ({
            id: cat._id || `cat-${idx}`,
            title: cat.name,
            slug: cat.slug,
            link: `/category/${cat.slug}`,
            image:
              cat.image ||
              DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length].image,
            tag: `${cat.productCount || 0} Products`,
          }));

          // Deduplicate and combine
          const merged = [...DEFAULT_CATEGORIES];
          backendCats.forEach((bCat) => {
            const exists = merged.find(
              (m) =>
                m.slug.toLowerCase() === bCat.slug.toLowerCase() ||
                m.title.toLowerCase() === bCat.title.toLowerCase()
            );
            if (!exists) {
              merged.push(bCat);
            }
          });
          setCategoriesList(merged);
        }
      } catch (err) {
        console.warn('Using default high-fashion categories list');
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="categories-page-wrapper py-3 py-md-4">
      <div className="container-fluid px-3 px-sm-4 px-lg-5">
        {/* Header Title Section */}
        <div className="d-flex align-items-center justify-content-between mb-3 mb-md-4">
          <div>
            <h1
              className="fw-bold mb-1 text-dark"
              style={{
                fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)',
                letterSpacing: '-0.4px',
                fontFamily: 'var(--font-heading-family)',
              }}
            >
              Explore Categories
            </h1>
            <p className="text-muted small mb-0" style={{ fontSize: '0.88rem' }}>
              Handpicked silk weaves, designer kurtis, running textiles and coordinates.
            </p>
          </div>
          <Link
            to="/products"
            className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1.5 fw-semibold small d-none d-sm-inline-flex align-items-center gap-1.5"
            style={{ fontSize: '0.84rem' }}
          >
            <span>All Products</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* 2-Column Mobile, 4-Column Desktop Categories Grid matching Nishorama */}
        <div className="categories-grid-container mb-5">
          {categoriesList.map((cat, index) => (
            <motion.div
              key={cat.id || index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
            >
              <Link to={cat.link} className="category-nish-card">
                <img src={cat.image} alt={cat.title} loading="lazy" />
                <div className="card-title-overlay">
                  <div className="text-center">
                    <span className="category-title-text d-block">
                      {cat.title}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
