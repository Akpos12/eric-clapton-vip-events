import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import html2canvasPro from 'html2canvas-pro';
import { TicketOrder } from '../types';

/**
 * Build a scan-ready QR payload with the official Eric Clapton concert ticket URL
 */
export function buildTicketQRPayload(order: TicketOrder): string {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://ericclaptonvip.com';
  
  return `${origin}/?ticket=${encodeURIComponent(order.id)}`;
}

/**
 * Generate a high-contrast luxury digital QR Code data URL
 */
export async function generateTicketQRCode(payloadOrOrder: string | TicketOrder): Promise<string> {
  try {
    let payload = '';
    if (typeof payloadOrOrder === 'object' && payloadOrOrder !== null && 'id' in payloadOrOrder) {
      payload = buildTicketQRPayload(payloadOrOrder as TicketOrder);
    } else {
      payload = String(payloadOrOrder);
      // If it's a ticket order ID like EC-2026-..., convert to full ticket URL so phone scans work seamlessly
      if (payload.startsWith('EC-') && !payload.startsWith('http')) {
        const origin = typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : 'https://ericclaptonvip.com';
        payload = `${origin}/?ticket=${encodeURIComponent(payload)}`;
      }
    }

    return await QRCode.toDataURL(payload, {
      width: 360,
      margin: 1,
      color: {
        dark: '#0B0B0D',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

/**
 * Safely trigger browser file download from Blob or DataUrl
 */
export function triggerDownload(dataUrlOrBlob: string | Blob, filename: string): void {
  try {
    const link = document.createElement('a');
    if (typeof dataUrlOrBlob === 'string') {
      link.href = dataUrlOrBlob;
    } else {
      link.href = URL.createObjectURL(dataUrlOrBlob);
    }
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (typeof dataUrlOrBlob !== 'string') {
        URL.revokeObjectURL(link.href);
      }
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 1500);
  } catch (err) {
    console.error('Trigger download failed:', err);
  }
}

/**
 * Capture an element as a PNG data URL without color parsing issues (oklab/oklch compatible)
 */
export async function captureElementToPng(element: HTMLElement): Promise<string> {
  try {
    // Primary method: html-to-image
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#0B0B0D',
      cacheBust: true,
      skipAutoScale: true,
      skipFonts: true,
      fontEmbedCSS: '',
    });
    if (dataUrl && dataUrl.length > 200) {
      return dataUrl;
    }
  } catch (err) {
    console.warn('html-to-image capture fallback triggered:', err);
  }

  // Secondary fallback: html2canvas-pro with color normalization
  try {
    const canvas = await html2canvasPro(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0B0B0D',
      logging: false,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(element.id);
        if (clonedEl) {
          clonedEl.style.backgroundColor = '#0B0B0D';
        }
      }
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('html2canvas-pro capture fallback also failed:', err);
    throw err;
  }
}

/**
 * Direct Vector jsPDF generator for Eric Clapton VIP Passes (100% fail-safe fallback)
 */
export async function generateDirectVectorTicketPDF(order: TicketOrder): Promise<jsPDF> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();

  // Dark Canvas Background
  pdf.setFillColor(11, 11, 13);
  pdf.rect(0, 0, width, height, 'F');

  // Luxury Gold Outer Border
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.8);
  pdf.rect(10, 10, width - 20, height - 20);

  // Decorative Inner Gold Border
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.2);
  pdf.rect(13, 13, width - 26, height - 26);

  // Top Header Eyebrow
  const isLegacy15th = 
    order.ticketStatus === 'INVALID / LEGACY' || 
    order.isLegacy === true ||
    ((order.eventId === 'ec-stpaul-2026' || order.eventSnapshot?.eventDate === '2026-09-15') && order.inventoryVersion !== 'v2');

  if (isLegacy15th) {
    // High-visibility Invalid Banner
    pdf.setFillColor(120, 20, 30);
    pdf.rect(13, 13, width - 26, 14, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TICKET INVALID — This ticket is no longer valid for the 15th.', width / 2, 19, { align: 'center' });
    pdf.text('Please purchase a new ticket for this event.', width / 2, 24, { align: 'center' });
  } else {
    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ERIC CLAPTON WORLD TOUR • OFFICIAL VIP GATE PASS', width / 2, 24, { align: 'center' });
  }

  // Concert Title
  pdf.setTextColor(245, 245, 220);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  const eventName = order.eventSnapshot?.eventName || 'Eric Clapton Live in Concert';
  pdf.text(eventName, width / 2, 33, { align: 'center', maxWidth: width - 40 });

  // Divider line
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.3);
  pdf.line(20, 39, width - 20, 39);

  // Info Block 1: Event & Venue
  pdf.setFillColor(18, 18, 20);
  pdf.rect(20, 43, width - 40, 48, 'F');
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.1);
  pdf.rect(20, 43, width - 40, 48, 'S');

  pdf.setTextColor(180, 160, 100);
  pdf.setFontSize(8);
  pdf.text('VENUE & CITY:', 25, 50);
  pdf.setTextColor(245, 245, 220);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${order.eventSnapshot?.venue || 'Concert Arena'}, ${order.eventSnapshot?.city || ''}`, 25, 56);

  pdf.setTextColor(180, 160, 100);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('EVENT DATE:', 25, 66);
  pdf.setTextColor(245, 245, 220);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${order.eventSnapshot?.eventDate || 'Tour Date'} • Doors: ${order.eventSnapshot?.doorsOpen || '6:30 PM'} • Show: ${order.eventSnapshot?.concertTime || '8:00 PM'}`, 25, 72);

  pdf.setTextColor(180, 160, 100);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('PACKAGE TIER:', 25, 82);
  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${order.tierName} (${order.quantity}x Passes Allocated)`, 25, 87);

  // Info Block 2: Attendee & Seat Allocation
  pdf.setFillColor(18, 18, 20);
  pdf.rect(20, 96, width - 40, 44, 'F');
  pdf.rect(20, 96, width - 40, 44, 'S');

  pdf.setTextColor(180, 160, 100);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('PRIMARY ATTENDEE:', 25, 103);
  pdf.setTextColor(245, 245, 220);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(order.attendee?.fullName || 'VIP Guest', 25, 109);

  pdf.setTextColor(180, 160, 100);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('SEATING / ALLOCATION:', 25, 119);
  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(order.seatInfo || 'VIP Reserved Seating', 25, 125);

  pdf.setTextColor(180, 160, 100);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('BOOKING REFERENCE:', 25, 134);
  pdf.setTextColor(245, 245, 220);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`#${order.id} | Total Paid: $${(order.pricing?.total || 0).toLocaleString()} USD`, 25, 138);

  // QR Code Generation & Embedding
  const qrDataUrl = await generateTicketQRCode(order);
  if (qrDataUrl) {
    // White background card for QR Code
    const qrSize = 52;
    const qrX = (width - qrSize) / 2;
    const qrY = 146;

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 16, 2, 2, 'F');
    pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    pdf.setTextColor(11, 11, 13);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OFFICIAL ENCRYPTED GATE SCANNER CODE', width / 2, qrY + qrSize + 7, { align: 'center' });
  }

  // Security Guidelines & Instructions Box
  pdf.setFillColor(18, 18, 20);
  pdf.rect(20, 220, width - 40, 48, 'F');
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.2);
  pdf.rect(20, 220, width - 40, 48, 'S');

  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ENTRY INSTRUCTIONS & SECURITY PROTOCOL', 25, 228);

  pdf.setTextColor(220, 220, 200);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  const instructions = isLegacy15th ? [
    '• TICKET INVALID — This ticket is no longer valid for the 15th. Please purchase a new ticket for this event.',
    '• This ticket was issued under the previous inventory version for September 15 at Grand Casino Arena.',
    '• DO NOT ACCEPT AT VENUE GATE — Gate admission cannot be granted with this legacy pass.',
    '• Historical record retained for audit purposes. Visit portal to purchase a current valid ticket.'
  ] : [
    '• Present this digital PDF pass or printout at the VIP Hospitality Gate entrance.',
    '• Photo ID matching the primary attendee name may be requested at check-in.',
    '• VIP credentials, commemorative laminates, and lounge access wristbands will be issued at the desk.',
    '• For assistance or concierge inquiries, contact: vip-support@ericclaptonvip.com'
  ];
  let instY = 236;
  instructions.forEach(inst => {
    pdf.text(inst, 25, instY);
    instY += 6.5;
  });

  // Footer Checksum
  pdf.setTextColor(180, 160, 90);
  pdf.setFontSize(7);
  pdf.text(
    `SECURITY ID: ${order.id} • STATUS: ${order.ticketStatus || 'VALID GATE PASS'} • ISSUED: ${new Date().toUTCString()}`,
    width / 2,
    height - 15,
    { align: 'center' }
  );

  return pdf;
}

/**
 * Export high-resolution printable PDF ticket for Eric Clapton VIP Experience
 */
export async function downloadTicketPDF(ticketElementId: string, order: TicketOrder): Promise<void> {
  const filename = `EricClapton_VIP_Pass_${order.id}.pdf`;

  // Method 1: Try capturing rendered DOM element
  let domPdfGenerated = false;
  const element = document.getElementById(ticketElementId);
  
  if (element) {
    try {
      const imgData = await captureElementToPng(element);
      if (imgData && imgData.length > 200) {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Dark canvas background
        pdf.setFillColor(11, 11, 13);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

        const imgProps = pdf.getImageProperties(imgData);
        const renderWidth = pdfWidth - 24; // 12mm margins
        const renderHeight = (imgProps.height * renderWidth) / imgProps.width;
        const startY = renderHeight < pdfHeight - 40 ? 18 : 12;

        pdf.addImage(imgData, 'PNG', 12, startY, renderWidth, renderHeight);

        // Bottom security stamp
        pdf.setTextColor(180, 160, 90);
        pdf.setFontSize(8);
        pdf.text(
          `AUTHENTICATION ID: ${order.id} | CHECKSUM: ${order.transactionId || 'VERIFIED-GATE-PASS'} | ISSUED: ${new Date().toUTCString()}`,
          12,
          pdfHeight - 10
        );

        const pdfBlob = pdf.output('blob');
        triggerDownload(pdfBlob, filename);
        domPdfGenerated = true;
      }
    } catch (domErr) {
      console.warn('DOM capture PDF generation failed, falling back to direct vector PDF generator:', domErr);
    }
  }

  // Method 2: Fail-safe direct vector PDF generation
  if (!domPdfGenerated) {
    const directPdf = await generateDirectVectorTicketPDF(order);
    const directBlob = directPdf.output('blob');
    triggerDownload(directBlob, filename);
  }
}

/**
 * Save high-resolution digital pass as PNG image
 */
export async function downloadTicketPNG(ticketElementId: string, order: TicketOrder): Promise<void> {
  const filename = `EricClapton_VIP_Pass_${order.id}.png`;
  const element = document.getElementById(ticketElementId);

  if (element) {
    try {
      const imgData = await captureElementToPng(element);
      if (imgData) {
        triggerDownload(imgData, filename);
        return;
      }
    } catch (err) {
      console.warn('DOM PNG capture failed, generating fallback QR image:', err);
    }
  }

  // Fallback: download the high-res QR pass directly
  const qrDataUrl = await generateTicketQRCode(order);
  if (qrDataUrl) {
    triggerDownload(qrDataUrl, filename);
  }
}


