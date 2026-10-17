import { PDFDocument } from 'pdf-lib';

export interface MergeResult {
  mergedFile: File;
  pageCount: number;
  fileSizeFormatted: string;
}

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
  previewUrl?: string;
}

// 50 MB in bytes
export const MAX_TOTAL_SIZE_BYTES = 50 * 1024 * 1024;
// Maximum allowed page count
export const MAX_PAGE_COUNT = 1000;

// Standard A4 dimensions in points (72 points = 1 inch)
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const PAGE_MARGIN = 28; // Margin in points

/**
 * Merge multiple files (PDFs, JPGs, JPEGs, PNGs) into a single PDF document.
 * Images are placed on their own pages with aspect ratio preserved.
 */
export async function mergeFilesToPdf(files: File[]): Promise<MergeResult> {
  if (!files || files.length === 0) {
    throw new Error('No files provided for merging.');
  }

  // Validate total input size
  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);
  if (totalSizeBytes > MAX_TOTAL_SIZE_BYTES) {
    throw new Error(`Total size of selected files exceeds 50 MB (${(totalSizeBytes / (1024 * 1024)).toFixed(1)} MB).`);
  }

  const mergedDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();

    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      try {
        const sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pageIndices = sourceDoc.getPageIndices();

        if (mergedDoc.getPageCount() + pageIndices.length > MAX_PAGE_COUNT) {
          throw new Error(
            `Total page limit (${MAX_PAGE_COUNT}) exceeded. Adding ${file.name} (${pageIndices.length} pgs) brings total to ${
              mergedDoc.getPageCount() + pageIndices.length
            }.`
          );
        }

        const copiedPages = await mergedDoc.copyPages(sourceDoc, pageIndices);
        for (const page of copiedPages) {
          mergedDoc.addPage(page);
        }
      } catch (err: any) {
        if (err.message?.includes('Total page limit')) {
          throw err;
        }
        throw new Error(`Failed to read PDF "${file.name}": ${err.message || 'Corrupted or protected PDF.'}`);
      }
    } else if (
      file.type === 'image/jpeg' ||
      file.type === 'image/jpg' ||
      file.type === 'image/png' ||
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg') ||
      fileName.endsWith('.png')
    ) {
      if (mergedDoc.getPageCount() + 1 > MAX_PAGE_COUNT) {
        throw new Error(`Total page limit (${MAX_PAGE_COUNT}) exceeded.`);
      }

      let imageEmbed;
      const isPng = file.type === 'image/png' || fileName.endsWith('.png');

      try {
        if (isPng) {
          imageEmbed = await mergedDoc.embedPng(arrayBuffer);
        } else {
          imageEmbed = await mergedDoc.embedJpg(arrayBuffer);
        }
      } catch {
        // Fallback: try the other format in case file extension doesn't match MIME/content
        try {
          if (isPng) {
            imageEmbed = await mergedDoc.embedJpg(arrayBuffer);
          } else {
            imageEmbed = await mergedDoc.embedPng(arrayBuffer);
          }
        } catch (imgErr: any) {
          throw new Error(`Failed to process image "${file.name}": Unsupported or corrupted image.`);
        }
      }

      // Add page with standard A4 dimensions
      const page = mergedDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      const availableWidth = A4_WIDTH - PAGE_MARGIN * 2;
      const availableHeight = A4_HEIGHT - PAGE_MARGIN * 2;

      // Scale to fit maintaining aspect ratio
      const { width: origWidth, height: origHeight } = imageEmbed;
      const scale = Math.min(availableWidth / origWidth, availableHeight / origHeight);
      const drawWidth = origWidth * scale;
      const drawHeight = origHeight * scale;

      // Center image on page
      const x = (A4_WIDTH - drawWidth) / 2;
      const y = (A4_HEIGHT - drawHeight) / 2;

      page.drawImage(imageEmbed, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
      });
    } else {
      throw new Error(`Unsupported file type for "${file.name}". Only PDF, JPG, JPEG, and PNG files are allowed.`);
    }
  }

  const finalPageCount = mergedDoc.getPageCount();
  if (finalPageCount === 0) {
    throw new Error('No pages were generated from the selected files.');
  }

  const mergedPdfBytes = await mergedDoc.save();

  // Create descriptive file name
  let mergedFileName = 'merged_assignment.pdf';
  if (files.length === 1) {
    const raw = files[0].name.replace(/\.[^/.]+$/, '');
    mergedFileName = `${raw}.pdf`;
  } else {
    const firstRaw = files[0].name.replace(/\.[^/.]+$/, '').slice(0, 20);
    mergedFileName = `${firstRaw}_merged_${files.length}files.pdf`;
  }

  const mergedFile = new File([mergedPdfBytes], mergedFileName, {
    type: 'application/pdf',
    lastModified: Date.now(),
  });

  const sizeMb = (mergedFile.size / (1024 * 1024)).toFixed(1);
  const sizeFormatted = `${sizeMb} MB`;

  return {
    mergedFile,
    pageCount: finalPageCount,
    fileSizeFormatted: sizeFormatted,
  };
}
