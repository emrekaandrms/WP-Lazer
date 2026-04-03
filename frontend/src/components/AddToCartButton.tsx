'use client'

import { useCart } from '@/lib/cart'

type Props = {
  id: string
  name: string
  price: number
  className?: string
  label?: string
}

export function AddToCartButton({ id, name, price, className, label = 'Add to Cart' }: Props) {
  const { addItem } = useCart()

  return (
    <button className={className} onClick={() => addItem({ id, name, price })}>
      {label}
    </button>
  )
}
