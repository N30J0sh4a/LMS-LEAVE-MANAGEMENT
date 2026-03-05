import { auth } from './firebase'

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
  department?: string | null
  position?: string | null
  reason?: string | null
  status: LeaveStatus
  createdAt: string
  updatedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

export type SubmitLeavePayload = {
  employeeId: string
  employeeName: string
  employeeEmail: string
  leaveType: string
  startDate: string
  endDate: string
  department: string
  position: string
  reason: string
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function getAuthorizationHeader(): Promise<Record<string, string>> {
  const currentUser = auth.currentUser

  if (!currentUser) {
    throw new Error('No authenticated session. Please sign in again.')
  }

  const idToken = await currentUser.getIdToken()
  return {
    Authorization: `Bearer ${idToken}`,
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('Missing VITE_API_BASE_URL.')
  }

  const authHeader = await getAuthorizationHeader()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
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

export async function listEmployeeLeaves(
  employeeId: string,
  options?: {
    status?: LeaveStatus
    limit?: number
  }
): Promise<LeaveRequest[]> {
  const items: LeaveRequest[] = []
  let nextToken: string | undefined
  const limit = options?.limit ?? 100

  do {
    const query = new URLSearchParams({
      limit: String(limit),
      ...(options?.status ? { status: options.status } : {}),
      ...(nextToken ? { nextToken } : {}),
    })

    const page = await apiRequest<ListLeavesResponse>(
      `/v1/employees/${encodeURIComponent(employeeId)}/leaves?${query.toString()}`
    )
    items.push(...page.items)
    nextToken = page.nextToken
  } while (nextToken)

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function submitLeave(payload: SubmitLeavePayload) {
  return apiRequest<LeaveRequest>('/v1/leaves', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getLeave(leaveId: string) {
  return apiRequest<LeaveRequest>(`/v1/leaves/${encodeURIComponent(leaveId)}`)
}

export function cancelLeave(leaveId: string, employeeId: string) {
  return apiRequest<{ message: string; leaveId: string }>(
    `/v1/leaves/${encodeURIComponent(leaveId)}/cancel`,
    {
      method: 'PATCH',
      body: JSON.stringify({ employeeId }),
    }
  )
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
