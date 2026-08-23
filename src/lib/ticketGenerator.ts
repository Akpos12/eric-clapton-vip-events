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
      width: 320,
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
 * Capture an element as a PNG data URL without color parsing issues (oklab/oklch compatible)
 */
async function captureElementToPng(element: HTMLElement): Promise<string> {
  try {
    // Primary method: html-to-image uses browser native rendering engine (SVG foreignObject), completely avoiding custom CSS color parser bugs like oklab
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2.5,
      backgroundColor: '#0B0B0D',
      cacheBust: true,
      skipAutoScale: true,
      skipFonts: true,
      fontEmbedCSS: '',
    });
    if (dataUrl && dataUrl.length > 100) {
      return dataUrl;
    }
  } catch (err) {
    console.warn('html-to-image capture fallback triggered:', err);
  }

  // Secondary fallback: html2canvas-pro with color normalization
  try {
    const canvas = await html2canvasPro(element, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: '#0B0B0D',
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure background colors in clone are explicit hex / rgba
        const clonedEl = clonedDoc.getElementById(element.id);
        if (clonedEl) {
          clonedEl.style.backgroundColor = '#0B0B0D';
        }
      }
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('html2canvas-pro capture fallback also failed:', err);
    throw err;
  }
}

/**
 * Export high-resolution printable PDF ticket for Eric Clapton VIP Experience
 */
export async function downloadTicketPDF(ticketElementId: string, order: TicketOrder): Promise<void> {
  const element = document.getElementById(ticketElementId);
  if (!element) {
    console.error('Ticket element not found for PDF export:', ticketElementId);
    return;
  }

  try {
    const imgData = await captureElementToPng(element);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Add luxury dark canvas background
    pdf.setFillColor(11, 11, 13);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

    const imgProps = pdf.getImageProperties(imgData);
    const renderWidth = pdfWidth - 24; // 12mm margins
    const renderHeight = (imgProps.height * renderWidth) / imgProps.width;

    // Center vertically if it fits nicely, otherwise start with top padding
    const startY = renderHeight < pdfHeight - 40 ? 18 : 12;

    pdf.addImage(imgData, 'PNG', 12, startY, renderWidth, renderHeight);

    // Add bottom security stamp
    pdf.setTextColor(180, 160, 90);
    pdf.setFontSize(8);
    pdf.text(
      `AUTHENTICATION ID: ${order.id} | CHECKSUM: ${order.transactionId || 'VERIFIED-GATE-PASS'} | ISSUED: ${new Date().toUTCString()}`,
      12,
      pdfHeight - 10
    );

    pdf.save(`EricClapton_VIP_Pass_${order.id}.pdf`);
  } catch (error) {
    console.error('Error generating PDF ticket:', error);
  }
}

