interface ApiEnvelope<T> {
  success: boolean
  data?: T
  error?: {
    message?: string
  }
}

export interface LeaveRequest {
  leaveId: string
  employeeId: string
  leaveType: string
  startDate: string
  endDate: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface SubmitLeavePayload {
  employeeId: string
  leaveType: string
  startDate: string
  endDate: string
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

async function leaveRequest<T>(
  path: string,
  method: string,
  payload?: unknown
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('Missing VITE_API_BASE_URL.')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  })

  const data = (await response.json()) as ApiEnvelope<T>

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error?.message || 'Leave request failed.')
  }

  return data.data
}

export function submitLeave(payload: SubmitLeavePayload) {
  return leaveRequest<LeaveRequest>('/v1/leaves', 'POST', payload)
}