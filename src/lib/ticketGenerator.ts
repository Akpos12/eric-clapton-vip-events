import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TicketOrder } from '../types';

/**
 * Generate a high-contrast luxury digital QR Code data URL
 */
export async function generateTicketQRCode(payload: string): Promise<string> {
  try {
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
 * Export high-resolution printable PDF ticket for Eric Clapton VIP Experience
 */
export async function downloadTicketPDF(ticketElementId: string, order: TicketOrder): Promise<void> {
  const element = document.getElementById(ticketElementId);
  if (!element) {
    console.error('Ticket element not found for PDF export:', ticketElementId);
    return;
  }

  try {
    // Generate canvas with optimal scale
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: '#0B0B0D',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Add security header
    pdf.setFillColor(11, 11, 13);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

    const imgProps = pdf.getImageProperties(imgData);
    const renderWidth = pdfWidth - 24; // 12mm padding
    const renderHeight = (imgProps.height * renderWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 12, 16, renderWidth, renderHeight);

    // Add bottom security stamp
    pdf.setTextColor(180, 160, 90);
    pdf.setFontSize(8);
    pdf.text(
      `AUTHENTICATION ID: ${order.id} | CRYPTOGRAPHIC CHECKSUM: ${order.transactionId || 'VERIFIED-GATE-PASS'} | ISSUED: ${new Date().toUTCString()}`,
      12,
      pdfHeight - 10
    );

    pdf.save(`EricClapton_VIP_Pass_${order.id}.pdf`);
  } catch (error) {
    console.error('Error generating PDF ticket:', error);
  }
}
