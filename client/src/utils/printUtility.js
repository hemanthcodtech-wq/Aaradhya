/**
 * Aaradhya Enterprise Print Engine
 * Provides dedicated, isolated print window rendering for thermal label printers,
 * 80mm POS receipt printers, and standard A4 laser/inkjet printers.
 */

// Helper to generate Code 128 vector SVG barcode bars
export const generateBarcodeSvgHtml = (value = '890123450001', width = 180, height = 36) => {
  const bars = [];
  let currentX = 6;
  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i);
    const w1 = ((charCode % 3) + 1.2) * 1.4;
    const s1 = ((charCode % 2) + 1) * 1.4;
    const w2 = (((charCode + 2) % 3) + 1) * 1.4;
    const s2 = (((charCode + 1) % 2) + 1.2) * 1.4;

    bars.push(`<rect x="${currentX.toFixed(1)}" y="0" width="${w1.toFixed(1)}" height="${height}" fill="#111827" />`);
    currentX += w1 + s1;
    bars.push(`<rect x="${currentX.toFixed(1)}" y="0" width="${w2.toFixed(1)}" height="${height}" fill="#111827" />`);
    currentX += w2 + s2;
  }

  return `
    <div style="display:flex; flex-direction:column; align-items:center; margin: 2px 0;">
      <svg width="${width}" height="${height}" viewBox="0 0 ${Math.ceil(currentX + 8)} ${height}" style="display:block;">
        ${bars.join('\n')}
      </svg>
      <span style="font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #111827; margin-top: 1px;">
        ${value}
      </span>
    </div>
  `;
};

// Core popup / iframe print executor
const executePrintHtml = (htmlContent, title = 'Print Document') => {
  // Try popup window first
  const printWindow = window.open('', '_blank', 'width=850,height=650');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      try {
        printWindow.print();
        printWindow.close();
      } catch (e) {
        console.error('Print trigger error:', e);
      }
    }, 450);
    return;
  }

  // Pop-up blocked fallback: hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();
  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
};

/**
 * Print Barcode Stickers (Thermal 50x30mm or A4 24-Up Sheet)
 */
export const printBarcodeStickers = ({ item, store, format = 'thermal', copies = 1 }) => {
  const isA4 = format === 'a4';
  const labelCount = isA4 ? Math.min(copies, 24) : copies;

  const labelsHtml = Array.from({ length: labelCount })
    .map(
      () => `
      <div class="sticker-card">
        <div class="sticker-header">
          <div class="sticker-brand">AARADHYA</div>
          <div class="sticker-store">${store.storeName}</div>
        </div>
        <div class="sticker-body">
          <div class="sticker-row">
            <span class="sticker-id">${item.productId || `${store.productPrefix}-000001`}</span>
            <span class="sticker-hsn">HSN: ${item.hsnCode || item.hsn || (store.isSilks ? '5007' : '5208')}</span>
          </div>
          <div class="sticker-name">${item.name}</div>
        </div>
        <div class="sticker-barcode">
          ${generateBarcodeSvgHtml(item.barcode || '890123450001', 170, 32)}
        </div>
        <div class="sticker-footer">
          <span class="sticker-mrp">MRP: ₹${Number(item.price).toLocaleString()}</span>
          <span class="sticker-sale">OFFER: ₹${Number(item.salePrice || item.price).toLocaleString()}</span>
        </div>
      </div>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Barcode Stickers - ${store.storeName}</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #FFFFFF;
            color: #111827;
            padding: ${isA4 ? '10mm' : '2mm'};
          }
          @page {
            size: ${isA4 ? 'A4 portrait' : '55mm 35mm'};
            margin: ${isA4 ? '8mm' : '1mm'};
          }
          .stickers-container {
            display: flex;
            flex-wrap: wrap;
            gap: ${isA4 ? '4mm' : '2mm'};
            justify-content: ${isA4 ? 'space-between' : 'center'};
          }
          .sticker-card {
            width: ${isA4 ? '63mm' : '50mm'};
            min-height: ${isA4 ? '34mm' : '30mm'};
            border: 1px solid #D0D5DD;
            border-radius: 4px;
            padding: 4px 6px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-inside: avoid;
            background: #FFFFFF;
          }
          .sticker-header {
            text-align: center;
            border-bottom: 0.5px solid #E5E7EB;
            padding-bottom: 2px;
          }
          .sticker-brand {
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 1px;
            color: #111827;
          }
          .sticker-store {
            font-size: 7.5px;
            font-weight: 600;
            color: #4B5563;
          }
          .sticker-body {
            margin: 2px 0;
          }
          .sticker-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .sticker-id {
            font-family: monospace;
            font-size: 8.5px;
            font-weight: 700;
            color: #111827;
          }
          .sticker-hsn {
            font-family: monospace;
            font-size: 7.5px;
            color: #6B7280;
          }
          .sticker-name {
            font-size: 8px;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #111827;
            margin-top: 1px;
          }
          .sticker-barcode {
            text-align: center;
            margin: 1px 0;
          }
          .sticker-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 0.5px solid #E5E7EB;
            padding-top: 2px;
          }
          .sticker-mrp {
            font-size: 7.5px;
            color: #6B7280;
            text-decoration: line-through;
          }
          .sticker-sale {
            font-size: 9px;
            font-weight: 800;
            color: #111827;
          }
        </style>
      </head>
      <body>
        <div class="stickers-container">
          ${labelsHtml}
        </div>
      </body>
    </html>
  `;

  executePrintHtml(html, `Barcodes_${store.storeCode}_${item.productId}`);
};

/**
 * Print 80mm Retail Counter POS Bill Receipt
 */
export const printPosReceipt = ({ bill, store }) => {
  const itemsHtml = (bill.items || [])
    .map(
      (it) => `
      <tr>
        <td style="padding: 3px 0; max-width: 140px; word-break: break-word;">
          <div style="font-weight: 600;">${it.name}</div>
          <div style="font-size: 9px; color: #555;">HSN: ${it.hsn || (store.isSilks ? '5007' : '5208')} @ ₹${Number(it.price).toLocaleString()}</div>
        </td>
        <td style="text-align: center; vertical-align: top; padding: 3px 4px; font-weight: 600;">${it.quantity}</td>
        <td style="text-align: right; vertical-align: top; padding: 3px 0; font-weight: 700;">₹${Number(it.subtotal || it.price * it.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  const taxHalf = Math.round((bill.tax || 0) / 2);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>POS Receipt - ${bill.billNumber}</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 76mm;
            max-width: 76mm;
            margin: 0 auto;
            padding: 4mm 2mm;
            color: #000000;
            font-size: 11px;
            line-height: 1.35;
          }
          @page {
            size: 80mm auto;
            margin: 2mm;
          }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
          .brand-title { font-size: 16px; font-weight: 800; letter-spacing: 1px; }
          .store-name { font-size: 12px; font-weight: 700; margin-top: 1px; }
          .meta-info { font-size: 9px; color: #333; margin-top: 2px; }
          .bill-meta { font-size: 10px; margin-bottom: 6px; border-bottom: 1px dashed #000; padding-bottom: 4px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 10.5px; }
          .items-table th { border-bottom: 1px solid #000; padding: 3px 0; text-align: left; }
          .totals-section { border-top: 1px dashed #000; padding-top: 4px; margin-bottom: 6px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .net-total { font-size: 14px; font-weight: 900; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin: 4px 0; }
          .footer { text-align: center; font-size: 9.5px; margin-top: 8px; border-top: 1px dashed #000; padding-top: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-title">AARADHYA</div>
          <div class="store-name">${store.storeName}</div>
          <div class="meta-info">${store.address}</div>
          <div class="meta-info">GSTIN: ${store.gstin} | Phone: ${store.phone}</div>
        </div>

        <div class="bill-meta">
          <div class="row"><span>Bill No:</span> <strong>${bill.billNumber}</strong></div>
          <div class="row"><span>Date:</span> <span>${new Date(bill.createdAt || Date.now()).toLocaleString()}</span></div>
          <div class="row"><span>Cashier:</span> <span>${bill.cashier || 'Terminal 1'}</span></div>
          <div class="row"><span>Customer:</span> <span>${bill.customerName || 'Walk-in'} (${bill.customerPhone || 'N/A'})</span></div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 60%;">Item</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 25%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals-section">
          <div class="row"><span>Subtotal:</span> <span>₹${Number(bill.subtotal || 0).toLocaleString()}</span></div>
          <div class="row"><span>CGST (2.5%):</span> <span>₹${taxHalf.toLocaleString()}</span></div>
          <div class="row"><span>SGST (2.5%):</span> <span>₹${taxHalf.toLocaleString()}</span></div>
          ${bill.discount > 0 ? `<div class="row"><span>Discount:</span> <span>-₹${Number(bill.discount).toLocaleString()}</span></div>` : ''}
          
          <div class="row net-total">
            <span>NET PAID:</span>
            <span>₹${Number(bill.total || 0).toLocaleString()}</span>
          </div>

          <div class="row" style="font-size: 10px;">
            <span>Payment Mode:</span>
            <strong style="text-transform: uppercase;">${bill.paymentMethod || 'CASH'}</strong>
          </div>
        </div>

        <div class="footer">
          <div style="font-weight: 700;">THANK YOU FOR SHOPPING AT AARADHYA!</div>
          <div style="margin-top: 2px;">Goods once sold can be exchanged within 7 days with original tag and receipt.</div>
          <div style="margin-top: 6px; font-family: monospace; letter-spacing: 1px;">* * * HAVE A GREAT DAY * * *</div>
        </div>
      </body>
    </html>
  `;

  executePrintHtml(html, `Bill_${bill.billNumber}`);
};

/**
 * Print Online Suborder Packing / Dispatch Slip
 */
export const printFulfillmentSlip = ({ order, store }) => {
  const itemsHtml = (order.items || [])
    .map(
      (it) => `
      <tr>
        <td style="padding: 6px; border-bottom: 1px solid #EAECF0;">
          <div style="font-weight: 600; color: #111827;">${it.name}</div>
          <div style="font-size: 11px; color: #6B7280; font-family: monospace;">SKU: ${it.sku || it.productId || 'N/A'} • HSN: ${it.hsn || '5007'}</div>
        </td>
        <td style="padding: 6px; border-bottom: 1px solid #EAECF0; text-align: center; font-weight: 700;">${it.quantity}</td>
        <td style="padding: 6px; border-bottom: 1px solid #EAECF0; text-align: right;">₹${Number(it.price).toLocaleString()}</td>
        <td style="padding: 6px; border-bottom: 1px solid #EAECF0; text-align: right; font-weight: 700;">₹${Number(it.price * it.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Fulfillment Slip - #${order.suborderNumber}</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            padding: 12mm;
            color: #111827;
            font-size: 12px;
            line-height: 1.5;
          }
          @page { size: A4 portrait; margin: 10mm; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #E90064; padding-bottom: 12px; margin-bottom: 16px; }
          .brand { font-size: 20px; font-weight: 800; color: #E90064; letter-spacing: 1px; }
          .slip-title { font-size: 16px; font-weight: 700; text-align: right; }
          .grid { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 16px; }
          .card { flex: 1; border: 1px solid #E5E7EB; border-radius: 6px; padding: 10px; background: #F9FAFB; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          .table th { background: #F3F4F6; padding: 8px 6px; text-align: left; font-weight: 700; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #D1D5DB; }
          .footer { text-align: center; font-size: 11px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 12px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">AARADHYA</div>
            <div style="font-weight: 700; font-size: 13px;">${store.storeName}</div>
            <div style="color: #4B5563; font-size: 11px;">${store.address}</div>
            <div style="color: #4B5563; font-size: 11px;">GSTIN: ${store.gstin} | Phone: ${store.phone}</div>
          </div>
          <div>
            <div class="slip-title">STORE DISPATCH SLIP</div>
            <div style="font-family: monospace; font-size: 13px; font-weight: 700; color: #E90064;">#${order.suborderNumber}</div>
            <div style="font-size: 11px; color: #6B7280;">Parent Order: #${order.parentOrderNumber || order.parentOrderId}</div>
            <div style="font-size: 11px; color: #6B7280;">Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div style="font-weight: 700; margin-bottom: 4px; color: #111827;">SHIPPING DESTINATION</div>
            <div style="font-weight: 600;">${order.shippingAddress?.fullName || order.customerName}</div>
            <div>${order.shippingAddress?.addressLine1 || ''}</div>
            <div>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}</div>
            <div style="margin-top: 4px;">Phone: ${order.customerPhone || 'N/A'}</div>
          </div>

          <div class="card">
            <div style="font-weight: 700; margin-bottom: 4px; color: #111827;">FULFILLMENT STATUS</div>
            <div>Status: <strong style="text-transform: uppercase;">${order.status || 'Packed'}</strong></div>
            <div>Payment: <strong>${order.paymentMethod || 'Prepaid Online'} (${order.paymentStatus || 'Paid'})</strong></div>
            ${order.courier ? `<div>Logistics: <strong>${order.courier}</strong></div>` : ''}
            ${order.trackingNumber ? `<div>Tracking AWB: <strong style="font-family: monospace;">${order.trackingNumber}</strong></div>` : ''}
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th style="width: 50%;">Item Description</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Unit Rate</th>
              <th style="width: 20%; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right; font-weight: 700; padding: 8px 6px;">Total Suborder Amount:</td>
              <td style="text-align: right; font-weight: 800; font-size: 14px; padding: 8px 6px; color: #E90064;">₹${Number(order.totalAmount).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div class="footer">
          <div>Verified & Packed at ${store.storeName} Fulfillment Center.</div>
          <div>For order queries, contact customer care at ${store.phone} or ${store.email}.</div>
        </div>
      </body>
    </html>
  `;

  executePrintHtml(html, `Dispatch_${order.suborderNumber}`);
};
