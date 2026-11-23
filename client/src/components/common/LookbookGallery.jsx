import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Heart,
  MessageCircle,
  ShoppingBag,
  Check,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  Camera,
  Sparkles,
  Music2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import axiosClient from '../../api/axiosClient';

const LookbookGallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [feedItems, setFeedItems] = useState([]);
  const [activeStore, setActiveStore] = useState('all'); // 'all' | 'silks' | 'fabrics'
  const [activeType, setActiveType] = useState('all'); // 'all' | 'reels' | 'photos'
  const [loading, setLoading] = useState(true);
  const [isAutoScrollActive, setIsAutoScrollActive] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Shoppable Modal state
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [modalAdded, setModalAdded] = useState(false);
  const [likedMap, setLikedMap] = useState({});
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const carouselRef = useRef(null);
  const videoRef = useRef(null);
  const animFrameId = useRef(null);

  // Fetch verified Instagram feed
  const fetchInstagramFeed = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/instagram/feed?type=${activeType}&store=${activeStore}&limit=24`);
      if (res.success && res.data?.items) {
        setFeedItems(res.data.items);
      }
    } catch (err) {
      console.warn('Could not fetch Instagram feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstagramFeed();
  }, [activeType, activeStore]);

  // Guaranteed Smooth Video Playback on Modal Open
  useEffect(() => {
    if (activeModalItem && activeModalItem.isReel && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isVideoMuted;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsVideoPlaying(true))
          .catch((err) => {
            console.warn('Autoplay notice:', err.message);
            setIsVideoPlaying(false);
          });
      }
    }
  }, [activeModalItem, isVideoMuted]);

  // Butter-Smooth Continuous Auto-Scroll Engine (60fps requestAnimationFrame)
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || !isAutoScrollActive || isHovered || feedItems.length === 0) {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      return;
    }

    let speed = 1.0; // Pixels per frame

    const step = () => {
      if (el) {
        el.scrollLeft += speed;
        // Seamless infinite loop when reaching midpoint
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      animFrameId.current = requestAnimationFrame(step);
    };

    animFrameId.current = requestAnimationFrame(step);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isAutoScrollActive, isHovered, feedItems]);

  // Manual Scroll Buttons
  const scrollManual = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = 340;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Video playback in modal
  const toggleVideoPlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleVideoMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsVideoMuted(videoRef.current.muted);
  };

  const handleToggleLike = (itemId, e) => {
    e.stopPropagation();
    setLikedMap((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleModalAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login', {
        state: {
          message: 'Please sign in to add items to your cart.',
          returnUrl: window.location.pathname,
        },
      });
      return;
    }

    addToCart(product, 1);
    setModalAdded(true);
    setTimeout(() => setModalAdded(false), 2000);
  };

  // Duplicate items for infinite seamless auto-scroller loop
  const displayItems = feedItems.length > 0 ? [...feedItems, ...feedItems] : [];

  return (
    <section className="mb-5 lookbook-section w-100 overflow-hidden" id="lookbook-gallery">
      <div className="container">
        {/* Top Header & Store Handles */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <span
                className="badge rounded-pill text-white px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
                style={{
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  fontSize: '0.78rem',
                }}
              >
                <FaInstagram size={14} /> LIVE INSTAGRAM REELS & POSTS
              </span>
              <span className="badge bg-dark rounded-pill px-2.5 py-1 text-white small">
                Auto-Scrolling Carousel
              </span>
            </div>

            <h3
              className="fw-bold mb-0 text-dark"
              style={{
                fontFamily: 'var(--font-heading-family)',
                letterSpacing: '-0.3px',
                fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)',
              }}
            >
              Moments in Aaradhya
            </h3>
            <p className="text-secondary small mb-0">
              Watch trending reels, drape walks, and heirloom silk showcases straight from our Instagram channels.
            </p>
          </div>

          {/* Dual Store Links */}
          <div className="d-flex gap-2 flex-wrap">
            <a
              href="https://www.instagram.com/aaradhya_silks_kphb?vrfl=MWQ4OG5lNnFpY3Bzbg=="
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
              style={{ fontSize: '0.78rem' }}
            >
              <FaInstagram size={13} className="text-danger" />
              <span>@aaradhya_silks_kphb</span>
              <ExternalLink size={11} />
            </a>

            <a
              href="https://www.instagram.com/aaradhya_fabrics?xtok=cTN3aXVtZnFnY2ls"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
              style={{ fontSize: '0.78rem' }}
            >
              <FaInstagram size={13} className="text-danger" />
              <span>@aaradhya_fabrics</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Carousel Filter & Controls Toolbar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          {/* Store Switcher */}
          <div className="d-flex gap-1.5 align-items-center">
            <div className="btn-group btn-group-sm bg-white border p-1 rounded-pill shadow-sm">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeStore === 'all' ? 'btn-dark text-white' : 'btn-light text-muted'}`}
                onClick={() => setActiveStore('all')}
              >
                All Channels
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeStore === 'silks' ? 'btn-dark text-white' : 'btn-light text-muted'}`}
                onClick={() => setActiveStore('silks')}
              >
                Aaradhya Silks
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeStore === 'fabrics' ? 'btn-dark text-white' : 'btn-light text-muted'}`}
                onClick={() => setActiveStore('fabrics')}
              >
                Aaradhya Fabrics
              </button>
            </div>

            {/* Type Filter */}
            <div className="btn-group btn-group-sm bg-white border p-1 rounded-pill shadow-sm d-none d-sm-inline-flex">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-2.5 ${activeType === 'all' ? 'btn-dark text-white' : 'btn-light text-muted'}`}
                onClick={() => setActiveType('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-2.5 d-flex align-items-center gap-1 ${activeType === 'reels' ? 'btn-dark text-white' : 'btn-light text-muted'}`}
                onClick={() => setActiveType('reels')}
              >
                <Video size={12} />
                <span>Reels 🎬</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-2.5 d-flex align-items-center gap-1 ${activeType === 'photos' ? 'btn-dark text-white' : 'btn-light text-muted'}`}
                onClick={() => setActiveType('photos')}
              >
                <Camera size={12} />
                <span>Posts 📸</span>
              </button>
            </div>
          </div>

          {/* Auto-Scroll Controls & Manual Arrows */}
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1.5 border small ${
                isAutoScrollActive ? 'btn-light text-dark fw-bold' : 'btn-outline-secondary'
              }`}
              style={{ fontSize: '0.74rem' }}
              onClick={() => setIsAutoScrollActive(!isAutoScrollActive)}
            >
              {isAutoScrollActive ? (
                <>
                  <Pause size={12} className="text-danger" />
                  <span>Pause Scroll</span>
                </>
              ) : (
                <>
                  <Play size={12} className="text-success" />
                  <span>Auto-Scroll</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-sm btn-light border rounded-circle p-1.5 shadow-sm text-dark"
              onClick={() => scrollManual('left')}
              title="Scroll Left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-light border rounded-circle p-1.5 shadow-sm text-dark"
              onClick={() => scrollManual('right')}
              title="Scroll Right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 2. BUTTER-SMOOTH AUTO-SCROLLING HORIZONTAL CAROUSEL */}
        <div
          ref={carouselRef}
          className="d-flex gap-3 overflow-hidden py-2 position-relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          style={{
            scrollBehavior: 'auto',
            userSelect: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {loading ? (
            <div className="py-5 text-center w-100 text-muted">
              <div className="spinner-border spinner-border-sm text-primary me-2"></div>
              Loading live Instagram carousel...
            </div>
          ) : (
            displayItems.map((item, idx) => {
              const isLiked = !!likedMap[item._id || item.instagramId];
              return (
                <div
                  key={`${item.instagramId || idx}-${idx}`}
                  className="flex-shrink-0 cursor-pointer"
                  style={{
                    width: 'clamp(240px, 32vw, 290px)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setActiveModalItem(item);
                    setIsVideoPlaying(true);
                    setIsVideoMuted(true);
                  }}
                >
                  <div
                    className="card border-0 rounded-4 overflow-hidden shadow-sm h-100 position-relative insta-card-hover"
                    style={{
                      backgroundColor: '#FFFFFF',
                      transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease',
                    }}
                  >
                    {/* Vertical 9:16 Media Container for true Instagram Reels aesthetic */}
                    <div
                      className="position-relative overflow-hidden bg-black"
                      style={{ paddingTop: '150%' }} // True 9:16 vertical ratio
                    >
                      <img
                        src={item.thumbnailUrl || item.mediaUrl}
                        alt={item.caption}
                        className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                        loading="lazy"
                        style={{ transition: 'transform 0.4s ease' }}
                      />

                      {/* Top Badges */}
                      <div className="position-absolute top-0 start-0 w-100 p-2.5 d-flex justify-content-between align-items-center z-2">
                        <span
                          className="badge rounded-pill px-2.5 py-1 text-white d-flex align-items-center gap-1 shadow"
                          style={{
                            backgroundColor: item.isReel ? '#E90064' : '#17233B',
                            fontSize: '0.68rem',
                          }}
                        >
                          {item.isReel ? (
                            <>
                              <Play size={10} fill="#FFF" /> Reel 🎬
                            </>
                          ) : (
                            <>
                              <FaInstagram size={11} /> Post
                            </>
                          )}
                        </span>

                        <button
                          type="button"
                          className="btn btn-sm p-1 border-0 text-white rounded-circle"
                          style={{ backgroundColor: 'rgba(0,0,0,0.5)', width: '28px', height: '28px' }}
                          onClick={(e) => handleToggleLike(item._id || item.instagramId, e)}
                        >
                          <Heart size={14} fill={isLiked ? '#E90064' : 'none'} color={isLiked ? '#E90064' : '#FFF'} />
                        </button>
                      </div>

                      {/* Play Button Icon for Reels */}
                      {item.isReel && (
                        <div
                          className="position-absolute top-50 start-50 translate-middle rounded-circle d-flex align-items-center justify-content-center text-white"
                          style={{
                            width: '46px',
                            height: '46px',
                            backgroundColor: 'rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(4px)',
                            border: '1.5px solid rgba(255,255,255,0.7)',
                          }}
                        >
                          <Play size={22} fill="#FFF" className="ms-0.5" />
                        </div>
                      )}

                      {/* Bottom Gradient Overlay with Views, Title & Tagged Saree */}
                      <div
                        className="position-absolute bottom-0 start-0 w-100 p-3 text-white d-flex flex-column justify-content-end"
                        style={{
                          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.88) 100%)',
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="badge rounded-pill bg-black bg-opacity-75 text-white small" style={{ fontSize: '0.68rem' }}>
                            @{item.handle}
                          </span>
                          {item.isReel && item.viewsCount > 0 && (
                            <span className="small opacity-90 d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                              <Eye size={12} /> {item.viewsCount.toLocaleString()} views
                            </span>
                          )}
                        </div>

                        <div
                          className="fw-semibold small text-truncate mb-1.5"
                          style={{ fontSize: '0.82rem', lineHeight: '1.25' }}
                        >
                          {item.caption || 'Aaradhya Sarees & Silks Collection'}
                        </div>

                        {/* Tagged Product Pill */}
                        {item.taggedProduct?.name && (
                          <div
                            className="badge rounded-pill bg-white text-dark fw-bold px-2.5 py-1.5 d-inline-flex align-items-center gap-1.5 shadow-sm text-truncate"
                            style={{ fontSize: '0.72rem', maxWidth: '100%' }}
                          >
                            <ShoppingBag size={11} className="text-primary flex-shrink-0" />
                            <span className="text-truncate">Shop: {item.taggedProduct.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. INTERACTIVE SHOPPABLE REEL & POST MODAL */}
      <AnimatePresence>
        {activeModalItem && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
            onClick={() => setActiveModalItem(null)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ duration: 0.25 }}
                className="modal-content rounded-4 overflow-hidden border-0 shadow-lg"
              >
                <div className="row g-0">
                  {/* Left Column: Vertical 9:16 Video Player for Reels or High-Res Photo for Posts */}
                  <div
                    className="col-md-6 bg-black position-relative d-flex align-items-center justify-content-center"
                    style={{ minHeight: '460px', maxHeight: '580px' }}
                  >
                    {activeModalItem.isReel && activeModalItem.videoUrl ? (
                      <div className="w-100 h-100 position-relative d-flex align-items-center justify-content-center">
                        <video
                          ref={videoRef}
                          src={activeModalItem.videoUrl}
                          poster={activeModalItem.thumbnailUrl || activeModalItem.mediaUrl}
                          className="w-100 h-100 object-fit-cover"
                          autoPlay
                          loop
                          playsInline
                          muted={isVideoMuted}
                          onClick={toggleVideoPlay}
                          style={{ cursor: 'pointer' }}
                        />

                        {/* Mute/Unmute audio button */}
                        <div className="position-absolute top-0 end-0 m-3 d-flex gap-2 z-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-dark bg-opacity-75 text-white rounded-circle p-1.5"
                            onClick={toggleVideoMute}
                            title={isVideoMuted ? 'Unmute Audio' : 'Mute Audio'}
                          >
                            {isVideoMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                          </button>
                        </div>

                        {!isVideoPlaying && (
                          <div
                            className="position-absolute top-50 start-50 translate-middle rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{
                              width: '56px',
                              height: '56px',
                              backgroundColor: 'rgba(0,0,0,0.65)',
                              cursor: 'pointer',
                            }}
                            onClick={toggleVideoPlay}
                          >
                            <Play size={26} fill="#FFF" className="ms-1" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <img
                        src={activeModalItem.mediaUrl}
                        alt={activeModalItem.caption}
                        className="w-100 h-100 object-fit-cover"
                        style={{ minHeight: '460px', maxHeight: '580px' }}
                      />
                    )}

                    <span
                      className="position-absolute top-0 start-0 m-3 badge rounded-pill px-3 py-1.5 text-white d-flex align-items-center gap-1.5 shadow"
                      style={{
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        fontSize: '0.74rem',
                      }}
                    >
                      <FaInstagram size={13} /> @{activeModalItem.handle}
                    </span>
                  </div>

                  {/* Right Column: Instagram Post Details + Shoppable Product */}
                  <div className="col-md-6 p-4 d-flex flex-column justify-content-between bg-white">
                    <div>
                      {/* Header with Avatar & Follow */}
                      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                        <div className="d-flex align-items-center gap-2.5">
                          <img
                            src="/logo.jpeg"
                            alt="Aaradhya"
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              objectFit: 'contain',
                              border: '2px solid #E90064',
                              padding: '2px',
                            }}
                          />
                          <div>
                            <div className="d-flex align-items-center gap-1">
                              <span className="fw-bold text-dark small">@{activeModalItem.handle}</span>
                              <span
                                className="badge rounded-circle p-0 d-inline-flex align-items-center justify-content-center text-white"
                                style={{ width: '14px', height: '14px', backgroundColor: '#087CE5', fontSize: '9px' }}
                              >
                                ✓
                              </span>
                            </div>
                            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                              {activeModalItem.location || 'Aaradhya Flagship Store, KPHB Hyderabad'}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <a
                            href={activeModalItem.permalink || `https://www.instagram.com/${activeModalItem.handle}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-0.5 fw-semibold"
                            style={{ fontSize: '0.72rem' }}
                          >
                            Follow
                          </a>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setActiveModalItem(null)}
                            aria-label="Close"
                          ></button>
                        </div>
                      </div>

                      {/* Music Tag for Reels */}
                      {activeModalItem.isReel && activeModalItem.musicTitle && (
                        <div className="d-flex align-items-center gap-1.5 text-muted small mb-2" style={{ fontSize: '0.74rem' }}>
                          <Music2 size={13} className="text-danger" />
                          <span className="text-truncate">{activeModalItem.musicTitle}</span>
                        </div>
                      )}

                      {/* Caption */}
                      <p className="small text-dark mb-2" style={{ lineHeight: '1.45', fontSize: '0.84rem' }}>
                        {activeModalItem.caption}
                      </p>
                      {activeModalItem.hashtags && (
                        <p className="small text-primary mb-3" style={{ fontSize: '0.76rem' }}>
                          {activeModalItem.hashtags}
                        </p>
                      )}

                      {/* Likes & Comments Counter */}
                      <div className="d-flex align-items-center justify-content-between border-top border-bottom py-2 mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <button
                            type="button"
                            className="btn p-0 border-0 d-flex align-items-center gap-1.5"
                            onClick={(e) => handleToggleLike(activeModalItem._id || activeModalItem.instagramId, e)}
                          >
                            <Heart
                              size={18}
                              fill={likedMap[activeModalItem._id || activeModalItem.instagramId] ? '#E90064' : 'none'}
                              color={likedMap[activeModalItem._id || activeModalItem.instagramId] ? '#E90064' : '#17233B'}
                            />
                            <span className="small fw-bold text-dark">
                              {(activeModalItem.likesCount || 2400) +
                                (likedMap[activeModalItem._id || activeModalItem.instagramId] ? 1 : 0)}
                            </span>
                          </button>
                          <span className="d-flex align-items-center gap-1.5 text-muted small">
                            <MessageCircle size={18} /> {activeModalItem.commentsCount || 42}
                          </span>
                        </div>
                        <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          {new Date(activeModalItem.timestamp || Date.now()).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* SHOP THE LOOK TAGGED SAREE CARD */}
                      {activeModalItem.taggedProduct?.name && (
                        <div className="p-3 bg-light rounded-3 border mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="small fw-bold text-dark d-flex align-items-center gap-1">
                              <Sparkles size={13} className="text-primary" /> Shop The Saree in This Reel
                            </span>
                            <span className="badge badge-silks" style={{ fontSize: '0.65rem' }}>
                              {activeModalItem.taggedProduct.storeName || 'Aaradhya Silks'}
                            </span>
                          </div>

                          <div className="d-flex gap-2.5 align-items-center">
                            <img
                              src={activeModalItem.taggedProduct.image}
                              alt={activeModalItem.taggedProduct.name}
                              style={{ width: '56px', height: '68px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <div className="flex-grow-1 text-truncate">
                              <Link
                                to={`/product/${activeModalItem.taggedProduct.slug || activeModalItem.taggedProduct.productId}`}
                                className="fw-semibold text-dark text-truncate d-block text-decoration-none small"
                                onClick={() => setActiveModalItem(null)}
                              >
                                {activeModalItem.taggedProduct.name}
                              </Link>
                              <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                Color: {activeModalItem.taggedProduct.color || 'Heritage Saree'}
                              </div>
                              <div className="d-flex align-items-center gap-2 mt-0.5">
                                <span className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>
                                  ₹{activeModalItem.taggedProduct.price?.toLocaleString('en-IN')}
                                </span>
                                {activeModalItem.taggedProduct.mrp > activeModalItem.taggedProduct.price && (
                                  <span className="text-decoration-line-through text-muted small" style={{ fontSize: '0.75rem' }}>
                                    ₹{activeModalItem.taggedProduct.mrp?.toLocaleString('en-IN')}
                                  </span>
                                )}
                                <span className="badge bg-dark text-white fw-bold" style={{ fontSize: '0.65rem' }}>
                                  -{activeModalItem.taggedProduct.discount || 25}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Instant Add to Bag Button */}
                          <button
                            type="button"
                            className="btn w-100 rounded-pill btn-dark text-white fw-semibold btn-sm mt-2.5 d-flex align-items-center justify-content-center gap-1.5 shadow-sm"
                            style={{
                              backgroundColor: modalAdded ? '#16A34A' : '#111827',
                              borderColor: modalAdded ? '#16A34A' : '#111827',
                              transition: 'all 0.2s ease',
                            }}
                            onClick={(e) => handleModalAddToCart(activeModalItem.taggedProduct, e)}
                          >
                            {modalAdded ? (
                              <>
                                <Check size={14} /> Added to Bag ✓
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={14} /> Add to Bag (₹{activeModalItem.taggedProduct.price?.toLocaleString('en-IN')})
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Footer link to original post */}
                    <div className="d-flex justify-content-between align-items-center border-top pt-2">
                      <a
                        href={activeModalItem.permalink || `https://www.instagram.com/${activeModalItem.handle}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none small text-muted d-flex align-items-center gap-1"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <FaInstagram size={13} className="text-danger" />
                        <span>View original on Instagram</span>
                        <ExternalLink size={11} />
                      </a>
                      <button
                        className="btn btn-sm btn-link text-secondary p-0 text-decoration-none small"
                        onClick={() => setActiveModalItem(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LookbookGallery;
