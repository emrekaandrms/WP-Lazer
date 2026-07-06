'use client'

import { useState } from 'react'

type GalleryImage = {
  sourceUrl: string
  altText?: string
}

interface ProductGalleryProps {
  images: GalleryImage[]
  productName: string
  inStock: boolean
}

export function ProductGallery({ images, productName, inStock }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const main = images[active] || images[0]

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square bg-surface-container-lowest relative overflow-hidden">
        {main?.sourceUrl ? (
          <img
            src={main.sourceUrl}
            alt={main.altText || productName}
            className="h-full w-full object-contain p-6"
          />
        ) : (
          <div className="absolute inset-0 grid-pattern opacity-10" />
        )}
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur px-3 py-1 text-[10px] font-headline font-bold text-primary border border-primary/20">
          {inStock ? 'STOKTA' : 'STOK YOK'}
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, index) => (
            <button
              key={img.sourceUrl}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${productName} görsel ${index + 1}`}
              aria-current={index === active}
              className={`aspect-square overflow-hidden border transition-colors ${
                index === active
                  ? 'border-primary'
                  : 'border-outline-variant/20 hover:border-outline-variant/50'
              }`}
            >
              <img
                src={img.sourceUrl}
                alt={img.altText || `${productName} ${index + 1}`}
                className="h-full w-full object-contain p-1"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
