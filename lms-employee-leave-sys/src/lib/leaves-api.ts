export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

type ApiEnvelope<T> = {
  success: boolean
  data?: T
  error?: {
    message?: string
  }
}

type ListLeavesResponse = {
  items: LeaveRequest[]
  count: number
  nextToken?: string
}

export type LeaveRequest = {
  leaveId: string
  employeeId: string
  employeeName?: string | null
  employeeEmail?: string | null
  leaveType: string
  startDate: string
  endDate: string
  status: LeaveStatus
  createdAt: string
  updatedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('Missing VITE_API_BASE_URL.')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  const data = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || !data.success || data.data === undefined) {
    throw new Error(data.error?.message || 'Request failed.')
  }

  return data.data
}

export async function listLeavesByStatus(status: LeaveStatus, limit = 100): Promise<LeaveRequest[]> {
  const items: LeaveRequest[] = []
  let nextToken: string | undefined

  do {
    const query = new URLSearchParams({
      status,
      limit: String(limit),
      ...(nextToken ? { nextToken } : {}),
    })

    const page = await apiRequest<ListLeavesResponse>(`/v1/leaves?${query.toString()}`)
    items.push(...page.items)
    nextToken = page.nextToken
  } while (nextToken)

  return items
}

export async function approveLeave(leaveId: string, reviewedBy: string) {
  return apiRequest<{ message: string; leaveId: string }>(`/v1/leaves/${leaveId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ reviewedBy }),
  })
}

export async function rejectLeave(leaveId: string, reviewedBy: string, rejectionReason: string) {
  return apiRequest<{ message: string; leaveId: string }>(`/v1/leaves/${leaveId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reviewedBy, rejectionReason }),
  })
}
