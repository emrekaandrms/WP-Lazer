'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCurrentCustomer } from '@/lib/account'

export function AccountNavLink() {
  const [href, setHref] = useState('/login/')
  const [label, setLabel] = useState('Giriş')

  useEffect(() => {
    let active = true

    getCurrentCustomer()
      .then(() => {
        if (!active) return
        setHref('/my-account/')
        setLabel('Hesabım')
      })
      .catch(() => {
        if (!active) return
        setHref('/login/')
        setLabel('Giriş')
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="material-symbols-outlined text-[#C8C6C5] hover:bg-[#2A2A2A] p-2 transition-all"
    >
      account_circle
    </Link>
  )
}
