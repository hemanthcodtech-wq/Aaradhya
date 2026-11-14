# ShopMart Multi-Vendor E-Commerce Platform

A production-grade, enterprise-ready Multi-Vendor E-Commerce ecosystem built with the MERN stack (React 19 + Vite, Node.js + Express, MongoDB + Mongoose, Bootstrap 5, Lucide Icons, Recharts).

## Integrated Applications

1. **Customer Storefront** (`http://localhost:5173/`):
   - Mega-menu categories, hero banners, flash deals countdown, best sellers, featured vendors.
   - Faceted search, price range filter, brand filter, stock availability, and sorting.
   - Product variant matrix (Color, Size, Storage), zoom gallery, and live Shiprocket pincode checker.
   - 3-step checkout with address management, Razorpay payment verification, and Shiprocket live tracking.

2. **Vendor Dashboard** (`http://localhost:5173/vendor`):
   - Analytics with Recharts sales trends, KPI cards (Sales, Orders, Earnings, Pending Payout).
   - Product catalog management with variants, multi-image upload, and bulk CSV import.
   - Order fulfillment workflow: Accept -> Pack & Auto-Generate Shiprocket AWB -> Download Shipping Label -> Ship.
   - Earnings reports, commission deduction tracking, and bank payout requests.
   - Store settings, warehouse pickup address, and KYC document upload.

3. **Store POS & Inventory Terminal** (`http://localhost:5173/pos`):
   - Fast counter billing with physical/manual barcode scanner input and quick-tap product grid tiles.
   - Dynamic 18% GST calculation, customer management, discounts, and tender modes (Cash, Card, UPI, Split).
   - Thermal (80mm) and A4 printable receipts with barcode and store details.
   - Stock In / Purchase entries, stock adjustments, and real-time inventory synchronization.
   - Barcode sticker generator and bulk printing sheets.

4. **Super Admin Dashboard** (`http://localhost:5173/admin`):
   - Platform GMV, gross orders, vendor counts, and customer base analytics.
   - Recharts weekly sales curves and order fulfillment status donut charts.
   - Vendor onboarding moderation & KYC document verification.
   - Product moderation queue (1-click Approve / Reject with reason).
   - Staff management with granular Role-Based Access Control (RBAC).

## Running the Project

### Backend Server (Port 5000)
```bash
cd server
npm install
npm run dev
```

### Frontend Client (Port 5173)
```bash
cd client
npm install
npm run dev
```

## Running Automated Verification Suite
```bash
node server/tests/e2e_verification.js
```

