'use client'

import { getWpRestBaseUrl } from './urls'

export type AccountUser = {
  id: number
  email: string
  first_name?: string
  last_name?: string
  display_name?: string
}

export type AccountAddress = {
  first_name?: string
  last_name?: string
  company?: string
  address_1?: string
  address_2?: string
  city?: string
  state?: string
  postcode?: string
  country?: string
  email?: string
  phone?: string
}

export type AccountPayload = {
  user: AccountUser
  addresses: {
    billing: AccountAddress
    shipping: AccountAddress
  }
}

export type AccountOrder = {
  id: number
  number: string
  status: string
  date: string
  total: string
  currency: string
  items: Array<{
    name: string
    quantity: number
    total: string
  }>
}

export type OrderTrackingPayload = {
  order: {
    number: string
    status: string
    date: string
    total: string
    item_count: number
    items: Array<{
      name: string
      quantity: number
    }>
  }
}

async function accountRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${getWpRestBaseUrl()}/wp-lzer/v1${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.message || 'İşlem tamamlanamadı.'
    throw new Error(message)
  }

  return data as T
}

export function loginCustomer(input: { email: string; password: string; remember?: boolean }) {
  return accountRequest<AccountPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function registerCustomer(input: {
  first_name: string
  last_name: string
  email: string
  phone?: string
  password: string
  terms_accepted: boolean
}) {
  return accountRequest<AccountPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function logoutCustomer() {
  return accountRequest<{ ok: boolean }>('/auth/logout', { method: 'POST' })
}

export function getCurrentCustomer() {
  return accountRequest<AccountPayload>('/customer/me')
}

export function getCustomerOrders() {
  return accountRequest<{ orders: AccountOrder[] }>('/customer/orders')
}

export function getCustomerAddresses() {
  return accountRequest<Pick<AccountPayload, 'addresses'>>('/customer/addresses')
}

export function updateCustomerAddresses(addresses: AccountPayload['addresses']) {
  return accountRequest<Pick<AccountPayload, 'addresses'>>('/customer/addresses', {
    method: 'PUT',
    body: JSON.stringify(addresses),
  })
}

export function trackOrder(input: { email: string; order_number: string }) {
  return accountRequest<OrderTrackingPayload>('/order-tracking', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
