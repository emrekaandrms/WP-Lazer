'use client'

import { useCart } from '@/lib/cart'

type Props = {
  id: string
  productId?: number
  name: string
  price: number
  sku?: string
  slug?: string
  image?: string
  className?: string
  label?: string
}

export function AddToCartButton({ id, productId, name, price, sku, slug, image, className, label = 'Sepete Ekle' }: Props) {
  const { addItem } = useCart()

  return (
    <button className={className} onClick={() => addItem({ id, productId, name, price, sku, slug, image })}>
      {label}
    </button>
  )
}
