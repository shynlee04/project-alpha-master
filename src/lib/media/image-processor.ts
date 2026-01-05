/**
 * @fileoverview Image processing utility for chat attachments
 * @module lib/media/image-processor
 *
 * E2-7: Image Processing
 * - Client-side image compression using Canvas API
 * - EXIF data stripping via Canvas re-encoding
 * - Format detection and handling
 * - GIF preservation (animated)
 */

export interface ImageProcessOptions {
  maxWidth?: number // Default: 1920
  maxHeight?: number // Default: 1920
  quality?: number // Default: 0.8 (JPEG/WebP quality 0-1)
  stripExif?: boolean // Default: true
  maxFileSize?: number // Default: 2MB (compress if larger)
}

export interface ImageProcessResult {
  blob: Blob
  url: string
  originalSize: number
  compressedSize: number
  width: number
  height: number
  format: 'jpeg' | 'png' | 'webp' | 'gif'
  wasCompressed: boolean
  wasProcessed: boolean
}

export interface ImageDimensions {
  width: number
  height: number
}

/**
 * Detect if image should be processed
 * GIFs are preserved to maintain animation
 */
function shouldProcessImage(file: File, options: ImageProcessOptions): boolean {
  // Preserve animated GIFs
  if (file.type === 'image/gif') {
    return false
  }

  // Check file size threshold
  const maxSize = options.maxFileSize || 2 * 1024 * 1024 // 2MB default
  if (file.size > maxSize) {
    return true
  }

  // Always process if EXIF stripping requested
  if (options.stripExif !== false) {
    return true
  }

  return false
}

/**
 * Calculate scaled dimensions maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): ImageDimensions {
  let width = originalWidth
  let height = originalHeight

  // Scale down if exceeds max dimensions
  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width
    const heightRatio = maxHeight / height
    const ratio = Math.min(widthRatio, heightRatio)

    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  return { width, height }
}

/**
 * Load image into HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Convert canvas to blob with specified format and quality
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'jpeg' | 'png' | 'webp',
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = `image/${format}`
    const qualityValue = format === 'png' ? undefined : quality

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas to blob conversion failed'))
        }
      },
      mimeType,
      qualityValue
    )
  })
}

/**
 * Determine output format from file type
 * Falls back to JPEG for unsupported formats
 */
function getOutputFormat(fileType: string): 'jpeg' | 'png' | 'webp' {
  if (fileType === 'image/jpeg') return 'jpeg'
  if (fileType === 'image/png') return 'png'
  if (fileType === 'image/webp') return 'webp'
  // Default to JPEG for other formats (better compression)
  return 'jpeg'
}

/**
 * Process image with compression and EXIF stripping
 *
 * Uses Canvas API to:
 * 1. Scale down large images (max 1920px by default)
 * 2. Compress with JPEG/WebP quality (0.8 = 80%)
 * 3. Strip EXIF metadata (Canvas doesn't preserve it)
 *
 * @param file - The image file to process
 * @param options - Processing options
 * @returns Processed image result with blob and metadata
 */
export async function processImage(
  file: File,
  options: ImageProcessOptions = {}
): Promise<ImageProcessResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    stripExif = true,
    maxFileSize = 2 * 1024 * 1024 // 2MB
  } = options

  const originalSize = file.size

  // Check if processing is needed
  if (!shouldProcessImage(file, { ...options, maxFileSize })) {
    // Return original as-is (e.g., GIF, small image)
    const url = URL.createObjectURL(file)
    const img = await loadImage(file)

    return {
      blob: file,
      url,
      originalSize,
      compressedSize: originalSize,
      width: img.width,
      height: img.height,
      format: file.type === 'image/gif' ? 'gif' : getOutputFormat(file.type),
      wasCompressed: false,
      wasProcessed: false
    }
  }

  // Load image
  const img = await loadImage(file)

  // Calculate new dimensions
  const { width, height } = calculateDimensions(
    img.width,
    img.height,
    maxWidth,
    maxHeight
  )

  // Create canvas and draw image (this strips EXIF)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Draw image (EXIF is stripped here)
  ctx.drawImage(img, 0, 0, width, height)

  // Determine output format
  const format = getOutputFormat(file.type)

  // Convert to blob
  const blob = await canvasToBlob(canvas, format, quality)

  // Create object URL
  const url = URL.createObjectURL(blob)

  return {
    blob,
    url,
    originalSize,
    compressedSize: blob.size,
    width,
    height,
    format,
    wasCompressed: blob.size < originalSize,
    wasProcessed: true
  }
}

/**
 * Check if file is a supported image format
 */
export function isSupportedImageFile(file: File): boolean {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  return supportedTypes.includes(file.type) || supportedTypes.some(type => file.type.includes(type))
}

/**
 * Get human-readable format name
 */
export function getFormatName(format: 'jpeg' | 'png' | 'webp' | 'gif'): string {
  switch (format) {
    case 'jpeg':
      return 'JPEG'
    case 'png':
      return 'PNG'
    case 'webp':
      return 'WebP'
    case 'gif':
      return 'GIF'
  }
}

/**
 * Calculate compression percentage
 */
export function getCompressionPercentage(original: number, compressed: number): number {
  if (original === 0) return 0
  return Math.round(((original - compressed) / original) * 100)
}
